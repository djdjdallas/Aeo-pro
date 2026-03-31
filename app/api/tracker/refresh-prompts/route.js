import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generatePromptsForClient } from "@/lib/tracker/runner";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 60;

/**
 * POST /api/tracker/refresh-prompts
 *
 * Prompt refresh mechanism. Analyzes prompt performance and replaces
 * low-performing prompts with new AI-generated ones.
 *
 * Body: { client_id: string, force?: boolean, min_days?: number }
 *
 * - If force=true, regenerates all prompts regardless of performance
 * - If min_days set, only refreshes if prompts are older than min_days
 * - Default behavior: replace prompts with <5% mention rate after 30 days
 */
export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { client_id, force = false, min_days = 30 } = body;

    if (!client_id) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 });
    }

    // Fetch client
    const { data: client } = await supabase
      .from("tracker_clients")
      .select("*")
      .eq("id", client_id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch active prompts
    const { data: prompts } = await supabase
      .from("tracked_prompts")
      .select("*")
      .eq("client_id", client_id)
      .eq("is_active", true);

    if (!prompts?.length) {
      return NextResponse.json({ error: "No active prompts to refresh" }, { status: 400 });
    }

    // Calculate per-prompt performance
    const promptPerformance = [];
    for (const prompt of prompts) {
      const { data: rawResults } = await supabase
        .from("prompt_results")
        .select("was_mentioned, checked_at, response_status")
        .eq("prompt_id", prompt.id);

      const results = (rawResults || []).filter((r) => !r.response_status || r.response_status === "valid");
      const total = results.length;
      const mentioned = results.filter((r) => r.was_mentioned).length;
      const rate = total > 0 ? Math.round((mentioned / total) * 100) : null;

      // Check age
      const createdAt = new Date(prompt.created_at);
      const ageDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      promptPerformance.push({
        ...prompt,
        total_checks: total,
        mention_rate: rate,
        age_days: ageDays,
      });
    }

    // Identify prompts to replace
    const toReplace = force
      ? promptPerformance
      : promptPerformance.filter((p) => {
          // Only replace if old enough and underperforming
          if (p.age_days < min_days) return false;
          if (p.total_checks < 10) return false; // Not enough data
          return p.mention_rate !== null && p.mention_rate < 5;
        });

    if (toReplace.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No prompts need refreshing",
        prompt_stats: promptPerformance.map((p) => ({
          prompt: p.prompt,
          mention_rate: p.mention_rate,
          total_checks: p.total_checks,
          age_days: p.age_days,
        })),
      });
    }

    // Generate new prompts using stored buyer profile
    const newPrompts = await generatePromptsForClient(
      client.business_type,
      client.location,
      client.business_name,
      client.differentiators || "",
      {
        description: client.description || "",
        buyerPersona: client.buyer_persona || "",
        buyerJtbd: client.buyer_jtbd || "",
        competitors: client.competitors || "",
      }
    );

    // Deactivate old underperforming prompts
    const deactivatedIds = [];
    for (const old of toReplace) {
      await supabase
        .from("tracked_prompts")
        .update({ is_active: false })
        .eq("id", old.id);
      deactivatedIds.push(old.id);
    }

    // Insert new prompts (only as many as we deactivated, to keep total stable)
    const keepCount = prompts.length; // Maintain the same total number
    const activeRemaining = prompts.length - toReplace.length;
    const newCount = Math.min(newPrompts.length, keepCount - activeRemaining);

    // Filter out duplicates against remaining active prompts
    const activePromptTexts = prompts
      .filter((p) => !deactivatedIds.includes(p.id))
      .map((p) => p.prompt.toLowerCase());

    const uniqueNewPrompts = newPrompts.filter(
      (np) => !activePromptTexts.includes(np.toLowerCase())
    );

    const inserted = [];
    for (let i = 0; i < Math.min(newCount, uniqueNewPrompts.length); i++) {
      const { data: newPrompt } = await supabase
        .from("tracked_prompts")
        .insert({
          client_id,
          prompt: uniqueNewPrompts[i],
          is_active: true,
        })
        .select("id, prompt")
        .single();

      if (newPrompt) inserted.push(newPrompt);
    }

    return NextResponse.json({
      success: true,
      deactivated: toReplace.map((p) => ({
        prompt: p.prompt,
        mention_rate: p.mention_rate,
        age_days: p.age_days,
      })),
      new_prompts: inserted,
      prompt_stats: promptPerformance.map((p) => ({
        prompt: p.prompt,
        mention_rate: p.mention_rate,
        total_checks: p.total_checks,
        age_days: p.age_days,
        replaced: deactivatedIds.includes(p.id),
      })),
    });
  } catch (err) {
    console.error("Refresh prompts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
