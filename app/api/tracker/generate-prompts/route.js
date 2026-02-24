import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generatePromptsForClient } from "@/lib/tracker/runner";

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { business_name, business_type, location, target_url, lead_id } = body;

    if (!business_name || !business_type || !location) {
      return NextResponse.json(
        { error: "business_name, business_type, and location are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Create the tracker client record
    const { data: client, error: clientError } = await supabase
      .from("tracker_clients")
      .insert({ business_name, business_type, location, target_url: target_url || null, lead_id: lead_id || null })
      .select("id")
      .single();

    if (clientError) throw clientError;

    // Generate prompts with Claude
    const prompts = await generatePromptsForClient(business_type, location);

    // Bulk insert prompts
    const promptRows = prompts.map((p) => ({
      client_id: client.id,
      prompt: p,
    }));

    const { error: promptsError } = await supabase
      .from("tracked_prompts")
      .insert(promptRows);

    if (promptsError) throw promptsError;

    return NextResponse.json({
      success: true,
      client_id: client.id,
      prompts_created: prompts.length,
      prompts,
    });
  } catch (err) {
    console.error("Generate prompts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
