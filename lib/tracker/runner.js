// lib/tracker/runner.js
// The brain of the tracker — runs prompts against AI models and saves results

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase";
import { getModelsForPlan, PLAN_SHOTS, estimateCost, logApiCost } from "@/lib/tracker/cost";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let _openai = null;
function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

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
export function parseMentionFromResponse(fullResponse, businessName, targetUrl) {
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
 * Call ChatGPT and return the raw text response.
 */
async function callChatGPT(prompt) {
  const completion = await getOpenAIClient().chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Call Perplexity (OpenAI-compatible API) and return the raw text response + citations.
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
  return {
    text: completion.choices[0].message.content,
    citations: completion.citations || [],
  };
}

/**
 * Call Google Gemini with grounded search for real-time results.
 * Uses native fetch() — no new dependencies required.
 */
async function callGemini(prompt) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] },
        ],
        tools: [{ google_search: {} }],
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n");
}

/**
 * Call DeepSeek (OpenAI-compatible API) for AI search responses.
 * Uses deepseek-chat model.
 */
async function callDeepSeek(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Call Grok (xAI) via OpenAI-compatible API.
 */
async function callGrok(prompt) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY not configured");

  const client = new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
  const completion = await client.chat.completions.create({
    model: "grok-3-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Call Copilot/Bing via OpenAI ChatGPT with web search (uses the same OpenAI API but with
 * web_search_options to simulate Copilot's Bing-backed search behavior).
 */
async function callCopilot(prompt) {
  const completion = await getOpenAIClient().chat.completions.create({
    model: "gpt-4.1",
    web_search_options: { search_context_size: "medium" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Call Meta AI (Llama) via OpenAI-compatible API on together.ai.
 */
async function callMetaAI(prompt) {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error("TOGETHER_API_KEY not configured");

  const client = new OpenAI({ apiKey, baseURL: "https://api.together.xyz/v1" });
  const completion = await client.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}

/**
 * Classify sentiment toward a business using Claude Haiku (fast + cheap).
 * Returns { sentiment: "positive"|"neutral"|"negative", reason: string }
 */
async function classifySentiment(snippet, businessName) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Classify the sentiment toward "${businessName}" in this AI response snippet. Return ONLY valid JSON with no markdown.

Snippet: "${snippet}"

JSON format: {"sentiment": "positive|neutral|negative", "reason": "one sentence explanation"}`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/**
 * Checks a single prompt against an AI model and detects if the business is mentioned.
 */
async function checkPromptAgainstAI(prompt, businessName, targetUrl, model) {
  let fullResponse = "";
  let citations = [];

  if (model === "claude") {
    fullResponse = await callClaude(prompt);
  } else if (model === "chatgpt") {
    fullResponse = await callChatGPT(prompt);
  } else if (model === "perplexity") {
    const pplxResult = await callPerplexity(prompt);
    fullResponse = pplxResult.text;
    citations = pplxResult.citations;
  } else if (model === "gemini") {
    fullResponse = await callGemini(prompt);
  } else if (model === "deepseek") {
    fullResponse = await callDeepSeek(prompt);
  } else if (model === "grok") {
    fullResponse = await callGrok(prompt);
  } else if (model === "copilot") {
    fullResponse = await callCopilot(prompt);
  } else if (model === "meta_ai") {
    fullResponse = await callMetaAI(prompt);
  }

  const { wasMentioned, mentionRank, responseSnippet } =
    parseMentionFromResponse(fullResponse, businessName, targetUrl);

  return {
    ai_model: model,
    was_mentioned: wasMentioned,
    mention_rank: mentionRank,
    response_snippet: responseSnippet,
    full_response: fullResponse,
    citations,
  };
}

/**
 * Process a single result: save to DB, extract competitors, citations, sentiment.
 */
async function processResult(supabase, result, prompt, client, clientId, batchId, shot, shotWindow) {
  const insertRow = {
    prompt_id: prompt.id,
    client_id: clientId,
    ai_model: result.ai_model,
    was_mentioned: result.was_mentioned,
    mention_rank: result.mention_rank,
    response_snippet: result.response_snippet,
    full_response: result.full_response,
    run_batch_id: batchId,
    run_number: shot,
    shot_window: shotWindow || null,
    api_cost_estimate: estimateCost(result.ai_model),
  };

  const { data: inserted, error: insertError } = await supabase
    .from("prompt_results")
    .insert(insertRow)
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to save result:", insertError);
    return;
  }

  // Log API cost
  try {
    await logApiCost({
      clientId,
      aiModel: result.ai_model,
      callType: "tracker",
      estimatedCost: estimateCost(result.ai_model),
      runBatchId: batchId,
    });
  } catch { /* cost logging is non-critical */ }

  if (!inserted?.id) return;

  // Extract competitor mentions
  try {
    const { extractBusinessNames } = await import("@/lib/tracker/competitors");
    const names = extractBusinessNames(result.full_response);
    if (names.length > 0) {
      const mentionRows = names.map((name, idx) => ({
        result_id: inserted.id,
        client_id: clientId,
        business_name: name,
        is_client: name.toLowerCase() === client.business_name.toLowerCase(),
        mention_position: idx + 1,
      }));
      await supabase.from("response_mentions").insert(mentionRows);
    }
  } catch { /* competitors module may not exist yet */ }

  // Extract citations/URLs
  try {
    const { extractUrlsFromText } = await import("@/lib/tracker/citations");
    const clientDomain = client.target_url
      ? client.target_url.replace(/https?:\/\/(www\.)?/, "").split("/")[0]
      : "";
    const urls = extractUrlsFromText(result.full_response);
    if (result.citations?.length) {
      for (const c of result.citations) {
        if (!urls.includes(c)) urls.push(c);
      }
    }
    if (urls.length > 0) {
      const citationRows = urls.map((u) => {
        let domain = "";
        try { domain = new URL(u).hostname.replace(/^www\./, ""); } catch {}
        return {
          result_id: inserted.id,
          client_id: clientId,
          cited_url: u,
          cited_domain: domain,
          is_client_url: clientDomain ? domain.includes(clientDomain) : false,
        };
      });
      await supabase.from("response_citations").insert(citationRows);
    }
  } catch { /* citations module may not exist yet */ }

  // Sentiment analysis (only when mentioned)
  if (result.was_mentioned && result.response_snippet) {
    try {
      const sentiment = await classifySentiment(result.response_snippet, client.business_name);
      if (sentiment) {
        await supabase
          .from("prompt_results")
          .update({ sentiment: sentiment.sentiment, sentiment_reason: sentiment.reason })
          .eq("id", inserted.id);

        // Log sentiment API cost
        try {
          await logApiCost({
            clientId,
            aiModel: "sentiment",
            callType: "sentiment",
            estimatedCost: estimateCost("sentiment"),
            runBatchId: batchId,
          });
        } catch { /* non-critical */ }
      }
    } catch { /* sentiment classification failed */ }
  }
}

/**
 * Runs a single shot for a single client across all prompts and models.
 * Model calls within each prompt are parallelized via Promise.allSettled.
 *
 * @param {string} clientId
 * @param {number} shotNumber - Which shot (1, 2, or 3)
 * @param {string} shotWindow - Time window label (e.g., "morning", "afternoon", "evening")
 */
export async function runClientShot(clientId, shotNumber = 1, shotWindow = null) {
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

  // Plan-based model selection
  const plan = client.plan || "starter";
  const models = getModelsForPlan(plan);

  // Plan-based shot limit — skip if this shot exceeds the plan's allowance
  const maxShots = PLAN_SHOTS[plan] || 3;
  if (shotNumber > maxShots) {
    return { checked: 0, mentioned: 0, results: [], skipped: true };
  }

  // Budget check — pause if over monthly budget
  if (client.monthly_api_budget) {
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: costRows } = await supabase
        .from("api_cost_log")
        .select("estimated_cost")
        .eq("client_id", clientId)
        .gte("created_at", monthStart.toISOString());

      const totalSpent = (costRows || []).reduce((s, r) => s + (Number(r.estimated_cost) || 0), 0);
      if (totalSpent >= Number(client.monthly_api_budget)) {
        console.warn(`Client ${client.business_name} exceeded monthly API budget ($${totalSpent.toFixed(2)} / $${client.monthly_api_budget}). Skipping.`);
        return { checked: 0, mentioned: 0, results: [], skipped: true, reason: "budget_exceeded" };
      }
    } catch { /* budget check failed — continue anyway */ }
  }

  const allResults = [];
  const batchId = crypto.randomUUID();

  // For each prompt, run all models in parallel
  for (const prompt of prompts) {
    const modelPromises = models.map(async (model) => {
      try {
        const result = await checkPromptAgainstAI(
          prompt.prompt,
          client.business_name,
          client.target_url,
          model
        );

        await processResult(supabase, result, prompt, client, clientId, batchId, shotNumber, shotWindow);
        allResults.push({ prompt: prompt.prompt, model, shot: shotNumber, ...result });
      } catch (err) {
        console.error(`Error checking "${prompt.prompt}" on ${model} (shot ${shotNumber}):`, err.message);
      }
    });

    // Run all model calls for this prompt in parallel
    await Promise.allSettled(modelPromises);
  }

  return {
    checked: allResults.length,
    mentioned: allResults.filter((r) => r.was_mentioned).length,
    results: allResults,
    batchId,
  };
}

/**
 * Legacy function — runs all shots sequentially for a client.
 * Kept for backward compatibility with manual POST triggers.
 */
export async function runTrackerForClient(clientId) {
  const supabase = createServerClient();

  const { data: client } = await supabase
    .from("tracker_clients")
    .select("plan")
    .eq("id", clientId)
    .single();

  const plan = client?.plan || "starter";
  const maxShots = PLAN_SHOTS[plan] || 3;
  const allResults = [];

  for (let shot = 1; shot <= maxShots; shot++) {
    const result = await runClientShot(clientId, shot);
    allResults.push(result);
  }

  return {
    checked: allResults.reduce((sum, r) => sum + r.checked, 0),
    mentioned: allResults.reduce((sum, r) => sum + r.mentioned, 0),
    results: allResults.flatMap((r) => r.results),
    batchId: allResults[0]?.batchId,
  };
}

/**
 * Uses Claude to generate realistic buyer-intent prompts for tracking.
 *
 * The quality of these prompts determines the quality of all downstream data.
 * Three critical inputs drive prompt quality:
 *   1. description — What the business does in plain English (one sentence)
 *   2. buyerPersona — Who is the actual buyer (the person with the problem)
 *   3. buyerJtbd — What problem they're solving right before they'd search
 *
 * When these are missing, Claude has to guess — and guesses wrong for anything
 * beyond generic local services. A SaaS tool described as just "AI editing tool"
 * produces "best AI editing tool" which no real buyer would type.
 */
export async function generatePromptsForClient(businessType, location, businessName = "", differentiators = "", {
  description = "",
  buyerPersona = "",
  buyerJtbd = "",
  competitors = "",
} = {}) {
  // Build the buyer context block — this is what makes the difference
  const hasBuyerProfile = description || buyerPersona || buyerJtbd;

  const buyerContextBlock = hasBuyerProfile ? `
<buyer_profile>
  <what_they_do>${description || "not provided — infer from business type"}</what_they_do>
  <who_buys>${buyerPersona || "not provided — infer the most likely buyer"}</who_buys>
  <problem_moment>${buyerJtbd || "not provided — infer the trigger that makes someone search"}</problem_moment>
  ${competitors ? `<known_competitors>${competitors}</known_competitors>` : ""}
</buyer_profile>` : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `<task>
Generate 10 high-intent prompts that a REAL BUYER would type into ChatGPT, Perplexity, or Claude when they need what this business provides.
</task>

<business>
  <name>${businessName || "unknown"}</name>
  <type>${businessType}</type>
  <location>${location || "none (online/national)"}</location>
  <differentiators>${differentiators || "none provided"}</differentiators>
</business>
${buyerContextBlock}
<instructions>
Step 1 — Understand the buyer FIRST, then generate prompts.

Think about this specific person:
- What situation are they in right before they open ChatGPT?
- What words would THEY use? (Not industry jargon the business uses)
- Are they comparing options, looking for a specific solution, or describing a problem?
- What's their urgency level?

${hasBuyerProfile ? `You have a buyer profile above. Use it. The "problem_moment" field tells you exactly when this person searches — write prompts from THAT moment.` : `No buyer profile was provided. You must infer:
- Who actually pays for this service/product
- What specific problem triggers them to search
- What language a non-expert would use to describe their need

DO NOT default to generic "[best/top] [business type]" patterns. Think about what problem this business SOLVES and write prompts from the buyer's perspective.`}

Step 2 — Classify this business into exactly ONE category:
- local_service: Serves a specific geographic area (plumber, dentist, roofing company)
- saas_tool: Software product or online tool (NOT "best X software" — think about the USE CASE)
- done_for_you_service: Agency or consultancy (SEO agency, marketing firm)
- hybrid: Combines local presence with digital services

Step 3 — Generate 10 prompts using these MANDATORY rules:

PROMPT MIX (include ALL of these types):
- 3 problem-first prompts: Start with the buyer's problem, NOT the solution category
  Example: "my roof is leaking after the storm, who fixes that in Vegas?" NOT "best roofer in Vegas"
  Example: "I need to edit product photos but Photoshop is too complicated" NOT "best photo editing software"
- 2 comparison/evaluation prompts: Buyer is choosing between options
  Example: "is it better to hire a marketing agency or do SEO myself for my dental practice?"
  Example: "[competitor] vs alternatives for [specific use case]"
- 2 specific-need prompts: Buyer knows roughly what they want
  Example: "emergency plumber near Henderson who works on weekends"
  Example: "CRM that integrates with Shopify for a small e-commerce store"
- 2 recommendation prompts: Buyer wants AI to recommend
  Example: "what's the best way to get my restaurant showing up when people ask AI for food recommendations?"
  Example: "who should I hire to redesign my law firm's website?"
- 1 cost/value prompt: Buyer evaluating price
  Example: "how much does a new roof cost in Las Vegas in ${new Date().getFullYear()}?"
  Example: "is [tool type] worth paying for or are free alternatives good enough?"

QUALITY RULES:
- Every prompt MUST have purchase/hiring intent — someone ready to act, not just curious
- Use natural, conversational language — how people actually talk to AI assistants
- NO generic "best [type] in [year]" or "top [type] tools" patterns unless mixed with specifics
- NO prompts that only the business owner would search for
- If differentiators were provided, weave 2-3 into prompts naturally
- ${location ? `Include location in 5-6 prompts naturally (not forced into every one)` : "Do NOT include any location references — this is an online/national business"}
- ${competitors ? `Reference these competitors in 1-2 comparison prompts: ${competitors}` : ""}
- Each prompt must be DIFFERENT enough that it would get a meaningfully different AI response
</instructions>

Return ONLY a valid JSON array of 10 strings. No explanation, no markdown, just the array.`,
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
    // Fallbacks that at least attempt problem-first framing
    const base = location
      ? [
          `I need a good ${businessType} in ${location}, who do you recommend?`,
          `who should I call for ${businessType} help in ${location}?`,
          `looking for a reliable ${businessType} near ${location}`,
          `how much does a ${businessType} cost in ${location}?`,
          `${businessType} recommendations in ${location} area`,
        ]
      : [
          `I need help with ${businessType}, what are my best options?`,
          `what ${businessType} do you recommend for a small business?`,
          `is it worth paying for a ${businessType} or are there free alternatives?`,
          `${businessType} comparison — what should I look for?`,
          `best ${businessType} for someone just getting started`,
        ];
    return base;
  }
}
