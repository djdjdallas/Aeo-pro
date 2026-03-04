import { NextResponse } from "next/server";
import { getStripe, PLAN_PRICES } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/stripe/checkout — Create a Stripe Checkout Session
 * Body: { plan: "starter"|"growth"|"pro", client_id?: string, email?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { plan, client_id, email } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PLAN_PRICES[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this plan. Contact support." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get("origin") || "https://firstanswer.co";

    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        plan,
        ...(client_id && { client_id }),
      },
      subscription_data: {
        metadata: {
          plan,
          ...(client_id && { client_id }),
        },
      },
    };

    // Pre-fill email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    // If client already has a Stripe customer, reuse it
    if (client_id) {
      const supabase = createServerClient();
      const { data: client } = await supabase
        .from("tracker_clients")
        .select("stripe_customer_id")
        .eq("id", client_id)
        .single();

      if (client?.stripe_customer_id) {
        sessionParams.customer = client.stripe_customer_id;
        delete sessionParams.customer_email;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
