// lib/tracker/alerts.js
// Detect visibility drops, competitor overtakes, and trigger email alerts

import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "First Answer <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@firstanswer.co";

/**
 * Check all clients for alertable conditions and send emails.
 * Called by cron after the daily tracker run completes.
 */
export async function runAlertChecks() {
  const supabase = createServerClient();

  const { data: clients } = await supabase
    .from("tracker_clients")
    .select("id, business_name, contact_email, alert_threshold, plan");

  if (!clients?.length) return { alerts_sent: 0 };

  const alertsSent = [];

  for (const client of clients) {
    try {
      // Get last 2 batches to compare
      const { data: batches } = await supabase
        .from("prompt_results")
        .select("run_batch_id, checked_at")
        .eq("client_id", client.id)
        .order("checked_at", { ascending: false })
        .limit(1);

      if (!batches?.length) continue;

      const latestBatchId = batches[0].run_batch_id;
      if (!latestBatchId) continue;

      // Get latest batch results
      const { data: latestResults } = await supabase
        .from("prompt_results")
        .select("was_mentioned")
        .eq("client_id", client.id)
        .eq("run_batch_id", latestBatchId);

      if (!latestResults?.length) continue;

      const latestMentions = latestResults.filter((r) => r.was_mentioned).length;
      const latestRate = Math.round((latestMentions / latestResults.length) * 100);

      // Get previous batch (different batch ID)
      const { data: prevBatches } = await supabase
        .from("prompt_results")
        .select("run_batch_id")
        .eq("client_id", client.id)
        .neq("run_batch_id", latestBatchId)
        .order("checked_at", { ascending: false })
        .limit(1);

      let prevRate = null;
      if (prevBatches?.length) {
        const prevBatchId = prevBatches[0].run_batch_id;
        const { data: prevResults } = await supabase
          .from("prompt_results")
          .select("was_mentioned")
          .eq("client_id", client.id)
          .eq("run_batch_id", prevBatchId);

        if (prevResults?.length) {
          const prevMentions = prevResults.filter((r) => r.was_mentioned).length;
          prevRate = Math.round((prevMentions / prevResults.length) * 100);
        }
      }

      const threshold = client.alert_threshold || 20;
      const alerts = [];

      // Alert 1: Mention rate dropped below threshold
      if (latestRate < threshold && (prevRate === null || prevRate >= threshold)) {
        alerts.push({
          type: "visibility_drop",
          message: `${client.business_name}: Mention rate dropped to ${latestRate}% (threshold: ${threshold}%).${prevRate !== null ? ` Previous: ${prevRate}%` : ""}`,
        });
      }

      // Alert 2: Significant drop (>20 points) even if above threshold
      if (prevRate !== null && prevRate - latestRate >= 20) {
        alerts.push({
          type: "visibility_drop",
          message: `${client.business_name}: Mention rate dropped ${prevRate - latestRate} points (${prevRate}% → ${latestRate}%).`,
        });
      }

      // Alert 3: Competitor overtake (SOV check)
      try {
        const { data: mentions } = await supabase
          .from("response_mentions")
          .select("business_name, is_client")
          .eq("client_id", client.id)
          .eq("result_id", latestResults[0]?.id); // Just check latest

        if (mentions?.length) {
          const clientCount = mentions.filter((m) => m.is_client).length;
          const competitorCounts = {};
          for (const m of mentions) {
            if (!m.is_client) {
              competitorCounts[m.business_name] = (competitorCounts[m.business_name] || 0) + 1;
            }
          }
          const topCompetitor = Object.entries(competitorCounts).sort((a, b) => b[1] - a[1])[0];
          if (topCompetitor && topCompetitor[1] > clientCount) {
            alerts.push({
              type: "competitor_overtake",
              message: `${client.business_name}: "${topCompetitor[0]}" is now mentioned more often (${topCompetitor[1]} vs ${clientCount} times).`,
            });
          }
        }
      } catch {
        // response_mentions may not have data yet
      }

      // Send alerts
      for (const alert of alerts) {
        const recipients = [ADMIN_EMAIL];
        if (client.contact_email) recipients.push(client.contact_email);

        const emailTo = [...new Set(recipients)];

        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: emailTo,
            subject: `AI Visibility Alert: ${client.business_name}`,
            html: buildAlertEmailHtml(client.business_name, alert.message, latestRate, prevRate),
          });

          await supabase.from("alert_log").insert({
            client_id: client.id,
            alert_type: alert.type,
            message: alert.message,
            sent_to: emailTo.join(", "),
          });

          alertsSent.push({ client: client.business_name, type: alert.type });
        } catch (emailErr) {
          console.error(`Failed to send alert for ${client.business_name}:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error(`Alert check failed for client ${client.id}:`, err.message);
    }
  }

  return { alerts_sent: alertsSent.length, details: alertsSent };
}

function buildAlertEmailHtml(businessName, message, currentRate, previousRate) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#111111;border:1px solid #ef4444;border-radius:12px;padding:24px;">
      <h2 style="color:#ef4444;font-size:18px;margin:0 0 12px 0;">AI Visibility Alert</h2>
      <p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 16px 0;">${businessName}</p>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px 0;">${message}</p>

      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="background:#1f1f1f;border-radius:8px;padding:12px;flex:1;text-align:center;">
          <p style="color:#6b7280;font-size:11px;margin:0 0 4px 0;">Current</p>
          <p style="color:${currentRate < 20 ? "#ef4444" : currentRate < 50 ? "#eab308" : "#22c55e"};font-size:24px;font-weight:700;margin:0;">${currentRate}%</p>
        </div>
        ${previousRate !== null ? `
        <div style="background:#1f1f1f;border-radius:8px;padding:12px;flex:1;text-align:center;">
          <p style="color:#6b7280;font-size:11px;margin:0 0 4px 0;">Previous</p>
          <p style="color:#9ca3af;font-size:24px;font-weight:700;margin:0;">${previousRate}%</p>
        </div>
        ` : ""}
      </div>

      <a href="https://firstanswer.co/dashboard" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">
        View Dashboard
      </a>
    </div>

    <p style="font-size:12px;color:#4b5563;margin-top:16px;">
      First Answer AI Visibility Alerts &mdash; <a href="https://firstanswer.co" style="color:#3b82f6;text-decoration:none;">firstanswer.co</a>
    </p>
  </div>
</body>
</html>`;
}
