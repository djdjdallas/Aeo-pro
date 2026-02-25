import { NextResponse } from "next/server";
import { buildMonthlyReportData, buildReportEmailHtml } from "@/lib/tracker/report";
import { sendMonthlyTrackerReport } from "@/lib/email";

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let startDate, endDate;

    // Accept optional body with custom date range
    try {
      const body = await request.json();
      startDate = body.start_date;
      endDate = body.end_date;
    } catch {
      // No body or invalid JSON — use defaults
    }

    // Default to previous calendar month
    if (!startDate || !endDate) {
      const now = new Date();
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(firstOfThisMonth);
      lastMonth.setDate(lastMonth.getDate() - 1);

      startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      endDate = lastMonth.toISOString().split("T")[0];
    }

    const reportData = await buildMonthlyReportData(startDate, endDate);
    const html = buildReportEmailHtml(reportData);

    const monthName = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const result = await sendMonthlyTrackerReport(html, monthName);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      period: { startDate, endDate },
      clients: reportData.clients.length,
    });
  } catch (err) {
    console.error("Send report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
