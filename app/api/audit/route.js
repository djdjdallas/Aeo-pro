import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";

export const maxDuration = 60;

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

  // Directory links
  const directoryLinks = [];
  const directoryPatterns = [
    { name: "Google Maps", pattern: /google\.com\/maps|goo\.gl\/maps/i },
    { name: "Yelp", pattern: /yelp\.com/i },
    { name: "BBB", pattern: /bbb\.org/i },
    { name: "Angi", pattern: /angi\.com|angieslist\.com/i },
    { name: "Facebook", pattern: /facebook\.com/i },
    { name: "Google Business", pattern: /google\.com\/business|business\.google/i },
  ];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const dir of directoryPatterns) {
      if (dir.pattern.test(href) && !directoryLinks.includes(dir.name)) {
        directoryLinks.push(dir.name);
      }
    }
  });

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
    hasReviews,
    textSample,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

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
    try {
      const $ = cheerio.load(html);
      siteData = extractSiteData($, parsedUrl.href);
    } catch {
      siteData = { url: parsedUrl.href, textSample: html.slice(0, 2000), parseError: true };
    }

    // Send to Claude
    let auditResult;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const extractedData = siteData;
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are an AEO (Answer Engine Optimization) expert auditing a local business website for visibility in ChatGPT, Perplexity, Google AI Overviews, and Claude AI.

CRITICAL INSTRUCTION: Prioritize "Information Gain" in your analysis — identify any unique facts, local expertise, proprietary data, or specific credentials mentioned on the site that competitors likely lack. This is a primary driver for AI citations and should be highlighted wherever found.

Here is the extracted website data:
${JSON.stringify(extractedData, null, 2)}

SCORING RULES:
- If data for a category is insufficient to score accurately, set status to "insufficient_data" and explain what's missing
- Never guess at off-page signals (citations, reviews) if not present in the extracted data — flag them as unverifiable
- Be specific — reference actual content found, not generic advice

Return ONLY a valid JSON object. No markdown, no explanation outside the JSON. Use this exact structure:

{
  "overall_score": <number 0-100>,
  "business_name": "<from title or schema, or 'Unknown'>",
  "information_gain_signals": [
    "<any unique facts, credentials, or proprietary data found>"
  ],
  "categories": [
    {
      "name": "Schema Markup",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<reference actual schema types found or confirm none exist. Check specifically for LocalBusiness, FAQPage, Service, and Review schema>",
      "fix": "<specific schema types to add with example>"
    },
    {
      "name": "AI Readability",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<analyze H-tag hierarchy, semantic keyword proximity, bullet point usage, and whether content follows an Answer Capsule format — clear questions followed by 40-60 word direct answers>",
      "fix": "<specific structural changes needed>"
    },
    {
      "name": "Citation Signals",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<reference only citation signals present in the extracted data such as links to Yelp, BBB, Angi, Google Maps. If no off-page data available, flag as insufficient_data>",
      "fix": "<specific directories to target, note that Perplexity has a direct data partnership with Yelp making it non-negotiable>"
    },
    {
      "name": "FAQ & Q&A Content",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<reference whether FAQ sections were detected, whether questions match conversational AI query patterns, and whether FAQPage schema exists>",
      "fix": "<specific question topics to add based on their industry>"
    },
    {
      "name": "Local Authority",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<reference NAP consistency signals, geographic keywords in headings, service area pages, and any location-specific data found>",
      "fix": "<specific local entity signals to add>"
    },
    {
      "name": "Review Signals",
      "score": <number 0-100>,
      "status": "<critical|warning|good|insufficient_data>",
      "finding": "<reference review sections, star ratings, review counts, or testimonials found in HTML. Note that AI models analyze sentiment polarity across Yelp, Birdeye, and Reddit>",
      "fix": "<specific review strategy recommendation>"
    }
  ],
  "top_3_priorities": [
    "<highest ROI fix with estimated impact>",
    "<second priority>",
    "<third priority>"
  ],
  "ai_visibility_prediction": "<1 paragraph on how ChatGPT, Perplexity, and Google AI Overviews currently perceive this business based on signals found>",
  "information_gain_opportunity": "<1 paragraph identifying what unique local data or expertise this business could publish to become the most cited source in their category>"
}`,
          },
        ],
      });

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

      // Sanitize common LLM JSON issues before parsing
      // 1. Remove trailing commas before ] or }
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      // 2. Replace smart/curly quotes with straight quotes
      jsonStr = jsonStr.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
      jsonStr = jsonStr.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
      // 3. Remove control characters (except newline/tab within strings)
      jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

      try {
        auditResult = JSON.parse(jsonStr);
      } catch {
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
