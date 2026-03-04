import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/client/auth — Send magic link to client email
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if this email is linked to a tracker client
    const { data: clientUser } = await supabaseAdmin
      .from("client_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (!clientUser) {
      // Also check tracker_clients.contact_email
      const { data: client } = await supabaseAdmin
        .from("tracker_clients")
        .select("id")
        .eq("contact_email", email.toLowerCase())
        .single();

      if (!client) {
        // Don't reveal if email exists — generic message
        return NextResponse.json({
          success: true,
          message: "If an account exists for this email, a login link has been sent.",
        });
      }
    }

    // Create a Supabase auth client for magic link
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const redirectUrl = `${request.headers.get("origin") || "https://firstanswer.co"}/dashboard`;

    const { error } = await anonClient.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Magic link error:", error);
      return NextResponse.json({ error: "Failed to send login link" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a login link has been sent.",
    });
  } catch (err) {
    console.error("Client auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
