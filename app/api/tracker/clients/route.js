import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data: clients, error } = await supabase
    .from("tracker_clients")
    .select(`
      *,
      tracked_prompts(count),
      prompt_results(was_mentioned, checked_at)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }

  // Compute summary stats per client
  const clientsWithStats = clients.map((c) => {
    const results = c.prompt_results || [];
    const totalChecks = results.length;
    const totalMentions = results.filter((r) => r.was_mentioned).length;
    const mentionRate = totalChecks > 0
      ? Math.round((totalMentions / totalChecks) * 100)
      : 0;
    const lastChecked = results[0]?.checked_at || null;

    return {
      id: c.id,
      business_name: c.business_name,
      business_type: c.business_type,
      location: c.location,
      target_url: c.target_url,
      created_at: c.created_at,
      prompt_count: c.tracked_prompts?.[0]?.count || 0,
      total_checks: totalChecks,
      mention_rate: mentionRate,
      last_checked: lastChecked,
    };
  });

  return NextResponse.json({ clients: clientsWithStats });
}
