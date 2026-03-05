// lib/tracker/metrics.js
// Statistical metrics engine — Wilson CI, Position Quality, SOV, Composite AEO Score

/**
 * Mention rate with Wilson score confidence interval.
 * More accurate than naive p +/- z*sqrt(p(1-p)/n) for small samples.
 * @param {number} mentions - Number of mentions
 * @param {number} total - Total checks
 * @param {number} z - Z-score (1.96 = 95% CI)
 */
export function mentionRateWithCI(mentions, total, z = 1.96) {
  if (total === 0) return { rate: 0, lower: 0, upper: 0 };
  const p = mentions / total;
  const denom = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denom;
  const spread = (z / denom) * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total));
  return {
    rate: Math.round(p * 100),
    lower: Math.max(0, Math.round((center - spread) * 100)),
    upper: Math.min(100, Math.round((center + spread) * 100)),
  };
}

/**
 * Position Quality Score — weighted by mention rank.
 * Rank 1 = 1.0, Rank 2 = 0.75, Rank 3 = 0.5, 4+ = 0.25
 * Returns 0-100 score.
 */
export function positionQualityScore(mentionedResults) {
  if (!mentionedResults?.length) return 0;
  const weights = mentionedResults.map((r) => {
    const rank = r.mention_rank || 999;
    if (rank === 1) return 1.0;
    if (rank === 2) return 0.75;
    if (rank === 3) return 0.5;
    return 0.25;
  });
  return Math.round((weights.reduce((a, b) => a + b, 0) / mentionedResults.length) * 100);
}

/**
 * Share of Voice — client mentions as % of all business mentions.
 */
export function shareOfVoice(clientMentions, totalMentions) {
  if (totalMentions === 0) return 0;
  return Math.round((clientMentions / totalMentions) * 100);
}

/**
 * Composite AEO Score — single number summarizing AI visibility.
 * Weights: Mention Rate 40%, Position Quality 25%, SOV 20%, Sentiment 15%
 */
export function aeoCompositeScore({ mentionRate, pqs, sov, sentimentPositivePct, sentimentNegativePct }) {
  const sentimentScore = (sentimentPositivePct - sentimentNegativePct + 100) / 2;
  return Math.round(
    mentionRate * 0.40 + pqs * 0.25 + sov * 0.20 + sentimentScore * 0.15
  );
}
