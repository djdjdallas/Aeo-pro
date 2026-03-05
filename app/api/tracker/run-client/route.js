import { NextResponse } from "next/server";
import { runClientShot } from "@/lib/tracker/runner";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 60;

/**
 * POST /api/tracker/run-client
 * Per-client worker endpoint. Called by the fan-out orchestrator.
 *
 * Body: { client_id, shot, shot_window }
 *
 * Runs 1 shot of all prompts x models for a single client.
 * Model calls within each prompt are parallelized.
 */
export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client_id, shot = 1, shot_window = null } = await request.json();

    if (!client_id) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 });
    }

    const result = await runClientShot(client_id, shot, shot_window);

    if (result.skipped) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Shot exceeds plan allowance",
      });
    }

    return NextResponse.json({
      success: true,
      checked: result.checked,
      mentioned: result.mentioned,
      batchId: result.batchId,
    });
  } catch (err) {
    console.error("Run-client error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
