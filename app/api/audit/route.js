import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";
import { generateAuditPrompts } from "@/lib/audit/prompts";
import { runMultiPromptAiCheck } from "@/lib/audit/ai-check";
import { buildCitationTiers } from "@/lib/audit/citation-tiers";

export const maxDuration = 120;

function extractSiteData($, url) {
  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const metaRobots = $('meta[name="robots"]').attr("content") || "";

  // Headings
  const h1s = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1s.push(text);
  });
  const h2s = [];
  $("h2")
    .slice(0, 10)
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2s.push(text);
    });
  const h3s = [];
  $("h3")
    .slice(0, 10)
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text) h3s.push(text);
    });

  // JSON-LD schema blocks
  const schemas = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      schemas.push(parsed);
    } catch {
      // skip malformed JSON-LD
    }
  });

  // FAQ detection
  const hasFaqSection =
    $('[class*="faq" i], [id*="faq" i], details, [class*="accordion" i]')
      .length > 0;
  const faqCount = $(
    '[class*="faq" i] li, [class*="faq" i] dt, details, [class*="accordion" i] > *'
  ).length;

  // Image alt text stats
  const images = $("img");
  const totalImages = images.length;
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt && alt.trim()) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
    }
  });

  // Phone numbers
  const bodyText = $("body").text();
  const phoneRegex =
    /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = [...new Set((bodyText.match(phoneRegex) || []).slice(0, 5))];

  // Directory links (with ProductHunt added)
  const directoryLinks = [];
  const directoryPatterns = [
    { name: "Google Maps", pattern: /google\.com\/maps|goo\.gl\/maps/i },
    { name: "Yelp", pattern: /yelp\.com/i },
    { name: "BBB", pattern: /bbb\.org/i },
    { name: "Angi", pattern: /angi\.com|angieslist\.com/i },
    { name: "Facebook", pattern: /facebook\.com/i },
    { name: "Google Business", pattern: /google\.com\/business|business\.google/i },
    { name: "Trustpilot", pattern: /trustpilot\.com/i },
    { name: "G2", pattern: /g2\.com/i },
    { name: "Capterra", pattern: /capterra\.com/i },
    { name: "HomeAdvisor", pattern: /homeadvisor\.com/i },
    { name: "ProductHunt", pattern: /producthunt\.com/i },
  ];

  // Extract YouTube, Reddit links alongside directory links
  const youtubeLinks = [];
  const redditLinks = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const dir of directoryPatterns) {
      if (dir.pattern.test(href) && !directoryLinks.includes(dir.name)) {
        directoryLinks.push(dir.name);
      }
    }
    if (/youtube\.com|youtu\.be/i.test(href) && !youtubeLinks.includes(href)) {
      youtubeLinks.push(href);
    }
    if (/reddit\.com/i.test(href) && !redditLinks.includes(href)) {
      redditLinks.push(href);
    }
  });

  // YouTube iframe embeds
  const youtubeIframes = $('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').length;

  // Review/testimonial detection
  const hasReviews =
    $(
      '[class*="review" i], [class*="testimonial" i], [id*="review" i], [id*="testimonial" i]'
    ).length > 0;

  // Body text sample
  const textSample = bodyText.replace(/\s+/g, " ").trim().slice(0, 2000);

  return {
    url,
    title,
    metaDescription,
    canonical,
    metaRobots,
    headings: { h1s, h2s, h3s },
    schemas,
    faq: { hasFaqSection, faqCount },
    images: { total: totalImages, withAlt: imagesWithAlt, withoutAlt: imagesWithoutAlt },
    phones,
    directoryLinks,
    youtubeLinks,
    redditLinks,
    youtubeIframes,
    hasReviews,
    textSample,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, business_name, business_type, business_description } = body;

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL. Please enter a valid website address." },
        { status: 400 }
      );
    }

    // Fetch HTML
    let html;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(parsedUrl.href, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        return NextResponse.json(
          { error: "URL does not point to an HTML page. Please enter a website URL." },
          { status: 400 }
        );
      }

      html = await response.text();

      // Limit HTML to 500KB
      if (html.length > 500000) {
        html = html.slice(0, 500000);
      }
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Website took too long to respond. Please try again." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Could not reach this website. Please check the URL and try again." },
        { status: 400 }
      );
    }

    // Parse with Cheerio
    let siteData;
    let $cheerio;
    try {
      $cheerio = cheerio.load(html);
      siteData = extractSiteData($cheerio, parsedUrl.href);
    } catch {
      siteData = { url: parsedUrl.href, textSample: html.slice(0, 2000), parseError: true };
      $cheerio = null;
    }

    // Determine business context — prefer user input, fall back to inference
    const hostname = parsedUrl.hostname;
    const inferredName = siteData.title?.split(/[|\-–—]/).map((s) => s.trim())[0] || hostname;
    const inferredType = siteData.schemas?.find((s) => s["@type"])?.["@type"] || "";
    const inferredLocation = siteData.schemas?.find((s) => s.address?.addressLocality)?.address?.addressLocality || "";

    const resolvedBusinessName = business_name?.trim() || inferredName;
    const resolvedBusinessType = business_type?.trim() || inferredType;
    const resolvedLocation = inferredLocation;

    // Phase 1: Technical Checks — run in parallel (llms.txt, robots.txt, Bing, Wikipedia, IndexNow)
    const origin = parsedUrl.origin;
    const techChecks = { llmsTxt: null, robotsTxt: null, bingIndexed: null, wikipedia: null, indexNow: null };

    // Build Wikipedia slug from business name
    const wikiSlug = resolvedBusinessName.replace(/\s+/g, "_");

    const [llmsResult, robotsResult, bingResult, wikiResult, indexNowResult] = await Promise.allSettled([
      // llms.txt check
      fetch(`${origin}/llms.txt`, { signal: AbortSignal.timeout(5000) })
        .then(async (r) => {
          if (!r.ok) return { exists: false };
          const text = await r.text();
          return { exists: true, preview: text.slice(0, 500) };
        }),
      // robots.txt check
      fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) })
        .then(async (r) => {
          if (!r.ok) return { exists: false, aiCrawlers: {} };
          const text = await r.text();
          const aiCrawlers = [
            "GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot",
            "Claude-SearchBot", "Google-Extended", "ChatGPT-User", "anthropic-ai",
          ];
          const crawlerStatus = {};
          for (const crawler of aiCrawlers) {
            const regex = new RegExp(`User-agent:\\s*${crawler}[\\s\\S]*?(?=User-agent:|$)`, "i");
            const match = text.match(regex);
            if (match) {
              crawlerStatus[crawler] = match[0].toLowerCase().includes("disallow: /") ? "blocked" : "allowed";
            } else {
              crawlerStatus[crawler] = "not specified";
            }
          }
          return { exists: true, aiCrawlers: crawlerStatus };
        }),
      // Bing indexation check
      fetch(`https://www.bing.com/search?q=site:${hostname}`, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      }).then(async (r) => {
        const text = await r.text();
        const hasResults = !text.includes("No results found") && !text.includes("There are no results for");
        return { indexed: hasResults };
      }),
      // Wikipedia existence check
      fetch(`https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`, {
        signal: AbortSignal.timeout(5000),
        method: "HEAD",
      }).then((r) => ({ exists: r.status === 200 })),
      // IndexNow key file check
      fetch(`${origin}/indexnow.txt`, { signal: AbortSignal.timeout(5000) })
        .then(async (r) => {
          if (!r.ok) return { exists: false };
          return { exists: true };
        }),
    ]);

    if (llmsResult.status === "fulfilled") techChecks.llmsTxt = llmsResult.value;
    if (robotsResult.status === "fulfilled") techChecks.robotsTxt = robotsResult.value;
    if (bingResult.status === "fulfilled") techChecks.bingIndexed = bingResult.value?.indexed ?? null;
    if (wikiResult.status === "fulfilled") techChecks.wikipedia = wikiResult.value;
    if (indexNowResult.status === "fulfilled") techChecks.indexNow = indexNowResult.value;

    siteData.techChecks = techChecks;

    // Phase 2: Multi-prompt AI Visibility Check (6 prompts x 2 models = 12 checks in parallel)
    let liveAiCheck = null;
    try {
      const auditPrompts = await generateAuditPrompts({
        businessName: resolvedBusinessName,
        businessDescription: business_description?.trim() || "",
        businessType: resolvedBusinessType,
        location: resolvedLocation,
        pageTitle: siteData.title || "",
        metaDescription: siteData.metaDescription || "",
        h1s: siteData.headings?.h1s || [],
        h2s: siteData.headings?.h2s || [],
        textSample: siteData.textSample || "",
      });
      liveAiCheck = await runMultiPromptAiCheck(auditPrompts, resolvedBusinessName, parsedUrl.href);
    } catch (aiCheckError) {
      console.error("Multi-prompt AI check failed:", aiCheckError.message);
      // Non-fatal — continue without live check
    }

    // Phase 3: Build citation tiers from site data + tech check results
    const bodyText = siteData.textSample || "";
    const citationTiers = buildCitationTiers({
      businessName: resolvedBusinessName,
      $: $cheerio,
      directoryLinks: siteData.directoryLinks || [],
      wikipediaExists: techChecks.wikipedia?.exists ?? false,
      bodyText,
    });

    // Phase 4: Claude Analysis — expanded prompt with multi-prompt data + citation tiers
    let auditResult;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // Build AI check summary for Claude
      const aiCheckSummary = liveAiCheck ? {
        total_checks: liveAiCheck.total_checks,
        client_mentions: liveAiCheck.client_mentions,
        mention_rate: liveAiCheck.mention_rate,
        prompts_used: liveAiCheck.prompts_used,
        share_of_voice_top_5: Object.entries(liveAiCheck.share_of_voice)
          .sort((a, b) => b[1].mentions - a[1].mentions)
          .slice(0, 5)
          .map(([name, data]) => `${name}: ${data.mentions}/${data.total} (${data.percentage}%)`),
      } : null;

      // Build crawler access summary
      const crawlerData = techChecks.robotsTxt?.aiCrawlers || {};
      const blockedCrawlers = Object.entries(crawlerData)
        .filter(([, status]) => status === "blocked")
        .map(([name]) => name);

      const extractedData = {
        ...siteData,
        ai_check_summary: aiCheckSummary,
        citation_tier_summary: citationTiers,
        blocked_ai_crawlers: blockedCrawlers,
      };

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `You are an AEO (Answer Engine Optimization) expert. Audit this business website for AI search visibility.

Website data:
${JSON.stringify(extractedData, null, 2)}

RULES:
- Keep each "finding" and "fix" to 1-2 sentences max
- If data is insufficient, use status "insufficient_data"
- Be specific — reference actual content found
- The AI check summary shows real results from querying ChatGPT and Perplexity with ${liveAiCheck?.total_checks || 0} checks
- ${blockedCrawlers.length > 0 ? `CRITICAL: ${blockedCrawlers.length} AI crawlers are BLOCKED in robots.txt: ${blockedCrawlers.join(", ")}. Emphasize this heavily in AI Accessibility.` : "No AI crawlers are blocked in robots.txt."}
- Citation tiers show presence across 6 citation source types
- Return ONLY valid JSON, no markdown fences, no text outside the JSON

JSON structure:
{
  "overall_score": <0-100>,
  "business_name": "<from title/schema or '${resolvedBusinessName}'>",
  "information_gain_signals": ["<unique facts or credentials found>"],
  "categories": [
    {"name": "Schema Markup", "score": <0-100>, "status": "<critical|warning|good|insufficient_data>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "AI Readability", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Citation Signals", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences referencing citation tier data>", "fix": "<1-2 sentences>"},
    {"name": "FAQ & Q&A Content", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Local Authority", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Review Signals", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "AI Accessibility", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences about llms.txt, robots.txt AI crawler access, blocked crawlers, and Bing indexation>", "fix": "<1-2 sentences>"}
  ],
  "top_3_priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "ai_visibility_prediction": {
    "current_appearances": ${liveAiCheck?.client_mentions || 0},
    "total_checks": ${liveAiCheck?.total_checks || 0},
    "current_rate": ${liveAiCheck?.mention_rate || 0},
    "predicted_rate_after_optimization": <estimated 0-100 based on current gaps>,
    "ninety_day_target": "<e.g. Appear in 7/12 AI responses>",
    "narrative": "<1-2 sentences: Based on current citation profile, schema gaps, and AI crawler access, here is the realistic prediction>"
  },
  "information_gain_opportunity": "<1 short paragraph>"
}`,
          },
        ],
      });

      // Check if the response was truncated
      if (message.stop_reason === "max_tokens") {
        console.error("Claude response truncated — hit max_tokens");
        throw new Error("AI response was truncated");
      }

      const responseText = message.content[0].text;

      // Extract the JSON string from the response
      let jsonStr = responseText.trim();

      // Strip markdown code fences if present
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
      } else {
        // Extract outermost JSON object
        const objMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objMatch) {
          jsonStr = objMatch[0];
        }
      }

      // Sanitize common LLM JSON issues
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      jsonStr = jsonStr.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
      jsonStr = jsonStr.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
      jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

      try {
        auditResult = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error("JSON parse failed. Raw response:", responseText.slice(0, 500));
        throw new Error("Could not parse Claude response as JSON");
      }
    } catch (claudeError) {
      console.error("Claude API error:", claudeError);
      return NextResponse.json(
        { error: "AI analysis failed. Please try again in a moment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audit: {
        ...auditResult,
        url: parsedUrl.href,
        date: new Date().toISOString(),
        live_ai_check: liveAiCheck,
        citation_tiers: citationTiers,
        ai_crawler_access: techChecks.robotsTxt?.aiCrawlers || {},
        indexnow: techChecks.indexNow,
      },
    });
  } catch (err) {
    console.error("Audit API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
