import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { runTrackerForClient } from "@/lib/tracker/runner";
import { isAdminAuthed } from "@/lib/admin-auth";

export const maxDuration = 120;

export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data: allClients } = await supabase
      .from("tracker_clients")
      .select("id");
    const clientIds = allClients?.map((c) => c.id) || [];

    const summary = [];
    for (const id of clientIds) {
      const result = await runTrackerForClient(id);
      summary.push({ client_id: id, ...result });
    }

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("Run tracker error:", err);
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
      const result = await runTrackerForClient(id);
      summary.push({ client_id: id, ...result });
    }

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("Run tracker error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
