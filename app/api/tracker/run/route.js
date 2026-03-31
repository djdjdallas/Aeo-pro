import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { runTrackerForClient } from "@/lib/tracker/runner";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 120;

/**
 * GET /api/tracker/run?shot=1
 *
 * Fan-out orchestrator: fetches all active clients and dispatches
 * per-client worker calls in parallel. Each worker runs in its own
 * serverless invocation with its own timeout budget.
 *
 * Query params:
 *   shot=1|2|3 — which shot window to run (from cron)
 *   If no shot param, runs all shots sequentially (legacy/manual mode)
 */
export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const shotParam = searchParams.get("shot");
  const jobName = shotParam ? `tracker-shot-${shotParam}` : "tracker-legacy";

  // Log cron start
  const { data: cronLog } = await supabase
    .from("cron_run_log")
    .insert({ job_name: jobName, status: "running" })
    .select("id")
    .single();
  const cronLogId = cronLog?.id;

  try {
    const { data: allClients } = await supabase
      .from("tracker_clients")
      .select("id, subscription_status")
      .in("subscription_status", ["active", "trialing"]);

    const clientIds = allClients?.map((c) => c.id) || [];

    if (clientIds.length === 0) {
      if (cronLogId) {
        await supabase.from("cron_run_log").update({
          status: "success", completed_at: new Date().toISOString(), clients_processed: 0,
        }).eq("id", cronLogId);
      }
      return NextResponse.json({ success: true, summary: [], message: "No active clients" });
    }

    if (shotParam) {
      // Fan-out mode: dispatch per-client workers in parallel
      const shot = parseInt(shotParam, 10);
      const shotWindows = { 1: "morning", 2: "afternoon", 3: "evening" };
      const shotWindow = shotWindows[shot] || "morning";

      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const workerPromises = clientIds.map(async (clientId) => {
        try {
          const res = await fetch(`${baseUrl}/api/tracker/run-client`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({ client_id: clientId, shot, shot_window: shotWindow }),
          });
          const data = await res.json();
          return { client_id: clientId, ...data };
        } catch (err) {
          console.error(`Worker dispatch failed for ${clientId}:`, err.message);
          return { client_id: clientId, error: err.message };
        }
      });

      const summary = await Promise.allSettled(workerPromises);
      const results = summary.map((s) => s.status === "fulfilled" ? s.value : { error: s.reason?.message });

      if (cronLogId) {
        await supabase.from("cron_run_log").update({
          status: "success", completed_at: new Date().toISOString(), clients_processed: clientIds.length,
        }).eq("id", cronLogId);
      }

      return NextResponse.json({ success: true, shot, summary: results });
    }

    // Legacy mode (no shot param): run all shots sequentially per client
    const summary = [];
    for (const id of clientIds) {
      try {
        const result = await runTrackerForClient(id);
        summary.push({ client_id: id, ...result });
      } catch (err) {
        console.error(`Tracker failed for ${id}:`, err.message);
        summary.push({ client_id: id, error: err.message });
      }
    }

    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "success", completed_at: new Date().toISOString(), clients_processed: clientIds.length,
      }).eq("id", cronLogId);
    }

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("Run tracker error:", err);
    if (cronLogId) {
      await supabase.from("cron_run_log").update({
        status: "failed", completed_at: new Date().toISOString(), error_message: err.message,
      }).eq("id", cronLogId).catch(() => {});
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { client_id } = body;

    const supabase = createServerClient();
    let clientIds = [];

    if (client_id) {
      clientIds = [client_id];
    } else {
      const { data: allClients } = await supabase
        .from("tracker_clients")
        .select("id");
      clientIds = allClients?.map((c) => c.id) || [];
    }

    const summary = [];
    for (const id of clientIds) {
      try {
        const result = await runTrackerForClient(id);
        summary.push({ client_id: id, ...result });
      } catch (err) {
        console.error(`Tracker failed for ${id}:`, err.message);
        summary.push({ client_id: id, error: err.message });
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("Run tracker error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
