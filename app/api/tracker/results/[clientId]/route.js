import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function GET(request, { params }) {
  const { clientId } = await params;

  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data: client } = await supabase
    .from("tracker_clients")
    .select("*")
    .eq("id", clientId)
    .single();

  const { data: results } = await supabase
    .from("prompt_results")
    .select(`*, tracked_prompts(prompt)`)
    .eq("client_id", clientId)
    .order("checked_at", { ascending: false });

  const totalChecks = results?.length || 0;
  const totalMentions = results?.filter((r) => r.was_mentioned).length || 0;
  const mentionRate = totalChecks > 0
    ? Math.round((totalMentions / totalChecks) * 100)
    : 0;

  // Group by date for trend chart
  const byDate = {};
  results?.forEach((r) => {
    const date = r.checked_at.split("T")[0];
    if (!byDate[date]) byDate[date] = { total: 0, mentioned: 0 };
    byDate[date].total++;
    if (r.was_mentioned) byDate[date].mentioned++;
  });

  return NextResponse.json({
    client,
    stats: { total_checks: totalChecks, total_mentions: totalMentions, mention_rate: mentionRate },
    trend: byDate,
    results: results || [],
  });
}
