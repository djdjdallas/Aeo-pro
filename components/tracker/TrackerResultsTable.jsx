"use client";

import { useState } from "react";

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function TrackerResultsTable({ results }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!results.length) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center text-gray-500 text-sm">
        No results yet. Click &quot;Run Now&quot; to check AI visibility for the first time.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        Check History ({results.length} results)
      </p>

      <div className="space-y-2">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
          <span>Prompt</span>
          <span>Model</span>
          <span>Mentioned</span>
          <span>Checked At</span>
          <span></span>
        </div>

        {results.map((result) => (
          <div key={result.id}>
            <button
              onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
              className="w-full grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 lg:gap-4 bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30 rounded-xl px-4 py-3 text-left transition-colors items-center"
            >
              <span className="text-sm text-gray-300 truncate">
                {result.tracked_prompts?.prompt}
              </span>
              <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded-md w-fit">
                {result.ai_model}
              </span>
              <span>
                {result.was_mentioned ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Mentioned
                    {result.mention_rank && (
                      <span className="text-green-600">#{result.mention_rank}</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Not mentioned
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500 hidden lg:block">
                {formatDateTime(result.checked_at)}
              </span>
              <span className="text-xs text-gray-600">
                {expandedId === result.id ? "hide" : "view"}
              </span>
            </button>

            {/* Expanded: show the AI response snippet */}
            {expandedId === result.id && (
              <div className="bg-[#0d0d0d] border border-[#1f1f1f] border-t-0 rounded-b-xl px-4 py-4">
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
        ))}
      </div>
    </div>
  );
}
