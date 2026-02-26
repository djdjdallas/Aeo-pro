import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function PUT(request, { params }) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId } = await params;
    const { prompts } = await request.json();

    if (!prompts?.length) {
      return NextResponse.json({ error: "At least one prompt is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Deactivate all existing prompts for this client
    const { error: deactivateError } = await supabase
      .from("tracked_prompts")
      .update({ is_active: false })
      .eq("client_id", clientId);

    if (deactivateError) throw deactivateError;

    // For existing prompts that were kept, reactivate and update text
    // For new prompts, insert fresh rows
    for (const p of prompts) {
      if (p.id) {
        // Existing prompt — update text and reactivate
        const { error } = await supabase
          .from("tracked_prompts")
          .update({ prompt: p.prompt, is_active: true })
          .eq("id", p.id);
        if (error) throw error;
      } else {
        // New prompt — insert
        const { error } = await supabase
          .from("tracked_prompts")
          .insert({ client_id: clientId, prompt: p.prompt, is_active: true });
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true, updated: prompts.length });
  } catch (err) {
    console.error("Update prompts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
