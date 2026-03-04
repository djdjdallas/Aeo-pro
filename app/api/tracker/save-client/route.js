import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";
import { sendClientWelcomeEmail } from "@/lib/email";

export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { business_name, business_type, location, target_url, lead_id, prompts, contact_email, contact_name } = body;

    if (!business_name || !business_type || !prompts?.length) {
      return NextResponse.json(
        { error: "business_name, business_type, and prompts are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Create the tracker client record
    const { data: client, error: clientError } = await supabase
      .from("tracker_clients")
      .insert({
        business_name,
        business_type,
        location,
        target_url: target_url || null,
        lead_id: lead_id || null,
        contact_email: contact_email || null,
      })
      .select("id")
      .single();

    if (clientError) throw clientError;

    // Bulk insert the user-reviewed prompts
    const promptRows = prompts
      .filter((p) => p.trim())
      .map((p) => ({
        client_id: client.id,
        prompt: p.trim(),
      }));

    const { error: promptsError } = await supabase
      .from("tracked_prompts")
      .insert(promptRows);

    if (promptsError) throw promptsError;

    // Send welcome email if contact email was provided
    if (contact_email) {
      try {
        await sendClientWelcomeEmail({
          email: contact_email,
          contactName: contact_name || business_name,
          businessName: business_name,
          prompts: promptRows.map((r) => r.prompt),
        });
      } catch (emailErr) {
        console.error("Welcome email failed (non-fatal):", emailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      client_id: client.id,
      prompts_created: promptRows.length,
      prompts: promptRows.map((r) => r.prompt),
    });
  } catch (err) {
    console.error("Save client error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
