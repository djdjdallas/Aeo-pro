// lib/tracker/runner.js
// The brain of the tracker — runs prompts against AI models and saves results

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase";

const SHOTS_PER_PROMPT = 3;

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
 * Runs all active tracked prompts for a client across all configured AI models.
 * Each prompt×model combination runs SHOTS_PER_PROMPT times for statistical rigor.
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

  // Core models always run; optional models only if API key is configured
  const models = [
    "claude",
    "chatgpt",
    "perplexity",
    ...(process.env.GOOGLE_AI_API_KEY ? ["gemini"] : []),
    ...(process.env.DEEPSEEK_API_KEY ? ["deepseek"] : []),
    ...(process.env.XAI_API_KEY ? ["grok"] : []),
    "copilot", // Uses existing OpenAI key with web search
    ...(process.env.TOGETHER_API_KEY ? ["meta_ai"] : []),
  ];
  const allResults = [];
  const batchId = crypto.randomUUID();

  for (const prompt of prompts) {
    for (const model of models) {
      for (let shot = 1; shot <= SHOTS_PER_PROMPT; shot++) {
        try {
          const result = await checkPromptAgainstAI(
            prompt.prompt,
            client.business_name,
            client.target_url,
            model
          );

          const insertRow = {
            prompt_id: prompt.id,
            client_id: clientId,
            ai_model: model,
            was_mentioned: result.was_mentioned,
            mention_rank: result.mention_rank,
            response_snippet: result.response_snippet,
            full_response: result.full_response,
            run_batch_id: batchId,
            run_number: shot,
          };

          const { data: inserted, error: insertError } = await supabase
            .from("prompt_results")
            .insert(insertRow)
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to save result:", insertError);
          }

          // Phase 5: Extract competitor mentions
          if (inserted?.id) {
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
            } catch (e) {
              // competitors module may not exist yet — skip silently
            }

            // Phase 6: Extract citations/URLs
            try {
              const { extractUrlsFromText } = await import("@/lib/tracker/citations");
              const clientDomain = client.target_url
                ? client.target_url.replace(/https?:\/\/(www\.)?/, "").split("/")[0]
                : "";
              const urls = extractUrlsFromText(result.full_response);
              // Also capture Perplexity structured citations
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
            } catch (e) {
              // citations module may not exist yet — skip silently
            }

            // Phase 7: Sentiment analysis (only when mentioned)
            if (result.was_mentioned && result.response_snippet) {
              try {
                const sentiment = await classifySentiment(result.response_snippet, client.business_name);
                if (sentiment) {
                  await supabase
                    .from("prompt_results")
                    .update({ sentiment: sentiment.sentiment, sentiment_reason: sentiment.reason })
                    .eq("id", inserted.id);
                }
              } catch (e) {
                // sentiment classification failed — skip silently
              }
            }
          }

          allResults.push({ prompt: prompt.prompt, model, shot, ...result });

          // Rate limit buffer between API calls
          await new Promise((r) => setTimeout(r, 500));
        } catch (err) {
          console.error(`Error checking "${prompt.prompt}" on ${model} (shot ${shot}):`, err.message);
        }
      }
    }
  }

  return {
    checked: allResults.length,
    mentioned: allResults.filter((r) => r.was_mentioned).length,
    results: allResults,
    batchId,
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
