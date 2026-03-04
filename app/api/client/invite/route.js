import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/client/invite — Admin invites a client to the portal
 * Creates Supabase Auth user + client_users link, sends magic link email
 */
export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, client_id, full_name } = await request.json();

    if (!email || !client_id) {
      return NextResponse.json({ error: "email and client_id are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify the client exists
    const { data: client } = await supabase
      .from("tracker_clients")
      .select("id, business_name")
      .eq("id", client_id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create Supabase Auth admin client for user management
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create or find the auth user
    let authUserId;
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === email.toLowerCase());

    if (existing) {
      authUserId = existing.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
      });
      if (createError) throw createError;
      authUserId = newUser.user.id;
    }

    // Update tracker_clients with contact email
    await supabase
      .from("tracker_clients")
      .update({ contact_email: email.toLowerCase() })
      .eq("id", client_id);

    // Create or update client_users link
    const { error: linkError } = await supabase
      .from("client_users")
      .upsert({
        auth_user_id: authUserId,
        client_id,
        email: email.toLowerCase(),
        full_name: full_name || null,
      }, { onConflict: "auth_user_id" });

    if (linkError) throw linkError;

    // Send magic link via OTP
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    await anonClient.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${request.headers.get("origin") || "https://firstanswer.co"}/dashboard`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      auth_user_id: authUserId,
    });
  } catch (err) {
    console.error("Client invite error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
