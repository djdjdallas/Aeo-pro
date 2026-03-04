"use client";

import { useState, useMemo } from "react";

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function escapeCsv(value) {
  if (value == null) return "";
  const str = String(value).replace(/\n/g, " ").replace(/\r/g, "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const config = {
    positive: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", label: "Positive" },
    neutral: { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400", label: "Neutral" },
    negative: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Negative" },
  };
  const c = config[sentiment] || config.neutral;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${c.bg} border ${c.border} ${c.text} px-2 py-0.5 rounded-full ml-1.5`}>
      {c.label}
    </span>
  );
}

/**
 * Compute multi-shot confidence for a group of results sharing the same prompt+model+batch.
 */
function computeBatchConfidence(results) {
  if (!results?.[0]?.run_batch_id) return null;
  const grouped = {};
  for (const r of results) {
    const key = `${r.prompt_id || r.tracked_prompts?.prompt}_${r.ai_model}_${r.run_batch_id}`;
    if (!grouped[key]) grouped[key] = { mentioned: 0, total: 0 };
    grouped[key].total++;
    if (r.was_mentioned) grouped[key].mentioned++;
  }
  return grouped;
}

export default function TrackerResultsTable({ results, clientName }) {
  const [expandedId, setExpandedId] = useState(null);

  // Group results by prompt+model+batch for multi-shot display
  const batchGroups = useMemo(() => computeBatchConfidence(results), [results]);

  function getBatchLabel(result) {
    if (!result.run_batch_id || !batchGroups) return null;
    const key = `${result.prompt_id || result.tracked_prompts?.prompt}_${result.ai_model}_${result.run_batch_id}`;
    const group = batchGroups[key];
    if (!group || group.total <= 1) return null;
    return `${group.mentioned}/${group.total}`;
  }

  function handleExportCSV() {
    const headers = ["Prompt", "AI Model", "Mentioned", "Mention Rank", "Sentiment", "Run #", "Checked At", "Response Snippet", "Full Response"];
    const rows = results.map((r) => [
      escapeCsv(r.tracked_prompts?.prompt),
      escapeCsv(r.ai_model),
      r.was_mentioned ? "Yes" : "No",
      escapeCsv(r.mention_rank || ""),
      escapeCsv(r.sentiment || ""),
      escapeCsv(r.run_number || 1),
      escapeCsv(r.checked_at),
      escapeCsv(r.response_snippet),
      escapeCsv(r.full_response),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const slug = (clientName || "tracker-results").toLowerCase().replace(/\s+/g, "-");
    const date = new Date().toISOString().split("T")[0];

    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-ai-results-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!results.length) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center text-gray-500 text-sm">
        No results yet. Click &quot;Run Now&quot; to check AI visibility for the first time.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          Check History ({results.length} results)
        </p>
        <button
          onClick={handleExportCSV}
          className="text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-[#2a2a2a]"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-2">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
          <span>Prompt</span>
          <span>Model</span>
          <span>Mentioned</span>
          <span>Checked At</span>
          <span></span>
        </div>

        {results.map((result) => {
          const batchLabel = getBatchLabel(result);
          return (
            <div key={result.id}>
              <button
                onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                className="w-full grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 lg:gap-4 bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30 rounded-xl px-4 py-3 text-left transition-colors items-center"
              >
                <span className="text-sm text-gray-300 truncate">
                  {result.tracked_prompts?.prompt}
                  {result.run_number > 1 && (
                    <span className="ml-1.5 text-xs text-gray-600">#{result.run_number}</span>
                  )}
                </span>
                <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded-md w-fit">
                  {result.ai_model}
                </span>
                <span className="flex items-center flex-wrap gap-1">
                  {result.was_mentioned ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      {batchLabel ? `Mentioned ${batchLabel}` : "Mentioned"}
                      {result.mention_rank && (
                        <span className="text-green-600">#{result.mention_rank}</span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {batchLabel ? `Not mentioned ${batchLabel}` : "Not mentioned"}
                    </span>
                  )}
                  <SentimentBadge sentiment={result.sentiment} />
                </span>
                <span className="text-xs text-gray-500 hidden lg:block">
                  {formatDateTime(result.checked_at)}
                </span>
                <span className="text-xs text-gray-600">
                  {expandedId === result.id ? "hide" : "view"}
                </span>
              </button>

              {/* Expanded: show the AI response snippet + sentiment + mentions */}
              {expandedId === result.id && (
                <div className="bg-[#0d0d0d] border border-[#1f1f1f] border-t-0 rounded-b-xl px-4 py-4">
                  {result.sentiment_reason && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sentiment</p>
                      <p className="text-sm text-gray-400">{result.sentiment_reason}</p>
                    </div>
                  )}

                  {result.response_snippet ? (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Response Snippet</p>
                      <p className="text-sm text-gray-300 leading-relaxed italic">
                        {result.response_snippet}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No snippet available — business was not mentioned.</p>
                  )}

                  {result.full_response && (
                    <details className="mt-4">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
                        View full AI response
                      </summary>
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed whitespace-pre-wrap border-l-2 border-[#1f1f1f] pl-3">
                        {result.full_response}
                      </p>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
