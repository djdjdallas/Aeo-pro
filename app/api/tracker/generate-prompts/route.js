import { NextResponse } from "next/server";
import { generatePromptsForClient } from "@/lib/tracker/runner";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { business_name, business_type, location, differentiators } = body;

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "business_name and business_type are required" },
        { status: 400 }
      );
    }

    // Generate prompts with Claude — no DB writes yet
    const prompts = await generatePromptsForClient(business_type, location || "", business_name, differentiators || "");

    return NextResponse.json({
      success: true,
      prompts,
    });
  } catch (err) {
    console.error("Generate prompts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
