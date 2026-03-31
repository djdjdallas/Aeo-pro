import { NextResponse } from "next/server";
import { buildMonthlyReportData } from "@/lib/tracker/report";
import { generateReportPDF } from "@/lib/tracker/pdf-report";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 30;

/**
 * GET /api/tracker/report/[clientId]/pdf?start=2026-02-01&end=2026-02-28
 *
 * Generates and returns a PDF report for a specific client.
 */
export async function GET(request, { params }) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);

    // Default to current month (1st through today)
    let startDate = searchParams.get("start");
    let endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      endDate = now.toISOString().split("T")[0];
    }

    const reportData = await buildMonthlyReportData(startDate, endDate);
    const clientData = reportData.clients.find((c) => c.id === clientId);

    if (!clientData) {
      return NextResponse.json({ error: "Client not found or no data" }, { status: 404 });
    }

    const pdfBuffer = await generateReportPDF(clientData, startDate, endDate);

    const monthLabel = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const filename = `${clientData.business_name.replace(/[^a-zA-Z0-9]/g, "_")}_AEO_Report_${monthLabel.replace(" ", "_")}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
