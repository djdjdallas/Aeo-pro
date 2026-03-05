// lib/tracker/cost.js
// API cost estimation and logging for margin tracking

import { createServerClient } from "@/lib/supabase";

// Estimated cost per call (USD) based on typical response sizes
const COST_PER_CALL = {
  claude: 0.008,
  chatgpt: 0.004,
  perplexity: 0.0001,
  gemini: 0.0001,
  deepseek: 0.0002,
  grok: 0.0008,
  copilot: 0.03,
  meta_ai: 0.0006,
  sentiment: 0.0003,
};

// Plan-based model configuration
export const PLAN_MODELS = {
  starter: ["chatgpt", "perplexity", "gemini", "deepseek"],
  growth: ["chatgpt", "perplexity", "gemini", "deepseek", "grok", "meta_ai"],
  pro: ["claude", "chatgpt", "perplexity", "gemini", "deepseek", "grok", "copilot", "meta_ai"],
};

export const PLAN_SHOTS = {
  starter: 2,
  growth: 3,
  pro: 3,
};

export const PLAN_PROMPTS = {
  starter: 8,
  growth: 10,
  pro: 10,
};

/**
 * Get the estimated cost for a single API call.
 */
export function estimateCost(model) {
  return COST_PER_CALL[model] || 0.001;
}

/**
 * Log an API cost entry to the database.
 */
export async function logApiCost({ clientId, aiModel, callType, inputTokens, outputTokens, estimatedCost, runBatchId }) {
  const supabase = createServerClient();
  await supabase.from("api_cost_log").insert({
    client_id: clientId,
    ai_model: aiModel,
    call_type: callType,
    input_tokens: inputTokens || null,
    output_tokens: outputTokens || null,
    estimated_cost: estimatedCost || estimateCost(aiModel),
    run_batch_id: runBatchId || null,
  });
}

/**
 * Get total estimated cost for a client in a date range.
 */
export async function getClientCosts(clientId, startDate, endDate) {
  const supabase = createServerClient();
  let query = supabase
    .from("api_cost_log")
    .select("ai_model, estimated_cost, call_type, created_at")
    .eq("client_id", clientId);

  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data } = await query;
  if (!data?.length) return { total: 0, byModel: {}, byType: {} };

  let total = 0;
  const byModel = {};
  const byType = {};

  for (const row of data) {
    const cost = Number(row.estimated_cost) || 0;
    total += cost;
    byModel[row.ai_model] = (byModel[row.ai_model] || 0) + cost;
    byType[row.call_type] = (byType[row.call_type] || 0) + cost;
  }

  return {
    total: Math.round(total * 100) / 100,
    byModel,
    byType,
  };
}

/**
 * Get models available for a client based on their plan and configured API keys.
 */
export function getModelsForPlan(plan) {
  const planModels = PLAN_MODELS[plan] || PLAN_MODELS.starter;

  // Filter by available API keys
  return planModels.filter((model) => {
    switch (model) {
      case "gemini": return !!process.env.GOOGLE_AI_API_KEY;
      case "deepseek": return !!process.env.DEEPSEEK_API_KEY;
      case "grok": return !!process.env.XAI_API_KEY;
      case "meta_ai": return !!process.env.TOGETHER_API_KEY;
      default: return true;
    }
  });
}
