import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";
import { createAuthClient } from "@/lib/client-auth";

/**
 * POST /api/stripe/portal — Create a Stripe Customer Portal session
 * Allows clients to manage their subscription, update payment, cancel, etc.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user
    const authClient = createAuthClient(token);
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Find linked client
    const { data: clientUser } = await supabase
      .from("client_users")
      .select("client_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!clientUser) {
      return NextResponse.json({ error: "No client account linked" }, { status: 403 });
    }

    // Get Stripe customer ID
    const { data: client } = await supabase
      .from("tracker_clients")
      .select("stripe_customer_id")
      .eq("id", clientUser.client_id)
      .single();

    if (!client?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const stripe = getStripe();
    const origin = request.headers.get("origin") || "https://firstanswer.co";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
