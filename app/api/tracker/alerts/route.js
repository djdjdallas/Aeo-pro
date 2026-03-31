import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
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

  const supabase = createServerClient();

  // Log cron start
  const { data: cronLog } = await supabase
    .from("cron_run_log")
    .insert({ job_name: "alerts", status: "running" })
    .select("id")
    .single();
  const cronLogId = cronLog?.id;

  try {
    const result = await runAlertChecks();

    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "success",
        completed_at: new Date().toISOString(),
        clients_processed: result.alerts_sent || 0,
      }).eq("id", cronLogId);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Alert check error:", err);
    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err.message,
      }).eq("id", cronLogId).catch(() => {});
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
