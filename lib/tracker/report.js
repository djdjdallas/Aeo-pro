// lib/tracker/report.js
// Builds monthly report data and renders HTML email for tracker clients

import { createServerClient } from "@/lib/supabase";
import { mentionRateWithCI, aeoCompositeScore, positionQualityScore } from "@/lib/tracker/metrics";

/**
 * Queries Supabase for all clients + results in date range,
 * computes per-model mention rate breakdown, SOV, and sentiment.
 *
 * Prefers pre-computed monthly_snapshots when available,
 * falls back to raw prompt_results for backward compatibility.
 */
export async function buildMonthlyReportData(startDate, endDate) {
  const supabase = createServerClient();

  const { data: clients } = await supabase
    .from("tracker_clients")
    .select("id, business_name, business_type, location, contact_email, plan")
    .order("business_name");

  if (!clients?.length) return { clients: [], startDate, endDate };

  const reportClients = [];

  for (const client of clients) {
    // Try monthly_snapshots first
    const { data: monthlySnap } = await supabase
      .from("monthly_snapshots")
      .select("*")
      .eq("client_id", client.id)
      .gte("month_start", startDate)
      .lte("month_start", endDate)
      .order("month_start", { ascending: false })
      .limit(1);

    if (monthlySnap?.length) {
      const snap = monthlySnap[0];
      const modelBreakdown = Object.entries(snap.model_breakdown || {}).map(([model, stats]) => ({
        model,
        total: stats.checks,
        mentioned: stats.mentions,
        rate: stats.rate,
      }));

      reportClients.push({
        ...client,
        total_checks: snap.total_checks,
        total_mentioned: snap.total_mentions,
        overall_rate: snap.mention_rate,
        mention_rate_ci: { lower: snap.mention_rate_ci_lower, upper: snap.mention_rate_ci_upper },
        aeo_score: snap.aeo_composite_score,
        pqs: snap.position_quality_score,
        models: modelBreakdown,
        sov: {
          sov: snap.sov_percentage,
          topCompetitors: snap.top_competitors || [],
        },
        sentiment: {
          positive: snap.sentiment_positive,
          neutral: snap.sentiment_neutral,
          negative: snap.sentiment_negative,
        },
      });
      continue;
    }

    // Fallback: compute from raw prompt_results
    const { data: results } = await supabase
      .from("prompt_results")
      .select("ai_model, was_mentioned, mention_rank, run_batch_id, run_number, sentiment")
      .eq("client_id", client.id)
      .gte("checked_at", startDate)
      .lte("checked_at", endDate);

    if (!results?.length) {
      reportClients.push({
        ...client,
        total_checks: 0,
        total_mentioned: 0,
        overall_rate: null,
        mention_rate_ci: null,
        aeo_score: null,
        pqs: null,
        models: [],
        sov: null,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
      });
      continue;
    }

    const total = results.length;
    const mentioned = results.filter((r) => r.was_mentioned).length;
    const { rate: overallRate, lower: ciLower, upper: ciUpper } = mentionRateWithCI(mentioned, total);

    // Position quality
    const mentionedWithRank = results.filter((r) => r.was_mentioned && r.mention_rank);
    const pqs = positionQualityScore(mentionedWithRank);

    // Per-model breakdown
    const models = {};
    for (const r of results) {
      if (!models[r.ai_model]) models[r.ai_model] = { total: 0, mentioned: 0 };
      models[r.ai_model].total++;
      if (r.was_mentioned) models[r.ai_model].mentioned++;
    }
    const modelBreakdown = Object.entries(models).map(([model, stats]) => ({
      model,
      total: stats.total,
      mentioned: stats.mentioned,
      rate: stats.total > 0 ? Math.round((stats.mentioned / stats.total) * 100) : 0,
    }));

    // Sentiment breakdown
    const sentimentResults = results.filter((r) => r.sentiment);
    const sentimentBreakdown = {
      positive: sentimentResults.filter((r) => r.sentiment === "positive").length,
      neutral: sentimentResults.filter((r) => r.sentiment === "neutral").length,
      negative: sentimentResults.filter((r) => r.sentiment === "negative").length,
    };

    // SOV data
    let sovData = null;
    try {
      const { data: mentions } = await supabase
        .from("response_mentions")
        .select("business_name, is_client")
        .eq("client_id", client.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (mentions?.length) {
        const clientMentions = mentions.filter((m) => m.is_client).length;
        const sov = Math.round((clientMentions / mentions.length) * 100);
        const competitorCounts = {};
        for (const m of mentions) {
          if (!m.is_client) {
            competitorCounts[m.business_name] = (competitorCounts[m.business_name] || 0) + 1;
          }
        }
        const topCompetitors = Object.entries(competitorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        sovData = { sov, topCompetitors };
      }
    } catch { /* response_mentions table may not exist yet */ }

    // Compute composite AEO score
    const totalSentiment = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative;
    const sentPosPct = totalSentiment > 0 ? Math.round((sentimentBreakdown.positive / totalSentiment) * 100) : 50;
    const sentNegPct = totalSentiment > 0 ? Math.round((sentimentBreakdown.negative / totalSentiment) * 100) : 0;

    const aeoScore = aeoCompositeScore({
      mentionRate: overallRate,
      pqs,
      sov: sovData?.sov || 0,
      sentimentPositivePct: sentPosPct,
      sentimentNegativePct: sentNegPct,
    });

    reportClients.push({
      ...client,
      total_checks: total,
      total_mentioned: mentioned,
      overall_rate: overallRate,
      mention_rate_ci: { lower: ciLower, upper: ciUpper },
      aeo_score: aeoScore,
      pqs,
      models: modelBreakdown,
      sov: sovData,
      sentiment: sentimentBreakdown,
    });
  }

  return { clients: reportClients, startDate, endDate };
}

/**
 * Build a per-client HTML report email.
 */
export function buildClientReportEmailHtml(clientData, startDate, endDate) {
  const start = new Date(startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const c = clientData;

  function rateColor(rate) {
    if (rate === null || rate === undefined) return "#6b7280";
    if (rate >= 50) return "#22c55e";
    if (rate >= 20) return "#eab308";
    return "#ef4444";
  }

  function rateBg(rate) {
    if (rate === null || rate === undefined) return "rgba(107,114,128,0.1)";
    if (rate >= 50) return "rgba(34,197,94,0.1)";
    if (rate >= 20) return "rgba(234,179,8,0.1)";
    return "rgba(239,68,68,0.1)";
  }

  const modelRows = (c.models || [])
    .map(
      (m) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1f1f1f;color:#d1d5db;font-size:13px;">${m.model}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1f1f1f;text-align:center;">
            <span style="color:${rateColor(m.rate)};font-weight:600;">${m.rate}%</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #1f1f1f;text-align:center;color:#6b7280;font-size:12px;">${m.mentioned}/${m.total}</td>
        </tr>`
    )
    .join("");

  const competitorList = c.sov?.topCompetitors?.length
    ? c.sov.topCompetitors
        .map(
          (comp) =>
            `<span style="display:inline-block;margin:2px 4px;padding:3px 10px;border-radius:6px;font-size:12px;background:rgba(107,114,128,0.15);color:#9ca3af;">${comp.name} (${comp.count})</span>`
        )
        .join("")
    : '<span style="color:#6b7280;font-size:12px;">No competitor data</span>';

  const ciText = c.mention_rate_ci
    ? `<span style="font-size:12px;color:#6b7280;"> (${c.mention_rate_ci.lower}%-${c.mention_rate_ci.upper}% CI)</span>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="margin-bottom:24px;">
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">
        Monthly AI Visibility Report
      </h1>
      <p style="font-size:14px;color:#6b7280;margin:0;">${start} &mdash; ${end}</p>
      <p style="font-size:16px;color:#3b82f6;font-weight:600;margin:8px 0 0 0;">${c.business_name}</p>
    </div>

    <!-- AEO Score Card -->
    <div style="background:#111111;border-radius:12px;padding:24px;margin-bottom:16px;text-align:center;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin:0 0 8px 0;">AEO Composite Score</p>
      <p style="font-size:48px;font-weight:800;color:${rateColor(c.aeo_score)};margin:0;">${c.aeo_score !== null ? c.aeo_score : "—"}</p>
      <p style="font-size:12px;color:#6b7280;margin:4px 0 0 0;">out of 100</p>
    </div>

    <!-- Key Metrics Row -->
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <div style="flex:1;background:#111111;border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px 0;">Mention Rate</p>
        <p style="font-size:28px;font-weight:700;color:${rateColor(c.overall_rate)};margin:0;">${c.overall_rate !== null ? c.overall_rate + "%" : "—"}</p>
        ${ciText}
      </div>
      <div style="flex:1;background:#111111;border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px 0;">Share of Voice</p>
        <p style="font-size:28px;font-weight:700;color:#3b82f6;margin:0;">${c.sov ? c.sov.sov + "%" : "—"}</p>
      </div>
      <div style="flex:1;background:#111111;border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px 0;">Position Quality</p>
        <p style="font-size:28px;font-weight:700;color:${rateColor(c.pqs)};margin:0;">${c.pqs !== null ? c.pqs : "—"}</p>
      </div>
    </div>

    <!-- Sentiment -->
    <div style="background:#111111;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 8px 0;">Sentiment Analysis</p>
      <span style="color:#22c55e;font-size:14px;font-weight:600;">+${c.sentiment.positive}</span>
      <span style="color:#6b7280;margin:0 8px;">/</span>
      <span style="color:#9ca3af;font-size:14px;font-weight:600;">${c.sentiment.neutral}</span>
      <span style="color:#6b7280;margin:0 8px;">/</span>
      <span style="color:#ef4444;font-size:14px;font-weight:600;">-${c.sentiment.negative}</span>
    </div>

    <!-- Model Breakdown -->
    <div style="background:#111111;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0d0d0d;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Model</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Rate</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Checks</th>
          </tr>
        </thead>
        <tbody>
          ${modelRows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#6b7280;">No data</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Competitors -->
    <div style="background:#111111;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 8px 0;">Top Competitors</p>
      ${competitorList}
    </div>

    <!-- Total Checks -->
    <p style="text-align:center;font-size:12px;color:#4b5563;margin-bottom:16px;">
      Based on <strong style="color:#9ca3af;">${c.total_checks}</strong> AI model checks this period
    </p>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://firstanswer.co/dashboard" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
        View Full Dashboard
      </a>
    </div>

    <div style="padding-top:20px;border-top:1px solid #1f1f1f;">
      <p style="font-size:12px;color:#4b5563;margin:0;">
        First Answer AI Visibility Report &mdash; <a href="https://firstanswer.co" style="color:#3b82f6;text-decoration:none;">firstanswer.co</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders an admin summary HTML email with all clients.
 */
export function buildReportEmailHtml(reportData) {
  const { clients, startDate, endDate } = reportData;

  const start = new Date(startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function rateColor(rate) {
    if (rate === null) return "#6b7280";
    if (rate >= 50) return "#22c55e";
    if (rate >= 20) return "#eab308";
    return "#ef4444";
  }

  function rateBg(rate) {
    if (rate === null) return "rgba(107,114,128,0.1)";
    if (rate >= 50) return "rgba(34,197,94,0.1)";
    if (rate >= 20) return "rgba(234,179,8,0.1)";
    return "rgba(239,68,68,0.1)";
  }

  const clientRows = clients
    .map((c) => {
      const modelCells = c.models
        .map(
          (m) =>
            `<span style="display:inline-block;margin-right:8px;padding:2px 8px;border-radius:4px;font-size:12px;background:${rateBg(m.rate)};color:${rateColor(m.rate)};">${m.model}: ${m.rate}%</span>`
        )
        .join("");

      const sovCell = c.sov
        ? `<span style="font-size:14px;font-weight:600;color:#3b82f6;">${c.sov.sov}%</span>`
        : '<span style="color:#6b7280;font-size:12px;">—</span>';

      const competitorList = c.sov?.topCompetitors?.length
        ? c.sov.topCompetitors.map((comp) => `<span style="display:inline-block;margin-right:4px;padding:1px 6px;border-radius:4px;font-size:11px;background:rgba(107,114,128,0.1);color:#9ca3af;">${comp.name} (${comp.count})</span>`).join("")
        : "";

      const sentimentCell = (c.sentiment.positive + c.sentiment.neutral + c.sentiment.negative) > 0
        ? `<span style="font-size:11px;"><span style="color:#22c55e;">+${c.sentiment.positive}</span> / <span style="color:#6b7280;">${c.sentiment.neutral}</span> / <span style="color:#ef4444;">-${c.sentiment.negative}</span></span>`
        : '<span style="color:#6b7280;font-size:11px;">—</span>';

      const aeoCell = c.aeo_score !== null && c.aeo_score !== undefined
        ? `<span style="font-size:14px;font-weight:700;color:${rateColor(c.aeo_score)};">${c.aeo_score}</span>`
        : '<span style="color:#6b7280;">—</span>';

      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
            <strong style="color:#ffffff;">${c.business_name}</strong><br/>
            <span style="font-size:12px;color:#6b7280;">${c.business_type || ""} &mdash; ${c.location || ""}</span>
            ${competitorList ? `<br/><span style="font-size:10px;color:#6b7280;">Competitors: </span>${competitorList}` : ""}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;">
            ${aeoCell}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;">
            <span style="font-size:20px;font-weight:700;color:${rateColor(c.overall_rate)};">${c.overall_rate !== null ? c.overall_rate + "%" : "—"}</span>
            <br/>${sentimentCell}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
            ${modelCells || '<span style="color:#6b7280;font-size:12px;">No data</span>'}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;color:#9ca3af;">
            ${c.total_checks}
            <br/><span style="font-size:11px;color:#3b82f6;">SOV: ${sovCell}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:720px;margin:0 auto;padding:40px 20px;">
    <div style="margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">
        AI Mention Tracker <span style="color:#3b82f6;">Monthly Report</span>
      </h1>
      <p style="font-size:14px;color:#6b7280;margin:0;">
        ${start} &mdash; ${end}
      </p>
    </div>

    <table style="width:100%;border-collapse:collapse;background:#111111;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#0d0d0d;">
          <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Client</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">AEO</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Rate</th>
          <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">By Model</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Checks</th>
        </tr>
      </thead>
      <tbody>
        ${clientRows || '<tr><td colspan="5" style="padding:24px;text-align:center;color:#6b7280;">No client data for this period.</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1f1f1f;">
      <p style="font-size:12px;color:#4b5563;margin:0;">
        First Answer AI Mention Tracker &mdash; <a href="https://firstanswer.co/admin/tracker" style="color:#3b82f6;text-decoration:none;">View Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
