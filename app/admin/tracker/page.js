import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";

export const metadata = {
  title: "AI Mention Tracker — Admin",
  robots: "noindex, nofollow",
};

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TrackerAdminPage({ searchParams }) {
  const { key } = await searchParams;

  if (!key || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  const supabase = createServerClient();

  // Fetch all tracker clients with their stats
  const { data: clients } = await supabase
    .from("tracker_clients")
    .select(`
      id, business_name, business_type, location, target_url, created_at,
      tracked_prompts(count),
      prompt_results(was_mentioned, checked_at)
    `)
    .order("created_at", { ascending: false });

  // Compute stats per client
  const enrichedClients = (clients || []).map((c) => {
    const results = c.prompt_results || [];
    const total = results.length;
    const mentioned = results.filter((r) => r.was_mentioned).length;
    const rate = total > 0 ? Math.round((mentioned / total) * 100) : null;
    const lastChecked = results.sort(
      (a, b) => new Date(b.checked_at) - new Date(a.checked_at)
    )[0]?.checked_at || null;

    return {
      ...c,
      total_checks: total,
      mention_rate: rate,
      last_checked: lastChecked,
      prompt_count: c.tracked_prompts?.[0]?.count || 0,
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              AI <span className="text-[#3b82f6]">Mention Tracker</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {enrichedClients.length} clients being monitored
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin?key=${key}`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              &larr; Back to leads
            </Link>
            <Link
              href={`/admin/tracker/new?key=${key}`}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add Client
            </Link>
          </div>
        </div>

        {/* Client grid */}
        {enrichedClients.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg mb-2">No clients being tracked yet.</p>
            <p className="text-sm mb-6">Add your first client to start monitoring AI mentions.</p>
            <Link
              href={`/admin/tracker/new?key=${key}`}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add First Client
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_120px] gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
              <span>Business</span>
              <span>Location</span>
              <span>Prompts</span>
              <span>Checks</span>
              <span>Mention Rate</span>
              <span>Last Run</span>
              <span></span>
            </div>

            {enrichedClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_120px] gap-2 lg:gap-4 bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30 rounded-xl px-4 py-3 transition-colors items-center"
              >
                <div>
                  <p className="text-sm text-white font-medium">{client.business_name}</p>
                  <p className="text-xs text-gray-500">{client.business_type}</p>
                </div>

                <span className="text-sm text-gray-300">{client.location}</span>

                <span className="text-sm text-gray-400">{client.prompt_count} prompts</span>

                <span className="text-sm text-gray-400">{client.total_checks} runs</span>

                {/* Mention rate badge */}
                <span>
                  {client.mention_rate === null ? (
                    <span className="text-xs text-gray-500">No data</span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                        client.mention_rate >= 50
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : client.mention_rate >= 20
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {client.mention_rate}%
                    </span>
                  )}
                </span>

                <span className="text-xs text-gray-500">{formatDate(client.last_checked)}</span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/tracker/${client.id}?key=${key}`}
                    className="text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
