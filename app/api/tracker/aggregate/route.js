import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  mentionRateWithCI,
  positionQualityScore,
  shareOfVoice,
} from "@/lib/tracker/metrics";

export const maxDuration = 60;

/**
 * GET /api/tracker/aggregate
 *
 * Daily cron job that computes daily_snapshots from raw prompt_results.
 * Runs at 23:30 UTC to capture all 3 shot windows for the day.
 */
export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Log cron start
  const { data: cronLog } = await supabase
    .from("cron_run_log")
    .insert({ job_name: "aggregate", status: "running" })
    .select("id")
    .single();
  const cronLogId = cronLog?.id;

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: clients } = await supabase
      .from("tracker_clients")
      .select("id, business_name");

    if (!clients?.length) {
      if (cronLogId) {
        await supabase.from("cron_run_log").update({
          status: "success", completed_at: new Date().toISOString(), clients_processed: 0,
        }).eq("id", cronLogId);
      }
      return NextResponse.json({ success: true, message: "No clients" });
    }

    const snapshots = [];

    for (const client of clients) {
      // Get today's results for this client
      const { data: rawResults } = await supabase
        .from("prompt_results")
        .select("ai_model, was_mentioned, mention_rank, sentiment, response_status")
        .eq("client_id", client.id)
        .gte("checked_at", `${today}T00:00:00Z`)
        .lte("checked_at", `${today}T23:59:59Z`);

      // Exclude invalid responses from aggregation
      const results = (rawResults || []).filter((r) => !r.response_status || r.response_status === "valid");
      if (!results.length) continue;

      // Group by model
      const byModel = {};
      for (const r of results) {
        if (!byModel[r.ai_model]) byModel[r.ai_model] = [];
        byModel[r.ai_model].push(r);
      }

      // Get SOV data for today
      let sovPct = 0;
      let competitorData = {};
      try {
        const { data: mentions } = await supabase
          .from("response_mentions")
          .select("business_name, is_client")
          .eq("client_id", client.id)
          .gte("created_at", `${today}T00:00:00Z`)
          .lte("created_at", `${today}T23:59:59Z`);

        if (mentions?.length) {
          const clientMentions = mentions.filter((m) => m.is_client).length;
          sovPct = shareOfVoice(clientMentions, mentions.length);

          // Count competitor mentions
          const counts = {};
          for (const m of mentions) {
            if (!m.is_client) {
              counts[m.business_name] = (counts[m.business_name] || 0) + 1;
            }
          }
          competitorData = counts;
        }
      } catch { /* table may not exist */ }

      // Get citation counts for today
      let citationCount = 0;
      let clientCitationCount = 0;
      try {
        const { data: citations } = await supabase
          .from("response_citations")
          .select("is_client_url")
          .eq("client_id", client.id)
          .gte("created_at", `${today}T00:00:00Z`)
          .lte("created_at", `${today}T23:59:59Z`);

        if (citations?.length) {
          citationCount = citations.length;
          clientCitationCount = citations.filter((c) => c.is_client_url).length;
        }
      } catch { /* table may not exist */ }

      // Create per-model snapshots
      for (const [model, modelResults] of Object.entries(byModel)) {
        const totalChecks = modelResults.length;
        const totalMentions = modelResults.filter((r) => r.was_mentioned).length;
        const { rate: mentionRate } = mentionRateWithCI(totalMentions, totalChecks);
        const mentionedWithRank = modelResults.filter((r) => r.was_mentioned && r.mention_rank);
        const pqs = positionQualityScore(mentionedWithRank);

        const sentimentPositive = modelResults.filter((r) => r.sentiment === "positive").length;
        const sentimentNeutral = modelResults.filter((r) => r.sentiment === "neutral").length;
        const sentimentNegative = modelResults.filter((r) => r.sentiment === "negative").length;

        const snapshot = {
          client_id: client.id,
          snapshot_date: today,
          ai_model: model,
          total_checks: totalChecks,
          total_mentions: totalMentions,
          mention_rate: mentionRate,
          avg_mention_rank: mentionedWithRank.length > 0
            ? Math.round(mentionedWithRank.reduce((s, r) => s + r.mention_rank, 0) / mentionedWithRank.length * 100) / 100
            : null,
          position_quality_score: pqs,
          sentiment_positive: sentimentPositive,
          sentiment_neutral: sentimentNeutral,
          sentiment_negative: sentimentNegative,
          sov_percentage: sovPct,
          competitor_data: competitorData,
          citation_count: citationCount,
          client_citation_count: clientCitationCount,
        };

        snapshots.push(snapshot);
      }
    }

    if (snapshots.length > 0) {
      // Upsert to handle re-runs
      const { error } = await supabase
        .from("daily_snapshots")
        .upsert(snapshots, {
          onConflict: "client_id,snapshot_date,ai_model",
        });

      if (error) {
        console.error("Failed to upsert daily_snapshots:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "success", completed_at: new Date().toISOString(), clients_processed: clients.length,
      }).eq("id", cronLogId);
    }

    return NextResponse.json({
      success: true,
      date: today,
      snapshots_created: snapshots.length,
      clients_processed: clients.length,
    });
  } catch (err) {
    console.error("Aggregate error:", err);
    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "failed", completed_at: new Date().toISOString(), error_message: err.message,
      }).eq("id", cronLogId).catch(() => {});
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
