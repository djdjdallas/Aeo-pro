import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "First Answer <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@firstanswer.co";

/**
 * Send a confirmation email to the user after they submit the audit form.
 */
export async function sendUserConfirmation({ email, contactName, businessName }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `We received your audit request, ${contactName}!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
            Hey ${contactName},
          </h1>
          <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 24px;">
            Thanks for requesting a free AI Visibility Audit for <strong>${businessName}</strong>. We're on it.
          </p>

          <div style="background: #f7f7f7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #4a4a4a; margin: 0 0 12px 0; font-weight: 600;">What happens next:</p>
            <ol style="font-size: 14px; color: #4a4a4a; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>We analyze your website for AI search visibility</li>
              <li>We check how ChatGPT, Perplexity, and Google AI see your business</li>
              <li>You receive a detailed report within 24 hours</li>
            </ol>
          </div>

          <p style="font-size: 14px; color: #6a6a6a; line-height: 1.6;">
            Have questions in the meantime? Just reply to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

          <p style="font-size: 12px; color: #999;">
            First Answer &mdash; Get your business recommended by AI.<br />
            <a href="https://firstanswer.co" style="color: #3b82f6; text-decoration: none;">firstanswer.co</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend user email error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Send user confirmation failed:", err);
    return { success: false, error: err };
  }
}

/**
 * Send a notification email to the admin when a new lead comes in.
 */
export async function sendAdminNotification({ contactName, email, phone, businessName, businessType, location, marketingSpend, plan }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New lead: ${businessName} (${location})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">
            New Lead Submitted
          </h1>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a; width: 140px;">Business</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 600;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Contact</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Phone</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${phone || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Industry</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${businessType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Location</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Monthly Spend</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${marketingSpend}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #6a6a6a;">Plan Interest</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5;">${plan || "None selected"}</td>
            </tr>
          </table>

          <div style="margin-top: 24px;">
            <a href="https://firstanswer.co/admin" style="display: inline-block; background: #3b82f6; color: #fff; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              View in Dashboard
            </a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend admin email error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Send admin notification failed:", err);
    return { success: false, error: err };
  }
}

/**
 * Send a welcome email when a new tracker client is onboarded.
 */
export async function sendClientWelcomeEmail({ email, contactName, businessName, prompts }) {
  if (!email) return { success: false, error: "No email provided" };

  const promptList = (prompts || [])
    .map((p, i) => `<li style="padding:4px 0;color:#d1d5db;">${p}</li>`)
    .join("");

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to First Answer — AI tracking is live for ${businessName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;color:#ffffff;">
            Welcome to First Answer, ${contactName || "there"}!
          </h1>
          <p style="font-size:16px;color:#9ca3af;line-height:1.6;margin-bottom:24px;">
            AI visibility tracking is now active for <strong style="color:#ffffff;">${businessName}</strong>.
          </p>

          <div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="font-size:14px;color:#3b82f6;font-weight:600;margin:0 0 12px 0;">What we're tracking:</p>
            <p style="font-size:13px;color:#9ca3af;margin:0 0 12px 0;">
              We ask ChatGPT, Perplexity, Gemini, and other AI assistants these questions daily:
            </p>
            <ol style="font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
              ${promptList}
            </ol>
          </div>

          <div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="font-size:14px;color:#ffffff;font-weight:600;margin:0 0 12px 0;">What happens next:</p>
            <ol style="font-size:13px;color:#9ca3af;line-height:1.8;margin:0;padding-left:20px;">
              <li>Daily AI checks run automatically across multiple models</li>
              <li>We track whether AI recommends you, with what sentiment, and who your competitors are</li>
              <li>You'll receive a monthly report with trends and actionable insights</li>
              <li>If your visibility drops, we'll alert you immediately</li>
            </ol>
          </div>

          <a href="https://firstanswer.co/dashboard" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
            View Your Dashboard
          </a>

          <hr style="border:none;border-top:1px solid #1f1f1f;margin:32px 0;" />

          <p style="font-size:12px;color:#4b5563;">
            First Answer &mdash; Get your business recommended by AI.<br />
            <a href="https://firstanswer.co" style="color:#3b82f6;text-decoration:none;">firstanswer.co</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Welcome email error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Send welcome email failed:", err);
    return { success: false, error: err };
  }
}

/**
 * Send the monthly AI Mention Tracker report to admin.
 */
export async function sendMonthlyTrackerReport(htmlContent, monthName) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `AI Mention Tracker — ${monthName} Report`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend tracker report error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Send tracker report failed:", err);
    return { success: false, error: err };
  }
}
