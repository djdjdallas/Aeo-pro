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
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `You are an AEO (Answer Engine Optimization) expert. Audit this local business website for AI search visibility.

Website data:
${JSON.stringify(extractedData, null, 2)}

RULES:
- Keep each "finding" and "fix" to 1-2 sentences max
- If data is insufficient, use status "insufficient_data"
- Be specific — reference actual content found
- Return ONLY valid JSON, no markdown fences, no text outside the JSON

JSON structure:
{
  "overall_score": <0-100>,
  "business_name": "<from title/schema or 'Unknown'>",
  "information_gain_signals": ["<unique facts or credentials found>"],
  "categories": [
    {"name": "Schema Markup", "score": <0-100>, "status": "<critical|warning|good|insufficient_data>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "AI Readability", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Citation Signals", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "FAQ & Q&A Content", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Local Authority", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"},
    {"name": "Review Signals", "score": <0-100>, "status": "<status>", "finding": "<1-2 sentences>", "fix": "<1-2 sentences>"}
  ],
  "top_3_priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "ai_visibility_prediction": "<1 short paragraph>",
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
