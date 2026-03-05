import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import TrackerClientActions from "@/components/tracker/TrackerClientActions";
import TrackerResultsTable from "@/components/tracker/TrackerResultsTable";
import EditablePromptsList from "@/components/tracker/EditablePromptsList";
import TrendChart from "@/components/tracker/TrendChart";
import ServiceTasksList from "@/components/tracker/ServiceTasksList";
import { mentionRateWithCI, positionQualityScore, aeoCompositeScore, shareOfVoice } from "@/lib/tracker/metrics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Tracker — Admin",
  robots: "noindex, nofollow",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function TrackerClientPage({ params }) {
  const { clientId } = await params;

  const supabase = createServerClient();

  const { data: client } = await supabase
    .from("tracker_clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) redirect("/admin/tracker");

  const { data: results } = await supabase
    .from("prompt_results")
    .select(`*, tracked_prompts(prompt)`)
    .eq("client_id", clientId)
    .order("checked_at", { ascending: false });

  const { data: prompts } = await supabase
    .from("tracked_prompts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true);

  const totalChecks = results?.length || 0;
  const totalMentions = results?.filter((r) => r.was_mentioned).length || 0;
  const lastChecked = results?.[0]?.checked_at || null;

  // Wilson confidence interval
  const { rate: mentionRate, lower: ciLower, upper: ciUpper } = mentionRateWithCI(totalMentions, totalChecks);

  // Position quality score
  const mentionedWithRank = (results || []).filter((r) => r.was_mentioned && r.mention_rank);
  const pqs = positionQualityScore(mentionedWithRank);

  // Confidence from latest batch
  const latestBatchId = results?.find((r) => r.run_batch_id)?.run_batch_id;
  let confidenceLabel = "—";
  if (latestBatchId) {
    const batchResults = results.filter((r) => r.run_batch_id === latestBatchId);
    const batchMentioned = batchResults.filter((r) => r.was_mentioned).length;
    const ratio = batchResults.length > 0 ? batchMentioned / batchResults.length : 0;
    confidenceLabel = ratio >= 1 ? "High" : ratio >= 0.6 ? "Moderate" : ratio > 0 ? "Low" : "None";
  }

  // Sentiment breakdown
  const sentimentResults = results?.filter((r) => r.sentiment) || [];
  const sentimentPositive = sentimentResults.filter((r) => r.sentiment === "positive").length;
  const sentimentNeutral = sentimentResults.filter((r) => r.sentiment === "neutral").length;
  const sentimentNegative = sentimentResults.filter((r) => r.sentiment === "negative").length;

  // SOV data
  let sovData = null;
  try {
    const { data: mentions } = await supabase
      .from("response_mentions")
      .select("business_name, is_client")
      .eq("client_id", clientId);

    if (mentions?.length) {
      const clientMentions = mentions.filter((m) => m.is_client).length;
      const sovPct = Math.round((clientMentions / mentions.length) * 100);
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
      sovData = { sov: sovPct, topCompetitors };
    }
  } catch {
    // response_mentions table may not exist yet
  }

  // Compute AEO composite score
  const totalSentiment = sentimentPositive + sentimentNeutral + sentimentNegative;
  const sentPosPct = totalSentiment > 0 ? Math.round((sentimentPositive / totalSentiment) * 100) : 50;
  const sentNegPct = totalSentiment > 0 ? Math.round((sentimentNegative / totalSentiment) * 100) : 0;
  const sovPctForScore = sovData?.sov || 0;
  const aeoScore = totalChecks > 0 ? aeoCompositeScore({
    mentionRate,
    pqs,
    sov: sovPctForScore,
    sentimentPositivePct: sentPosPct,
    sentimentNegativePct: sentNegPct,
  }) : null;

  // Citation data
  let citationData = null;
  try {
    const { data: citations } = await supabase
      .from("response_citations")
      .select("cited_domain, is_client_url")
      .eq("client_id", clientId);

    if (citations?.length) {
      const domainCounts = {};
      let clientCitations = 0;
      for (const c of citations) {
        domainCounts[c.cited_domain] = (domainCounts[c.cited_domain] || 0) + 1;
        if (c.is_client_url) clientCitations++;
      }
      const topDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain, count]) => ({ domain, count }));
      citationData = { total: citations.length, clientCitations, topDomains };
    }
  } catch {
    // response_citations table may not exist yet
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/tracker"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              &larr; Tracker
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{client.business_name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {client.business_type} &middot; {client.location}
            {client.plan && (
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                client.plan === "pro" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                client.plan === "growth" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                "bg-gray-500/10 text-gray-400 border border-gray-500/20"
              }`}>
                {client.plan}
              </span>
            )}
            {client.target_url && (
              <a
                href={client.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#3b82f6] hover:underline"
              >
                {client.target_url}
              </a>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/tracker/report/${clientId}/pdf`}
            className="text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#3b82f6] px-3 py-1.5 rounded-lg transition-colors"
          >
            Download PDF
          </a>
          <TrackerClientActions clientId={clientId} />
        </div>
      </div>

      {/* AEO Score + PDF Download */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">AEO Score</p>
          <p className={`text-3xl font-bold ${
            aeoScore === null ? "text-gray-400" :
            aeoScore >= 50 ? "text-green-400" : aeoScore >= 20 ? "text-yellow-400" : "text-red-400"
          }`}>
            {aeoScore !== null ? aeoScore : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">out of 100</p>
        </div>
        {[
          { label: "Tracked Prompts", value: prompts?.length || 0 },
          { label: "Total AI Checks", value: totalChecks },
          {
            label: "Mention Rate",
            value: totalChecks === 0 ? "No data" : `${mentionRate}%`,
            sub: totalChecks > 0 ? `CI: ${ciLower}%-${ciUpper}%` : null,
            color: mentionRate >= 50 ? "text-green-400" : mentionRate >= 20 ? "text-yellow-400" : totalChecks > 0 ? "text-red-400" : "text-gray-400",
          },
          { label: "Last Checked", value: formatDate(lastChecked) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color || "text-white"}`}>
              {stat.value}
            </p>
            {stat.sub && <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Extended stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Position Quality</p>
          <p className={`text-2xl font-bold ${
            pqs >= 50 ? "text-green-400" : pqs >= 25 ? "text-yellow-400" : pqs > 0 ? "text-red-400" : "text-gray-400"
          }`}>
            {pqs > 0 ? pqs : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Weighted rank score</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Share of Voice</p>
          <p className="text-2xl font-bold text-[#3b82f6]">
            {sovData ? `${sovData.sov}%` : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">vs. competitors</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Sentiment</p>
          <div className="flex items-center gap-2 mt-1">
            {sentimentResults.length > 0 ? (
              <>
                <span className="text-sm font-bold text-green-400">+{sentimentPositive}</span>
                <span className="text-sm text-gray-600">/</span>
                <span className="text-sm font-bold text-gray-400">{sentimentNeutral}</span>
                <span className="text-sm text-gray-600">/</span>
                <span className="text-sm font-bold text-red-400">-{sentimentNegative}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-400">—</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">pos / neutral / neg</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Citations</p>
          <p className="text-2xl font-bold text-white">
            {citationData ? citationData.total : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {citationData?.clientCitations ? `${citationData.clientCitations} to your site` : "URL references found"}
          </p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Confidence</p>
          <p className={`text-2xl font-bold ${
            confidenceLabel === "High" ? "text-green-400" :
            confidenceLabel === "Moderate" ? "text-yellow-400" :
            confidenceLabel === "Low" ? "text-red-400" : "text-gray-400"
          }`}>
            {confidenceLabel}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Multi-shot consistency</p>
        </div>
      </div>

      {/* Top Competitors Section */}
      {sovData?.topCompetitors?.length > 0 && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Top Competitors (by AI mentions)</h3>
          <div className="space-y-2">
            {sovData.topCompetitors.map((comp, i) => (
              <div key={comp.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  <span className="text-gray-600 mr-2">{i + 1}.</span>
                  {comp.name}
                </span>
                <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded">
                  {comp.count} mentions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation Sources Section */}
      {citationData?.topDomains?.length > 0 && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Top Cited Sources</h3>
          <div className="space-y-2">
            {citationData.topDomains.map((d, i) => (
              <div key={d.domain} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  <span className="text-gray-600 mr-2">{i + 1}.</span>
                  {d.domain}
                </span>
                <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded">
                  {d.count} citations
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <TrendChart results={results || []} />

      {/* Service Delivery Tasks */}
      <ServiceTasksList clientId={clientId} plan={client.plan} />

      {/* Prompts being tracked (editable) */}
      <EditablePromptsList prompts={prompts || []} clientId={clientId} />

      {/* Results table */}
      <TrackerResultsTable results={results || []} clientName={client.business_name} />
    </div>
  );
}
