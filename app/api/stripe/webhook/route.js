import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";

export const maxDuration = 30;

/**
 * POST /api/stripe/webhook — Handle Stripe webhook events
 */
export async function POST(request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const clientId = session.metadata?.client_id;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (clientId) {
          await supabase
            .from("tracker_clients")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: plan || "starter",
              subscription_status: "active",
              contact_email: session.customer_email || session.customer_details?.email,
            })
            .eq("id", clientId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const status = subscription.status; // active, past_due, canceled, unpaid, etc.
        const plan = subscription.metadata?.plan;

        // Find client by subscription ID
        const { data: client } = await supabase
          .from("tracker_clients")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (client) {
          const update = { subscription_status: status };
          if (plan) update.plan = plan;
          await supabase.from("tracker_clients").update(update).eq("id", client.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const { data: client } = await supabase
          .from("tracker_clients")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (client) {
          await supabase
            .from("tracker_clients")
            .update({ subscription_status: "canceled" })
            .eq("id", client.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: client } = await supabase
          .from("tracker_clients")
          .select("id, contact_email, business_name")
          .eq("stripe_customer_id", customerId)
          .single();

        if (client) {
          await supabase
            .from("tracker_clients")
            .update({ subscription_status: "past_due" })
            .eq("id", client.id);

          // Log the alert
          await supabase.from("alert_log").insert({
            client_id: client.id,
            alert_type: "visibility_drop",
            message: `Payment failed for ${client.business_name}. Subscription is past due.`,
            sent_to: process.env.ADMIN_EMAIL || "hello@firstanswer.co",
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
