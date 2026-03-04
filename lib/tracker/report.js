// lib/tracker/report.js
// Builds monthly report data and renders HTML email for tracker clients

import { createServerClient } from "@/lib/supabase";

/**
 * Compute confidence label from multi-shot results.
 * 3/3 = high, 2/3 = moderate, 1/3 = low, 0/3 = none
 */
function confidenceLabel(mentionCount, totalShots) {
  if (totalShots === 0) return "none";
  const ratio = mentionCount / totalShots;
  if (ratio >= 1) return "high";
  if (ratio >= 0.6) return "moderate";
  if (ratio > 0) return "low";
  return "none";
}

/**
 * Queries Supabase for all clients + results in date range,
 * computes per-model mention rate breakdown, SOV, and sentiment.
 */
export async function buildMonthlyReportData(startDate, endDate) {
  const supabase = createServerClient();

  const { data: clients } = await supabase
    .from("tracker_clients")
    .select("id, business_name, business_type, location")
    .order("business_name");

  if (!clients?.length) return { clients: [], startDate, endDate };

  const { data: results } = await supabase
    .from("prompt_results")
    .select("client_id, ai_model, was_mentioned, run_batch_id, run_number, sentiment")
    .gte("checked_at", startDate)
    .lte("checked_at", endDate);

  const resultsByClient = {};
  for (const r of results || []) {
    if (!resultsByClient[r.client_id]) resultsByClient[r.client_id] = [];
    resultsByClient[r.client_id].push(r);
  }

  // Fetch SOV data for each client
  const sovByClient = {};
  for (const client of clients) {
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

        sovByClient[client.id] = { sov, topCompetitors };
      }
    } catch {
      // response_mentions table may not exist yet
    }
  }

  const reportClients = clients.map((client) => {
    const clientResults = resultsByClient[client.id] || [];
    const total = clientResults.length;
    const mentioned = clientResults.filter((r) => r.was_mentioned).length;
    const overallRate = total > 0 ? Math.round((mentioned / total) * 100) : null;

    // Per-model breakdown
    const models = {};
    for (const r of clientResults) {
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
    const sentimentResults = clientResults.filter((r) => r.sentiment);
    const sentimentBreakdown = {
      positive: sentimentResults.filter((r) => r.sentiment === "positive").length,
      neutral: sentimentResults.filter((r) => r.sentiment === "neutral").length,
      negative: sentimentResults.filter((r) => r.sentiment === "negative").length,
    };

    return {
      ...client,
      total_checks: total,
      total_mentioned: mentioned,
      overall_rate: overallRate,
      models: modelBreakdown,
      confidence: confidenceLabel(mentioned, total),
      sov: sovByClient[client.id] || null,
      sentiment: sentimentBreakdown,
    };
  });

  return { clients: reportClients, startDate, endDate };
}

/**
 * Renders a dark-themed HTML email with inline styles showing
 * client table, model breakdown, and color-coded mention rates.
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

      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
            <strong style="color:#ffffff;">${c.business_name}</strong><br/>
            <span style="font-size:12px;color:#6b7280;">${c.business_type} &mdash; ${c.location}</span>
            ${competitorList ? `<br/><span style="font-size:10px;color:#6b7280;">Competitors: </span>${competitorList}` : ""}
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
  <div style="max-width:680px;margin:0 auto;padding:40px 20px;">
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
          <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Overall</th>
          <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">By Model</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #1f1f1f;">Checks</th>
        </tr>
      </thead>
      <tbody>
        ${clientRows || '<tr><td colspan="4" style="padding:24px;text-align:center;color:#6b7280;">No client data for this period.</td></tr>'}
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
