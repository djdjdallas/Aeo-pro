import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";

/**
 * PATCH /api/tracker/clients/[clientId]/update
 * Update editable fields on a tracker client.
 */
export async function PATCH(request, { params }) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId } = await params;
    const body = await request.json();

    // Allowlist of updatable fields
    const allowed = [
      "business_name", "business_type", "location", "target_url",
      "description", "buyer_persona", "buyer_jtbd", "differentiators",
      "competitors", "contact_email", "name_aliases", "alert_threshold",
      "plan", "monthly_api_budget",
    ];

    const update = {};
    for (const key of allowed) {
      if (key in body) {
        if (key === "name_aliases") {
          update[key] = Array.isArray(body[key]) ? body[key].filter(Boolean) : [];
        } else {
          update[key] = body[key];
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("tracker_clients")
      .update(update)
      .eq("id", clientId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, client: data });
  } catch (err) {
    console.error("Update client error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
