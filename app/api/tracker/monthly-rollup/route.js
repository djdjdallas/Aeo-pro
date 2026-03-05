import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  mentionRateWithCI,
  positionQualityScore,
  aeoCompositeScore,
} from "@/lib/tracker/metrics";

export const maxDuration = 60;

/**
 * GET /api/tracker/monthly-rollup
 *
 * Runs on the 1st of each month (before send-report).
 * Aggregates daily_snapshots into a monthly_snapshots row per client.
 */
export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Default to previous month
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(firstOfThisMonth);
    lastMonth.setDate(lastMonth.getDate() - 1);

    const monthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const monthEnd = lastMonth.toISOString().split("T")[0];

    const { data: clients } = await supabase
      .from("tracker_clients")
      .select("id, business_name");

    if (!clients?.length) {
      return NextResponse.json({ success: true, message: "No clients" });
    }

    const rollups = [];

    for (const client of clients) {
      const { data: dailySnaps } = await supabase
        .from("daily_snapshots")
        .select("*")
        .eq("client_id", client.id)
        .gte("snapshot_date", monthStart)
        .lte("snapshot_date", monthEnd);

      if (!dailySnaps?.length) continue;

      // Aggregate across all models and days
      let totalChecks = 0;
      let totalMentions = 0;
      let sentPositive = 0;
      let sentNeutral = 0;
      let sentNegative = 0;
      const modelBreakdown = {};
      const allCompetitors = {};
      const pqsValues = [];
      const sovValues = [];

      for (const snap of dailySnaps) {
        totalChecks += snap.total_checks;
        totalMentions += snap.total_mentions;
        sentPositive += snap.sentiment_positive || 0;
        sentNeutral += snap.sentiment_neutral || 0;
        sentNegative += snap.sentiment_negative || 0;

        if (snap.position_quality_score !== null) {
          pqsValues.push(snap.position_quality_score);
        }
        if (snap.sov_percentage !== null) {
          sovValues.push(snap.sov_percentage);
        }

        // Model breakdown
        if (!modelBreakdown[snap.ai_model]) {
          modelBreakdown[snap.ai_model] = { checks: 0, mentions: 0 };
        }
        modelBreakdown[snap.ai_model].checks += snap.total_checks;
        modelBreakdown[snap.ai_model].mentions += snap.total_mentions;

        // Competitor aggregation
        if (snap.competitor_data && typeof snap.competitor_data === "object") {
          for (const [name, count] of Object.entries(snap.competitor_data)) {
            allCompetitors[name] = (allCompetitors[name] || 0) + count;
          }
        }
      }

      // Compute metrics
      const { rate: mentionRate, lower: ciLower, upper: ciUpper } =
        mentionRateWithCI(totalMentions, totalChecks);

      const avgPqs = pqsValues.length > 0
        ? Math.round(pqsValues.reduce((a, b) => a + b, 0) / pqsValues.length)
        : 0;

      const avgSov = sovValues.length > 0
        ? Math.round(sovValues.reduce((a, b) => a + b, 0) / sovValues.length)
        : 0;

      const totalSentiment = sentPositive + sentNeutral + sentNegative;
      const sentPosPct = totalSentiment > 0 ? Math.round((sentPositive / totalSentiment) * 100) : 50;
      const sentNegPct = totalSentiment > 0 ? Math.round((sentNegative / totalSentiment) * 100) : 0;

      const compositeScore = aeoCompositeScore({
        mentionRate,
        pqs: avgPqs,
        sov: avgSov,
        sentimentPositivePct: sentPosPct,
        sentimentNegativePct: sentNegPct,
      });

      // Top competitors
      const topCompetitors = Object.entries(allCompetitors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Model breakdown for JSON storage
      const modelBreakdownJson = {};
      for (const [model, stats] of Object.entries(modelBreakdown)) {
        modelBreakdownJson[model] = {
          checks: stats.checks,
          mentions: stats.mentions,
          rate: stats.checks > 0 ? Math.round((stats.mentions / stats.checks) * 100) : 0,
        };
      }

      rollups.push({
        client_id: client.id,
        month_start: monthStart,
        total_checks: totalChecks,
        total_mentions: totalMentions,
        mention_rate: mentionRate,
        mention_rate_ci_lower: ciLower,
        mention_rate_ci_upper: ciUpper,
        position_quality_score: avgPqs,
        sov_percentage: avgSov,
        aeo_composite_score: compositeScore,
        sentiment_positive: sentPositive,
        sentiment_neutral: sentNeutral,
        sentiment_negative: sentNegative,
        model_breakdown: modelBreakdownJson,
        top_competitors: topCompetitors,
        top_cited_domains: [], // TODO: aggregate from response_citations
      });
    }

    if (rollups.length > 0) {
      const { error } = await supabase
        .from("monthly_snapshots")
        .upsert(rollups, { onConflict: "client_id,month_start" });

      if (error) {
        console.error("Monthly rollup upsert failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      month: monthStart,
      clients_processed: rollups.length,
    });
  } catch (err) {
    console.error("Monthly rollup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
