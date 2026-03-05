import { createServerClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Comparison — Admin",
  robots: "noindex, nofollow",
};

export default async function CompareClientsPage() {
  const supabase = createServerClient();

  // Fetch all clients
  const { data: clients } = await supabase
    .from("tracker_clients")
    .select("id, business_name, business_type, location, plan, subscription_status")
    .order("business_name");

  if (!clients?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Client Comparison</h1>
        <p className="text-gray-500">No clients found.</p>
      </div>
    );
  }

  // Fetch latest monthly snapshots for all clients
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];

  const { data: currentSnapshots } = await supabase
    .from("monthly_snapshots")
    .select("*")
    .gte("month_start", prevMonthStart)
    .order("month_start", { ascending: false });

  // Also fetch raw stats for clients without snapshots
  const { data: rawResults } = await supabase
    .from("prompt_results")
    .select("client_id, was_mentioned, mention_rank, sentiment, checked_at")
    .gte("checked_at", new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString());

  // SOV data
  const { data: allMentions } = await supabase
    .from("response_mentions")
    .select("client_id, is_client")
    .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString());

  // Build comparison data
  const clientData = clients.map((client) => {
    // Try monthly snapshot first
    const snapshot = (currentSnapshots || []).find((s) => s.client_id === client.id);
    if (snapshot) {
      return {
        ...client,
        mention_rate: snapshot.mention_rate,
        aeo_score: snapshot.aeo_composite_score,
        pqs: snapshot.position_quality_score,
        sov: snapshot.sov_percentage,
        sentiment_positive: snapshot.sentiment_positive,
        sentiment_neutral: snapshot.sentiment_neutral,
        sentiment_negative: snapshot.sentiment_negative,
        total_checks: snapshot.total_checks,
        source: "snapshot",
      };
    }

    // Fallback to raw results
    const clientResults = (rawResults || []).filter((r) => r.client_id === client.id);
    const total = clientResults.length;
    const mentioned = clientResults.filter((r) => r.was_mentioned).length;
    const rate = total > 0 ? Math.round((mentioned / total) * 100) : null;

    const sentimentResults = clientResults.filter((r) => r.sentiment);
    const sentPos = sentimentResults.filter((r) => r.sentiment === "positive").length;
    const sentNeu = sentimentResults.filter((r) => r.sentiment === "neutral").length;
    const sentNeg = sentimentResults.filter((r) => r.sentiment === "negative").length;

    // SOV from mentions data
    const clientMentions = (allMentions || []).filter((m) => m.client_id === client.id);
    const clientSovCount = clientMentions.filter((m) => m.is_client).length;
    const sov = clientMentions.length > 0 ? Math.round((clientSovCount / clientMentions.length) * 100) : null;

    return {
      ...client,
      mention_rate: rate,
      aeo_score: null,
      pqs: null,
      sov,
      sentiment_positive: sentPos,
      sentiment_neutral: sentNeu,
      sentiment_negative: sentNeg,
      total_checks: total,
      source: "raw",
    };
  });

  // Sort by AEO score, then mention rate
  const sorted = [...clientData].sort((a, b) => {
    if (a.aeo_score !== null && b.aeo_score !== null) return b.aeo_score - a.aeo_score;
    if (a.aeo_score !== null) return -1;
    if (b.aeo_score !== null) return 1;
    return (b.mention_rate || 0) - (a.mention_rate || 0);
  });

  function rateColor(rate) {
    if (rate === null || rate === undefined) return "text-gray-500";
    if (rate >= 50) return "text-green-400";
    if (rate >= 20) return "text-yellow-400";
    return "text-red-400";
  }

  // Aggregate stats
  const avgRate = clientData.filter((c) => c.mention_rate !== null).length > 0
    ? Math.round(clientData.filter((c) => c.mention_rate !== null).reduce((s, c) => s + c.mention_rate, 0) / clientData.filter((c) => c.mention_rate !== null).length)
    : null;
  const avgSov = clientData.filter((c) => c.sov !== null).length > 0
    ? Math.round(clientData.filter((c) => c.sov !== null).reduce((s, c) => s + c.sov, 0) / clientData.filter((c) => c.sov !== null).length)
    : null;
  const totalChecks = clientData.reduce((s, c) => s + c.total_checks, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Client <span className="text-[#3b82f6]">Comparison</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {clients.length} clients &middot; Side-by-side performance metrics
          </p>
        </div>
        <Link
          href="/admin/tracker"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Tracker
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Mention Rate</p>
          <p className={`text-3xl font-bold ${rateColor(avgRate)}`}>{avgRate !== null ? `${avgRate}%` : "—"}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Share of Voice</p>
          <p className="text-3xl font-bold text-[#3b82f6]">{avgSov !== null ? `${avgSov}%` : "—"}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Checks</p>
          <p className="text-3xl font-bold text-white">{totalChecks.toLocaleString()}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clients Tracked</p>
          <p className="text-3xl font-bold text-white">{clients.length}</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1f1f1f]">
          <span>#</span>
          <span>Client</span>
          <span className="text-center">AEO Score</span>
          <span className="text-center">Mention Rate</span>
          <span className="text-center">SOV</span>
          <span className="text-center">PQS</span>
          <span className="text-center">Checks</span>
          <span className="text-center">Sentiment</span>
        </div>

        {sorted.map((c, i) => {
          const totalSent = c.sentiment_positive + c.sentiment_neutral + c.sentiment_negative;
          return (
            <div
              key={c.id}
              className="grid grid-cols-1 lg:grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 lg:gap-4 px-6 py-3 border-b border-[#1f1f1f] hover:bg-[#0d0d0d] transition-colors items-center"
            >
              <span className="text-sm text-gray-600 font-medium">{i + 1}</span>
              <div>
                <Link
                  href={`/admin/tracker/${c.id}`}
                  className="text-sm text-white font-medium hover:text-[#3b82f6] transition-colors"
                >
                  {c.business_name}
                </Link>
                <p className="text-xs text-gray-600">
                  {c.business_type} &middot; {c.location}
                  <span className={`ml-2 ${
                    c.plan === "pro" ? "text-purple-400" :
                    c.plan === "growth" ? "text-blue-400" :
                    "text-gray-500"
                  }`}>
                    {c.plan || "starter"}
                  </span>
                </p>
              </div>
              <div className="text-center">
                {c.aeo_score !== null ? (
                  <span className={`text-lg font-bold ${rateColor(c.aeo_score)}`}>{c.aeo_score}</span>
                ) : (
                  <span className="text-gray-600 text-sm">—</span>
                )}
              </div>
              <div className="text-center">
                <span className={`text-sm font-semibold ${rateColor(c.mention_rate)}`}>
                  {c.mention_rate !== null ? `${c.mention_rate}%` : "—"}
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-[#3b82f6]">
                  {c.sov !== null ? `${c.sov}%` : "—"}
                </span>
              </div>
              <div className="text-center">
                <span className={`text-sm font-semibold ${rateColor(c.pqs)}`}>
                  {c.pqs !== null ? c.pqs : "—"}
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-400">{c.total_checks}</span>
              </div>
              <div className="text-center">
                {totalSent > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#1f1f1f] w-20">
                      {c.sentiment_positive > 0 && (
                        <div className="bg-green-500" style={{ width: `${Math.round((c.sentiment_positive / totalSent) * 100)}%` }} />
                      )}
                      {c.sentiment_neutral > 0 && (
                        <div className="bg-gray-500" style={{ width: `${Math.round((c.sentiment_neutral / totalSent) * 100)}%` }} />
                      )}
                      {c.sentiment_negative > 0 && (
                        <div className="bg-red-500" style={{ width: `${Math.round((c.sentiment_negative / totalSent) * 100)}%` }} />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.sentiment_positive}/{c.sentiment_neutral}/{c.sentiment_negative}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">No clients to compare.</div>
        )}
      </div>
    </div>
  );
}
