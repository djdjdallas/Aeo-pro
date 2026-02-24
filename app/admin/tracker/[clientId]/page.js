import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import TrackerClientActions from "@/components/tracker/TrackerClientActions";
import TrackerResultsTable from "@/components/tracker/TrackerResultsTable";

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

export default async function TrackerClientPage({ params, searchParams }) {
  const { clientId } = await params;
  const { key } = await searchParams;

  if (!key || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  const supabase = createServerClient();

  const { data: client } = await supabase
    .from("tracker_clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) redirect(`/admin/tracker?key=${key}`);

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

  // Compute stats
  const totalChecks = results?.length || 0;
  const totalMentions = results?.filter((r) => r.was_mentioned).length || 0;
  const mentionRate = totalChecks > 0 ? Math.round((totalMentions / totalChecks) * 100) : 0;
  const lastChecked = results?.[0]?.checked_at || null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href={`/admin/tracker?key=${key}`}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                &larr; Tracker
              </Link>
            </div>
            <h1 className="text-2xl font-bold">{client.business_name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {client.business_type} &middot; {client.location}
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

          {/* Run now button — client component handles the API call */}
          <TrackerClientActions clientId={clientId} adminKey={key} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tracked Prompts", value: prompts?.length || 0 },
            { label: "Total AI Checks", value: totalChecks },
            {
              label: "Mention Rate",
              value: totalChecks === 0 ? "No data" : `${mentionRate}%`,
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
            </div>
          ))}
        </div>

        {/* Prompts being tracked */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Tracking These Prompts ({prompts?.length || 0})
          </p>
          <ol className="space-y-2">
            {prompts?.map((p, i) => (
              <li key={p.id} className="flex gap-3 text-sm text-gray-300">
                <span className="text-gray-600 shrink-0">{i + 1}.</span>
                <span>{p.prompt}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Results table */}
        <TrackerResultsTable results={results || []} />

      </div>
    </div>
  );
}
