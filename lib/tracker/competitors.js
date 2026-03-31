// lib/tracker/competitors.js
// Extract business names from AI responses and compute share of voice

import { createServerClient } from "@/lib/supabase";

// Generic/structural words that AI responses use as section headings, not brand names
const GENERIC_WORDS = new Set([
  "summary", "recommendation", "recommendations", "note", "notes", "option",
  "options", "overview", "introduction", "conclusion", "conclusions", "result",
  "results", "alternative", "alternatives", "consideration", "considerations",
  "warning", "warnings", "tip", "tips", "example", "examples", "step", "steps",
  "method", "methods", "approach", "features", "benefits", "pricing", "comparison",
  "pros", "cons", "advantages", "disadvantages", "description", "details",
  "section", "update", "review", "analysis", "report", "guide", "answer",
  "question", "solution", "problem", "important", "disclaimer", "additional",
  "final", "thoughts", "verdict", "bottom", "line", "key", "takeaway",
  "takeaways", "highlights", "limitations", "drawbacks", "caveat", "caveats",
  "context", "background", "factors", "criteria", "process", "workflow",
]);

// Words that commonly start sentences/headings but aren't brand names
const SKIP_LEADING_WORDS = new Set([
  "the", "this", "that", "here", "there", "when", "where", "what", "which",
  "some", "many", "most", "best", "top", "key", "note", "overall", "however",
  "additionally", "furthermore", "also", "these", "those", "another", "please",
  "remember", "consider", "while", "although", "since", "because", "for",
  "with", "from", "about", "into", "after", "before", "how", "why", "each",
]);

/**
 * Check if a candidate name is a generic/structural word rather than a brand.
 */
function isGenericName(name) {
  const lower = name.toLowerCase().trim();
  if (GENERIC_WORDS.has(lower)) return true;
  const words = lower.split(/\s+/);
  if (words.length === 1 && SKIP_LEADING_WORDS.has(lower)) return true;
  if (words.every((w) => GENERIC_WORDS.has(w) || SKIP_LEADING_WORDS.has(w))) return true;
  if (SKIP_LEADING_WORDS.has(words[0]) && words.length <= 2) return true;
  return false;
}

/**
 * Extract potential business names from AI response text.
 * Uses multiple heuristics: capitalized multi-word sequences, quoted names,
 * corporate suffixes, and common recommendation patterns.
 */
export function extractBusinessNames(text) {
  if (!text) return [];

  const names = new Set();

  // Pattern 1: Names with corporate suffixes
  const corpPattern = /(?:[A-Z][a-zA-Z']+\s+){0,3}(?:LLC|Inc\.?|Corp\.?|Co\.?|Ltd\.?|Group|Services|Solutions|Agency|Company)/g;
  const corpMatches = text.match(corpPattern) || [];
  for (const m of corpMatches) {
    const trimmed = m.trim();
    if (trimmed.length > 3 && !isGenericName(trimmed)) names.add(trimmed);
  }

  // Pattern 2: Quoted business names
  const quotedPattern = /[""\u201c]([A-Z][^""\u201d]{2,40})[""\u201d]|"([A-Z][^"]{2,40})"/g;
  let match;
  while ((match = quotedPattern.exec(text)) !== null) {
    const name = (match[1] || match[2] || "").trim();
    if (name && name.length > 2 && !isGenericName(name)) names.add(name);
  }

  // Pattern 3: Bold/numbered list items that look like business names (e.g. "1. Business Name -")
  const listPattern = /(?:^|\n)\s*(?:\d+[\.\)]\s*|\*\*|-)?\s*([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+){0,3})\s*(?:[-\u2013\u2014:]|\*\*)/gm;
  while ((match = listPattern.exec(text)) !== null) {
    const name = match[1].trim();
    if (name.length > 2 && !isGenericName(name)) {
      names.add(name);
    }
  }

  // Pattern 4: Capitalized multi-word sequences (2-4 words, all starting with caps)
  const capPattern = /(?<![.!?]\s)(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?=\s|[,.\-;:!?)])/gm;
  while ((match = capPattern.exec(text)) !== null) {
    const name = match[1].trim();
    const skipPhrases = new Set(["United States", "New York", "Los Angeles", "San Francisco", "San Diego", "San Antonio", "Las Vegas", "North America", "South America", "Better Business Bureau"]);
    if (name.length > 4 && !skipPhrases.has(name) && !isGenericName(name)) {
      names.add(name);
    }
  }

  return Array.from(names).slice(0, 20);
}

/**
 * Calculate share of voice for a client over a date range.
 */
export async function calculateShareOfVoice(clientId, startDate, endDate) {
  const supabase = createServerClient();

  let query = supabase
    .from("response_mentions")
    .select("business_name, is_client")
    .eq("client_id", clientId);

  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data: mentions } = await query;
  if (!mentions?.length) return { sov: 0, total: 0, clientMentions: 0 };

  const clientMentions = mentions.filter((m) => m.is_client).length;
  return {
    sov: Math.round((clientMentions / mentions.length) * 100),
    total: mentions.length,
    clientMentions,
  };
}

/**
 * Get top competitor businesses mentioned alongside a client.
 */
export async function getTopCompetitors(clientId, limit = 5) {
  const supabase = createServerClient();

  const { data: mentions } = await supabase
    .from("response_mentions")
    .select("business_name")
    .eq("client_id", clientId)
    .eq("is_client", false);

  if (!mentions?.length) return [];

  const counts = {};
  for (const m of mentions) {
    counts[m.business_name] = (counts[m.business_name] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
