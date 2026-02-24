import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendUserConfirmation, sendAdminNotification } from "@/lib/email";

/*
  SQL schema — run this in Supabase SQL Editor to create the leads table:

  CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    business_type TEXT NOT NULL,
    location TEXT NOT NULL,
    marketing_spend TEXT NOT NULL,
    plan TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Enable RLS but allow service role full access
  ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
*/

function validate(body) {
  const errors = {};

  if (!body.business_name?.trim()) errors.business_name = "Business name is required";
  if (!body.contact_name?.trim()) errors.contact_name = "Your name is required";

  if (!body.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!body.business_type?.trim()) errors.business_type = "Business type is required";
  if (!body.location?.trim()) errors.location = "City & state is required";
  if (!body.marketing_spend?.trim()) errors.marketing_spend = "Marketing spend is required";

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validate(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.from("leads").insert({
      business_name: body.business_name.trim(),
      contact_name: body.contact_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      business_type: body.business_type.trim(),
      location: body.location.trim(),
      marketing_spend: body.marketing_spend.trim(),
      plan: body.plan || null,
    }).select("id").single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    // Send emails in the background — don't block the response
    const emailData = {
      contactName: body.contact_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      businessName: body.business_name.trim(),
      businessType: body.business_type.trim(),
      location: body.location.trim(),
      marketingSpend: body.marketing_spend.trim(),
      plan: body.plan || null,
    };

    Promise.allSettled([
      sendUserConfirmation(emailData),
      sendAdminNotification(emailData),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Email ${i} failed:`, r.reason);
        }
      });
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
