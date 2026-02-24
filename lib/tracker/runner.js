// lib/tracker/runner.js
// The brain of the tracker — runs prompts against AI models and saves results

import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Checks a single prompt against an AI model and detects if the business is mentioned.
 *
 * Why we use a system prompt: Without it, Claude often disclaims it can't recommend
 * specific businesses. The system prompt nudges it to behave like a local search assistant,
 * which is what we're simulating — a real user asking AI for recommendations.
 */
async function checkPromptAgainstAI(prompt, businessName, targetUrl, model) {
  const systemPrompt = `You are a helpful local search assistant. When asked about local businesses
or services, provide specific, honest recommendations based on what you know.
Include business names, explain why you'd recommend them, and be direct and helpful.`;

  let fullResponse = "";

  if (model === "claude") {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    fullResponse = message.content[0].text;
  }

  // Case-insensitive matching
  const lowerResponse = fullResponse.toLowerCase();
  const lowerBusiness = businessName.toLowerCase();

  let wasMentioned = false;
  let mentionRank = null;
  let responseSnippet = null;

  if (lowerResponse.includes(lowerBusiness)) {
    wasMentioned = true;

    // Find which sentence the mention appears in (gives us a rough rank)
    const sentences = fullResponse.split(/[.!?]+/);
    const mentionIndex = sentences.findIndex((s) =>
      s.toLowerCase().includes(lowerBusiness)
    );
    mentionRank = mentionIndex + 1;

    // Extract 300 chars around the mention for the dashboard snippet
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

  // Start with Claude — add "perplexity" and "gpt-4o" here later when you integrate those APIs
  const models = ["claude"];
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
export async function generatePromptsForClient(businessType, location) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 10 realistic questions that a potential customer would ask an AI assistant
when looking for a ${businessType} in ${location}.

These should be natural, conversational — the kind someone types into ChatGPT or Perplexity.
Mix them up: general ("best ${businessType} near me"), specific ("emergency ${businessType} ${location}"),
comparison ("most affordable ${businessType} in ${location}"), and intent-based ("who should I call for...").

Return ONLY a valid JSON array of strings. No explanation, no markdown, just the array.
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
    return [
      `best ${businessType} in ${location}`,
      `top rated ${businessType} near ${location}`,
      `who should I hire for ${businessType} in ${location}`,
      `most trusted ${businessType} ${location}`,
      `affordable ${businessType} ${location}`,
    ];
  }
}
