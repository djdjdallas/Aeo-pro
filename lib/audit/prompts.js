// lib/audit/prompts.js
// Smart prompt generator — uses Claude Haiku to generate buyer-intent prompts
// from actual page context, not generic taxonomy

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generates 6 high-quality buyer-intent audit prompts using Claude Haiku.
 * Understands the specific product/service category, buyer job-to-be-done,
 * and includes competitor displacement queries.
 *
 * @param {object} context
 * @param {string} context.businessName - Business name
 * @param {string} [context.businessDescription] - User-provided "what does this business do and who is it for"
 * @param {string} [context.businessType] - Generic category (fallback only)
 * @param {string} [context.location] - Business location if local
 * @param {string} [context.pageTitle] - Page <title> tag
 * @param {string} [context.metaDescription] - Meta description
 * @param {string[]} [context.h1s] - H1 headings from the page
 * @param {string[]} [context.h2s] - H2 headings from the page (first few)
 * @param {string} [context.textSample] - First ~500 chars of body text
 * @returns {Promise<string[]>} Array of 6 prompt strings
 */
export async function generateAuditPrompts(context) {
  const {
    businessName,
    businessDescription,
    businessType,
    location,
    pageTitle,
    metaDescription,
    h1s,
    h2s,
    textSample,
  } = context;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate exactly 6 search prompts that a REAL BUYER would type into ChatGPT or Perplexity when looking for what this business sells. These will be used to test whether AI recommends this business.

<business>
  <name>${businessName || "unknown"}</name>
  <description>${businessDescription || "not provided"}</description>
  <category>${businessType || "not provided"}</category>
  <location>${location || "not provided"}</location>
  <page_title>${pageTitle || "not provided"}</page_title>
  <meta_description>${metaDescription || "not provided"}</meta_description>
  <headings>${[...(h1s || []), ...(h2s || [])].slice(0, 6).join(" | ") || "none"}</headings>
  <page_text_sample>${(textSample || "").slice(0, 500) || "none"}</page_text_sample>
</business>

CRITICAL RULES:
1. First, identify the SPECIFIC product category — not the business model. "PDF bank statement converter" not "SaaS software". "Emergency plumber" not "contractor". "Med spa for Botox" not "medical practice".
2. Generate from the BUYER'S JOB-TO-BE-DONE — what problem does someone have right before they'd buy this? Write prompts as a buyer would actually phrase them in a chat with AI.
3. Mix these 3 types:
   - 3 purchase-intent queries: "best [specific product] for [specific use case]", "how to [solve specific problem the product solves]", "tool/service to [specific job-to-be-done]"
   - 1 comparison/alternative query: "${businessName} vs [likely competitor]" or "alternatives to [category leader] for [specific need]" or "best [competitor] alternative for [niche]"
   - 1 problem-first query: "how do I [the exact problem buyers face before finding this product]"
   - 1 branded query: "is ${businessName} good for [the specific thing it does]" or "${businessName} reviews for [specific use case]"
4. ${location ? `This is a LOCAL business in ${location} — include location in 2-3 prompts naturally.` : "This appears to be an online/national business — do NOT add random locations."}
5. Be SPECIFIC. Never use the generic business category. Use the actual product/service niche.
6. Every prompt must be something a real person would actually type into an AI assistant.

Return ONLY a JSON array of exactly 6 strings. No explanation.`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in response");

    const prompts = JSON.parse(match[0]);
    if (Array.isArray(prompts) && prompts.length >= 4) {
      return prompts.slice(0, 6);
    }
    throw new Error("Invalid prompt array");
  } catch (err) {
    console.error("Smart prompt generation failed, using fallback:", err.message);
    return buildFallbackPrompts(context);
  }
}

/**
 * Fallback template prompts — only used if Haiku call fails.
 * Still tries to be smarter than pure taxonomy by using page context.
 */
function buildFallbackPrompts({ businessName, businessDescription, businessType, location, metaDescription }) {
  const name = businessName?.trim() || "";
  // Use description or meta as the product context — much better than generic type
  const productContext = businessDescription?.trim()
    || metaDescription?.trim()
    || businessType?.trim()
    || "";
  const loc = location?.trim() || "";

  // Extract a rough product phrase from description
  const shortContext = productContext.split(/[.!?]/)[0]?.trim().toLowerCase() || "";

  if (loc && shortContext) {
    return [
      `best ${shortContext} in ${loc}`,
      `who do you recommend for ${shortContext} near ${loc}`,
      `I need ${shortContext} in ${loc}, who should I use?`,
      name ? `is ${name} good for ${shortContext}` : `top rated ${shortContext} ${loc}`,
      `${shortContext} reviews and recommendations ${loc}`,
      name ? `${name} vs competitors for ${shortContext}` : `best ${shortContext} options in ${loc}`,
    ];
  }

  if (shortContext) {
    return [
      `best ${shortContext}`,
      `how to ${shortContext.replace(/^(a |an |the )/i, "")}`,
      name ? `is ${name} good for ${shortContext}` : `top ${shortContext} tools`,
      `${shortContext} recommendations`,
      name ? `${name} alternatives` : `best options for ${shortContext}`,
      name ? `${name} reviews` : `${shortContext} comparison`,
    ];
  }

  if (name) {
    return [
      `tell me about ${name}`,
      `is ${name} any good`,
      `${name} reviews`,
      `what does ${name} do`,
      `${name} alternatives`,
      `would you recommend ${name}`,
    ];
  }

  return [
    "best solution for my problem",
    "top rated tools and services",
    "what do you recommend",
    "best options available",
    "help me find the right solution",
    "trusted providers",
  ];
}
