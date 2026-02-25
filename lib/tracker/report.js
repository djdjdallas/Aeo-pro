// lib/tracker/report.js
// Builds monthly report data and renders HTML email for tracker clients

import { createServerClient } from "@/lib/supabase";

/**
 * Queries Supabase for all clients + results in date range,
 * computes per-model mention rate breakdown.
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
    .select("client_id, ai_model, was_mentioned")
    .gte("checked_at", startDate)
    .lte("checked_at", endDate);

  const resultsByClient = {};
  for (const r of results || []) {
    if (!resultsByClient[r.client_id]) resultsByClient[r.client_id] = [];
    resultsByClient[r.client_id].push(r);
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

    return {
      ...client,
      total_checks: total,
      total_mentioned: mentioned,
      overall_rate: overallRate,
      models: modelBreakdown,
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

      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
            <strong style="color:#ffffff;">${c.business_name}</strong><br/>
            <span style="font-size:12px;color:#6b7280;">${c.business_type} &mdash; ${c.location}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;">
            <span style="font-size:20px;font-weight:700;color:${rateColor(c.overall_rate)};">${c.overall_rate !== null ? c.overall_rate + "%" : "—"}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
            ${modelCells || '<span style="color:#6b7280;font-size:12px;">No data</span>'}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;color:#9ca3af;">
            ${c.total_checks}
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
