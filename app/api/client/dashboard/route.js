import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createAuthClient } from "@/lib/client-auth";
import { buildTrendData } from "@/lib/tracker/trends";

/**
 * GET /api/client/dashboard — Returns all dashboard data for the authenticated client
 */
export async function GET(request) {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user
    const authClient = createAuthClient(token);
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Find the linked client
    const { data: clientUser } = await supabase
      .from("client_users")
      .select("client_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!clientUser) {
      return NextResponse.json({ error: "No client account linked" }, { status: 403 });
    }

    const clientId = clientUser.client_id;

    // Fetch client details
    const { data: client } = await supabase
      .from("tracker_clients")
      .select("id, business_name, business_type, location, target_url, plan, subscription_status")
      .eq("id", clientId)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch results
    const { data: results } = await supabase
      .from("prompt_results")
      .select("*, tracked_prompts(prompt)")
      .eq("client_id", clientId)
      .order("checked_at", { ascending: false })
      .limit(500);

    // Compute stats
    const totalChecks = results?.length || 0;
    const totalMentions = results?.filter((r) => r.was_mentioned).length || 0;
    const mentionRate = totalChecks > 0 ? Math.round((totalMentions / totalChecks) * 100) : 0;

    // Sentiment
    const sentimentResults = results?.filter((r) => r.sentiment) || [];
    const sentiment = {
      positive: sentimentResults.filter((r) => r.sentiment === "positive").length,
      neutral: sentimentResults.filter((r) => r.sentiment === "neutral").length,
      negative: sentimentResults.filter((r) => r.sentiment === "negative").length,
    };

    // SOV
    let sov = null;
    try {
      const { data: mentions } = await supabase
        .from("response_mentions")
        .select("business_name, is_client")
        .eq("client_id", clientId);

      if (mentions?.length) {
        const clientMentions = mentions.filter((m) => m.is_client).length;
        const competitorCounts = {};
        for (const m of mentions) {
          if (!m.is_client) {
            competitorCounts[m.business_name] = (competitorCounts[m.business_name] || 0) + 1;
          }
        }
        const topCompetitors = Object.entries(competitorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));
        sov = { sov: Math.round((clientMentions / mentions.length) * 100), topCompetitors };
      }
    } catch {}

    // Citations
    let citations = null;
    try {
      const { data: citationData } = await supabase
        .from("response_citations")
        .select("cited_domain, is_client_url")
        .eq("client_id", clientId);

      if (citationData?.length) {
        const domainCounts = {};
        let clientCites = 0;
        for (const c of citationData) {
          domainCounts[c.cited_domain] = (domainCounts[c.cited_domain] || 0) + 1;
          if (c.is_client_url) clientCites++;
        }
        const topDomains = Object.entries(domainCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([domain, count]) => ({ domain, count }));
        citations = { total: citationData.length, clientCitations: clientCites, topDomains };
      }
    } catch {}

    // Trend data
    const trend = buildTrendData(results || []);

    // Prompts
    const { data: prompts } = await supabase
      .from("tracked_prompts")
      .select("id, prompt")
      .eq("client_id", clientId)
      .eq("is_active", true);

    return NextResponse.json({
      client,
      stats: { total_checks: totalChecks, total_mentions: totalMentions, mention_rate: mentionRate },
      sentiment,
      sov,
      citations,
      trend,
      prompts: prompts || [],
      recent_results: (results || []).slice(0, 50),
    });
  } catch (err) {
    console.error("Client dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
