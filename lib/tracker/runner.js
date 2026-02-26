// lib/tracker/runner.js
// The brain of the tracker — runs prompts against AI models and saves results

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let _perplexity = null;
function getPerplexityClient() {
  if (!_perplexity) {
    _perplexity = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });
  }
  return _perplexity;
}

const SYSTEM_PROMPT = `You are a helpful local search assistant. When asked about local businesses
or services, provide specific, honest recommendations based on what you know.
Include business names, explain why you'd recommend them, and be direct and helpful.`;

/**
 * Shared mention-detection logic used by all AI models.
 */
function parseMentionFromResponse(fullResponse, businessName, targetUrl) {
  const lowerResponse = fullResponse.toLowerCase();
  const lowerBusiness = businessName.toLowerCase();

  let wasMentioned = false;
  let mentionRank = null;
  let responseSnippet = null;

  if (lowerResponse.includes(lowerBusiness)) {
    wasMentioned = true;

    const sentences = fullResponse.split(/[.!?]+/);
    const mentionIndex = sentences.findIndex((s) =>
      s.toLowerCase().includes(lowerBusiness)
    );
    mentionRank = mentionIndex + 1;

    const mentionPos = lowerResponse.indexOf(lowerBusiness);
    const start = Math.max(0, mentionPos - 100);
    const end = Math.min(fullResponse.length, mentionPos + 200);
    responseSnippet = "..." + fullResponse.slice(start, end) + "...";
  }

  // Also check for URL/domain mentions (Perplexity-style citation)
  if (!wasMentioned && targetUrl) {
    const domain = targetUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
    if (domain && lowerResponse.includes(domain.toLowerCase())) {
      wasMentioned = true;
      responseSnippet = "Business domain was cited in AI response";
    }
  }

  return { wasMentioned, mentionRank, responseSnippet };
}

/**
 * Call Claude and return the raw text response.
 */
async function callClaude(prompt) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].text;
}

/**
 * Call Perplexity (OpenAI-compatible API) and return the raw text response.
 * Uses llama-3.1-sonar-small-128k-online for real-time web search results.
 */
