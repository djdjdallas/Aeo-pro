import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function DELETE(request, { params }) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Delete in order: results → prompts → client (foreign key deps)
  const { error: resultsErr } = await supabase
    .from("prompt_results")
    .delete()
    .eq("client_id", clientId);

  if (resultsErr) {
    console.error("Delete results error:", resultsErr);
    return NextResponse.json({ error: "Failed to delete results" }, { status: 500 });
  }

  const { error: promptsErr } = await supabase
    .from("tracked_prompts")
    .delete()
    .eq("client_id", clientId);

  if (promptsErr) {
    console.error("Delete prompts error:", promptsErr);
    return NextResponse.json({ error: "Failed to delete prompts" }, { status: 500 });
  }

  const { error: clientErr } = await supabase
    .from("tracker_clients")
    .delete()
    .eq("id", clientId);

  if (clientErr) {
    console.error("Delete client error:", clientErr);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
