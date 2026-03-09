// lib/audit/ai-check.js
// Multi-prompt, multi-model AI visibility check with competitor extraction and Share of Voice

import OpenAI from "openai";
import { parseMentionFromResponse } from "@/lib/tracker/runner";
import { extractBusinessNames } from "@/lib/tracker/competitors";

const SYSTEM_PROMPT = "You are a helpful local search assistant.";

/**
 * Runs multiple prompts against ChatGPT + Perplexity in parallel,
 * detects mentions, extracts competitors, and aggregates Share of Voice.
 *
 * @param {string[]} prompts - Array of prompt strings (typically 6)
 * @param {string} businessName - The business name to check for
 * @param {string} targetUrl - The business URL for domain matching
 * @returns {Promise<object>} Full multi-prompt results + share of voice
 */
export async function runMultiPromptAiCheck(prompts, businessName, targetUrl) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: "https://api.perplexity.ai",
  });

  // Build all calls: 6 prompts x 2 models = 12 parallel calls
  const calls = [];
  for (const prompt of prompts) {
    // ChatGPT call
    calls.push(
      openai.chat.completions
        .create({
          model: "gpt-4.1",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        })
        .then((r) => ({ model: "chatgpt", prompt, text: r.choices[0].message.content }))
        .catch((err) => ({ model: "chatgpt", prompt, text: null, error: err.message }))
    );
    // Perplexity call
    calls.push(
      perplexity.chat.completions
        .create({
          model: "sonar",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        })
        .then((r) => ({ model: "perplexity", prompt, text: r.choices[0].message.content }))
        .catch((err) => ({ model: "perplexity", prompt, text: null, error: err.message }))
    );
  }

  const results = await Promise.allSettled(calls);

  // Process results into structured format
  const perPromptResults = [];
  const mentionCounts = {}; // { "Business Name": { mentions: N, total: 0 } }
  let totalChecks = 0;

  for (const settled of results) {
    const r = settled.status === "fulfilled" ? settled.value : { ...settled.reason, error: "Promise rejected" };
    if (!r) continue;

    totalChecks++;
    const responseText = r.text || "";
    const mentioned = responseText
      ? parseMentionFromResponse(responseText, businessName, targetUrl)
      : { wasMentioned: false, mentionRank: null, responseSnippet: null };

    // Extract competitors from this response
    let competitors = [];
    if (responseText) {
      try {
        competitors = extractBusinessNames(responseText);
      } catch {
        // competitors module error — skip
      }
    }

    // Track all mentioned businesses for Share of Voice
    const allMentioned = new Set(competitors.map((c) => c.toLowerCase()));
    if (mentioned.wasMentioned) {
      allMentioned.add(businessName.toLowerCase());
    }
    for (const name of allMentioned) {
      if (!mentionCounts[name]) mentionCounts[name] = { mentions: 0, total: 0 };
      mentionCounts[name].mentions++;
    }
    // Increment total for all tracked businesses
    for (const name of Object.keys(mentionCounts)) {
      mentionCounts[name].total = totalChecks;
    }

    perPromptResults.push({
      prompt: r.prompt,
      model: r.model,
      mentioned: mentioned.wasMentioned,
      snippet: mentioned.responseSnippet,
      full_response: responseText,
      competitors,
      error: r.error || null,
    });
  }

  // Build Share of Voice table
  const shareOfVoice = {};
  for (const [name, data] of Object.entries(mentionCounts)) {
    shareOfVoice[name] = {
      mentions: data.mentions,
      total: totalChecks,
      percentage: Math.round((data.mentions / totalChecks) * 100),
    };
  }

  // Ensure the client business is in the SoV table
  const lowerBusiness = businessName.toLowerCase();
  if (!shareOfVoice[lowerBusiness]) {
    const clientMentions = perPromptResults.filter((r) => r.mentioned).length;
    shareOfVoice[lowerBusiness] = {
      mentions: clientMentions,
      total: totalChecks,
      percentage: Math.round((clientMentions / totalChecks) * 100),
    };
  }

  // Group per-prompt results by prompt for easier UI consumption
  const promptGroups = [];
  for (const prompt of prompts) {
    const chatgpt = perPromptResults.find((r) => r.prompt === prompt && r.model === "chatgpt");
    const pplx = perPromptResults.find((r) => r.prompt === prompt && r.model === "perplexity");
    promptGroups.push({
      prompt,
      chatgpt: chatgpt || { mentioned: false, error: "No result" },
      perplexity: pplx || { mentioned: false, error: "No result" },
      competitors: [
        ...new Set([...(chatgpt?.competitors || []), ...(pplx?.competitors || [])]),
      ],
    });
  }

  const clientMentionCount = perPromptResults.filter((r) => r.mentioned).length;

  return {
    business_name: businessName,
    prompts_used: prompts,
    total_checks: totalChecks,
    client_mentions: clientMentionCount,
    mention_rate: Math.round((clientMentionCount / totalChecks) * 100),
    prompt_results: promptGroups,
    share_of_voice: shareOfVoice,
  };
}
