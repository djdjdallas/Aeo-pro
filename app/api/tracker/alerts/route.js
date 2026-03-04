import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { runAlertChecks } from "@/lib/tracker/alerts";

export const maxDuration = 60;

/**
 * GET /api/tracker/alerts — Run alert checks (called by cron after daily tracker run)
 */
export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAlertChecks();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Alert check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
