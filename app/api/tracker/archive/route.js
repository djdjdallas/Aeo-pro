import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 60;

/**
 * POST /api/tracker/archive
 *
 * Tiered data archival strategy:
 *   - Tier "full" (0-90 days): Complete full_response preserved
 *   - Tier "summary" (90-365 days): full_response truncated to first 500 chars
 *     (enough for audit comparison), response_snippet preserved
 *   - Tier "aggregate" (365+ days): full_response removed entirely,
 *     only structured data (was_mentioned, mention_rank, sentiment) remains
 *
 * This preserves the ability to do historical audit comparisons for long-term
 * clients while managing storage costs.
 *
 * Body: { dry_run?: boolean } — set dry_run=true to preview without changes
 */
export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    let dryRun = false;
    try {
      const body = await request.json();
      dryRun = body.dry_run === true;
    } catch { /* no body */ }

    const now = new Date();

    // Tier boundaries
    const summaryDate = new Date(now);
    summaryDate.setDate(summaryDate.getDate() - 90);
    const summaryCutoff = summaryDate.toISOString();

    const aggregateDate = new Date(now);
    aggregateDate.setDate(aggregateDate.getDate() - 365);
    const aggregateCutoff = aggregateDate.toISOString();

    const stats = {
      to_summary: 0,
      to_aggregate: 0,
      bytes_freed: 0,
      dry_run: dryRun,
    };

    // Tier 2: Move "full" results older than 90 days to "summary"
    // Keep first 500 chars of full_response for audit comparison context
    const { data: summaryResults } = await supabase
      .from("prompt_results")
      .select("id, full_response")
      .lte("checked_at", summaryCutoff)
      .gt("checked_at", aggregateCutoff)
      .or("archival_tier.is.null,archival_tier.eq.full")
      .not("full_response", "is", null)
      .limit(500);

    for (const row of summaryResults || []) {
      if (!row.full_response || row.full_response.length <= 500) continue;

      const originalLen = row.full_response.length;
      const summarized = row.full_response.slice(0, 500) + "\n\n[... truncated for archival — full response available in first 90 days]";
      stats.bytes_freed += originalLen - summarized.length;
      stats.to_summary++;

      if (!dryRun) {
        await supabase
          .from("prompt_results")
          .update({ full_response: summarized, archival_tier: "summary" })
          .eq("id", row.id);
      }
    }

    // Tier 3: Move results older than 365 days to "aggregate"
    // Remove full_response entirely — structured data (mentions, rank, sentiment) preserved
    const { data: aggregateResults } = await supabase
      .from("prompt_results")
      .select("id, full_response")
      .lte("checked_at", aggregateCutoff)
      .or("archival_tier.is.null,archival_tier.eq.full,archival_tier.eq.summary")
      .not("full_response", "is", null)
      .limit(500);

    for (const row of aggregateResults || []) {
      if (!row.full_response) continue;

      stats.bytes_freed += row.full_response.length;
      stats.to_aggregate++;

      if (!dryRun) {
        await supabase
          .from("prompt_results")
          .update({ full_response: null, archival_tier: "aggregate" })
          .eq("id", row.id);
      }
    }

    return NextResponse.json({
      success: true,
      ...stats,
      approx_mb_freed: Math.round(stats.bytes_freed / 1024 / 1024 * 100) / 100,
      cutoffs: {
        summary: summaryCutoff,
        aggregate: aggregateCutoff,
      },
    });
  } catch (err) {
    console.error("Archive error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
