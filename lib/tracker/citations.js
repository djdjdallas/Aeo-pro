// lib/tracker/citations.js
// Extract URLs/citations from AI responses and compute citation stats

import { createServerClient } from "@/lib/supabase";

/**
 * Extract URLs from text using regex.
 * Returns deduplicated array of URL strings.
 */
export function extractUrlsFromText(text) {
  if (!text) return [];

  const urlPattern = /https?:\/\/[^\s<>"')\]]+/gi;
  const matches = text.match(urlPattern) || [];

  // Clean trailing punctuation
  const cleaned = matches.map((url) =>
    url.replace(/[.,;:!?)}\]]+$/, "")
  );

  return [...new Set(cleaned)];
}

/**
 * Get aggregated citation stats for a client.
 */
export async function getCitationStats(clientId, startDate, endDate) {
  const supabase = createServerClient();

  let query = supabase
    .from("response_citations")
    .select("cited_domain, is_client_url")
    .eq("client_id", clientId);

  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data: citations } = await query;
  if (!citations?.length) return { total: 0, clientCitations: 0, topDomains: [] };

  const domainCounts = {};
  let clientCitations = 0;

  for (const c of citations) {
    domainCounts[c.cited_domain] = (domainCounts[c.cited_domain] || 0) + 1;
    if (c.is_client_url) clientCitations++;
  }

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  return {
    total: citations.length,
    clientCitations,
    topDomains,
  };
}
