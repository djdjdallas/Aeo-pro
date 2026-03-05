import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  buildMonthlyReportData,
  buildReportEmailHtml,
  buildClientReportEmailHtml,
} from "@/lib/tracker/report";
import { sendMonthlyTrackerReport, sendClientMonthlyReport } from "@/lib/email";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 60;

/**
 * Compute the previous month's date range.
 */
function getPreviousMonthRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(firstOfThisMonth);
  lastMonth.setDate(lastMonth.getDate() - 1);

  const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endDate = lastMonth.toISOString().split("T")[0];
  return { startDate, endDate };
}

export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startDate, endDate } = getPreviousMonthRange();
    const reportData = await buildMonthlyReportData(startDate, endDate);

    const monthName = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // 1. Send admin summary email
    const adminHtml = buildReportEmailHtml(reportData);
    const adminResult = await sendMonthlyTrackerReport(adminHtml, monthName);

    // 2. Send per-client emails
    const clientResults = [];
    const supabase = createServerClient();

    for (const clientData of reportData.clients) {
      if (!clientData.contact_email) continue;
      if (clientData.total_checks === 0) continue;

      const clientHtml = buildClientReportEmailHtml(clientData, startDate, endDate);
      const result = await sendClientMonthlyReport({
        email: clientData.contact_email,
        businessName: clientData.business_name,
        htmlContent: clientHtml,
        monthName,
      });

      // Log to generated_reports table
      try {
        await supabase.from("generated_reports").insert({
          client_id: clientData.id,
          report_type: "monthly",
          period_start: startDate,
          period_end: endDate,
          sent_to: [clientData.contact_email],
          sent_at: result.success ? new Date().toISOString() : null,
        });
      } catch { /* table may not exist yet */ }

      clientResults.push({
        client: clientData.business_name,
        email: clientData.contact_email,
        success: result.success,
      });
    }

    return NextResponse.json({
      success: true,
      period: { startDate, endDate },
      admin_email: adminResult.success,
      client_reports: clientResults,
    });
  } catch (err) {
    console.error("Send report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let startDate, endDate;

    try {
      const body = await request.json();
      startDate = body.start_date;
      endDate = body.end_date;
    } catch {
      // No body or invalid JSON — use defaults
    }

    if (!startDate || !endDate) {
      const range = getPreviousMonthRange();
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const reportData = await buildMonthlyReportData(startDate, endDate);

    const monthName = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Send admin summary
    const adminHtml = buildReportEmailHtml(reportData);
    const adminResult = await sendMonthlyTrackerReport(adminHtml, monthName);

    // Send per-client emails
    const clientResults = [];
    const supabase = createServerClient();

    for (const clientData of reportData.clients) {
      if (!clientData.contact_email) continue;
      if (clientData.total_checks === 0) continue;

      const clientHtml = buildClientReportEmailHtml(clientData, startDate, endDate);
      const result = await sendClientMonthlyReport({
        email: clientData.contact_email,
        businessName: clientData.business_name,
        htmlContent: clientHtml,
        monthName,
      });

      try {
        await supabase.from("generated_reports").insert({
          client_id: clientData.id,
          report_type: "monthly",
          period_start: startDate,
          period_end: endDate,
          sent_to: [clientData.contact_email],
          sent_at: result.success ? new Date().toISOString() : null,
        });
      } catch { /* table may not exist yet */ }

      clientResults.push({
        client: clientData.business_name,
        email: clientData.contact_email,
        success: result.success,
      });
    }

    return NextResponse.json({
      success: true,
      period: { startDate, endDate },
      admin_email: adminResult.success,
      client_reports: clientResults,
    });
  } catch (err) {
    console.error("Send report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