async function callPerplexity(prompt) {
  const completion = await getPerplexityClient().chat.completions.create({
    model: "llama-3.1-sonar-small-128k-online",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Checks a single prompt against an AI model and detects if the business is mentioned.
 */
async function checkPromptAgainstAI(prompt, businessName, targetUrl, model) {
  let fullResponse = "";

  if (model === "claude") {
    fullResponse = await callClaude(prompt);
  } else if (model === "perplexity") {
    fullResponse = await callPerplexity(prompt);
  }

  const { wasMentioned, mentionRank, responseSnippet } =
    parseMentionFromResponse(fullResponse, businessName, targetUrl);

  return {
    ai_model: model,
    was_mentioned: wasMentioned,
    mention_rank: mentionRank,
    response_snippet: responseSnippet,
    full_response: fullResponse,
  };
}

/**
 * Runs all active tracked prompts for a client across all configured AI models.
 * Saves every result to Supabase for historical tracking.
 */
export async function runTrackerForClient(clientId) {
  const supabase = createServerClient();

  const { data: client, error: clientError } = await supabase
    .from("tracker_clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  const { data: prompts, error: promptsError } = await supabase
    .from("tracked_prompts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (promptsError || !prompts?.length) {
    return { checked: 0, mentioned: 0, results: [] };
  }

  const models = ["claude", "perplexity"];
  const allResults = [];

  for (const prompt of prompts) {
    for (const model of models) {
      try {
        const result = await checkPromptAgainstAI(
          prompt.prompt,
          client.business_name,
          client.target_url,
          model
        );

        const { error: insertError } = await supabase
          .from("prompt_results")
          .insert({
            prompt_id: prompt.id,
            client_id: clientId,
            ai_model: model,
            was_mentioned: result.was_mentioned,
            mention_rank: result.mention_rank,
            response_snippet: result.response_snippet,
            full_response: result.full_response,
          });

        if (insertError) {
          console.error("Failed to save result:", insertError);
        }

        allResults.push({ prompt: prompt.prompt, model, ...result });

        // Rate limit buffer between API calls
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error checking "${prompt.prompt}" on ${model}:`, err.message);
      }
    }
  }

  return {
    checked: allResults.length,
    mentioned: allResults.filter((r) => r.was_mentioned).length,
    results: allResults,
  };
}

/**
 * Uses Claude to generate realistic customer questions for a business type + location.
 * These become the tracked prompts we monitor over time.
 */
export async function generatePromptsForClient(businessType, location, businessName = "", differentiators = "") {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `<task>
Generate 10 high-intent prompts that a real buyer would type into ChatGPT, Perplexity, or Claude when looking for a solution like this business provides.
</task>

<business>
  <type>${businessType}</type>
  <location>${location || "none (online/national)"}</location>
  <name>${businessName || "unknown"}</name>
  <differentiators>${differentiators || "none provided"}</differentiators>
</business>

<instructions>
Step 1 — Classify this business into exactly ONE category:
- local_service: Serves a specific geographic area (plumber, dentist, roofing company, restaurant)
- saas_tool: Software product or online tool (AI editing tool, CRM, analytics platform)
- done_for_you_service: Agency or consultancy that delivers outcomes remotely (SEO agency, marketing firm, design studio)
- hybrid: Combines local presence with digital services (local marketing agency, regional IT firm)

Step 2 — Generate prompts using the patterns for that category:

FOR local_service:
- "best [type] in [location]"
- "who should I call for [specific problem] in [location]"
- "most trusted [type] near [location]"
- "[type] [location] reviews"
- "emergency [type] [location]"
- Mix in comparison and cost queries

FOR saas_tool:
- "best [type] for [use case]"
- "what tool should I use to [solve problem]"
- "[type] vs [competitor category]"
- "top [type] tools in ${new Date().getFullYear()}"
- "[differentiator]-focused [type]"
- Focus on capabilities, comparisons, and specific features — NO location references

FOR done_for_you_service:
- "best [type] for [target client type]"
- "who can help me [desired outcome]"
- "[type] that specializes in [differentiator]"
- "hire a [type] for [specific deliverable]"
- "top [type] agencies for [industry/niche]"
- Focus on outcomes, specialization, and trust signals — location only if provided

FOR hybrid:
- Mix location-based AND capability-based prompts
- Include both "near me" and "best for [use case]" styles

Step 3 — Quality rules:
- Every prompt must have PURCHASE INTENT (someone ready to buy/hire/subscribe, not just researching a topic)
- Prompts should be the kind that trigger AI to recommend specific businesses/tools
- NO generic educational queries like "what is [type]" or "how does [type] work"
- NO prompts that only the business owner would search for
- Make prompts conversational and natural — how real people actually ask AI assistants
- If differentiators were provided, weave 2-3 of them into prompts naturally
</instructions>

Return ONLY a valid JSON array of 10 strings. No explanation, no markdown, just the array.
Example: ["question one?", "question two?"]`,
      },
    ],
  });

  const responseText = message.content[0].text;

  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Failed to parse generated prompts, using fallbacks:", err.message);
    const base = location
      ? [
          `best ${businessType} in ${location}`,
          `top rated ${businessType} near ${location}`,
          `who should I hire for ${businessType} in ${location}`,
          `most trusted ${businessType} ${location}`,
          `affordable ${businessType} ${location}`,
        ]
      : [
          `best ${businessType} tools in ${new Date().getFullYear()}`,
          `top rated ${businessType} for small business`,
          `what is the best ${businessType} to use`,
          `${businessType} comparison and reviews`,
          `most recommended ${businessType}`,
        ];
    return base;
  }
}
