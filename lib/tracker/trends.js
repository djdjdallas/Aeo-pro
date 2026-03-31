// lib/tracker/trends.js
// Compute rolling averages and trend data for tracker dashboards

/**
 * Compute a rolling average over a sorted array of data points.
 * @param {Array<{date: string, rate: number}>} dataPoints - Sorted by date
 * @param {number} windowDays - Rolling window size in days
 * @returns {Array<{date: string, avg: number}>}
 */
export function computeRollingAverage(dataPoints, windowDays) {
  if (!dataPoints?.length) return [];

  return dataPoints.map((point, idx) => {
    const pointDate = new Date(point.date);
    const windowStart = new Date(pointDate);
    windowStart.setDate(windowStart.getDate() - windowDays);

    const windowPoints = dataPoints.filter((p) => {
      const d = new Date(p.date);
      return d >= windowStart && d <= pointDate;
    });

    const avg = windowPoints.length > 0
      ? Math.round(windowPoints.reduce((sum, p) => sum + p.rate, 0) / windowPoints.length)
      : point.rate;

    return { date: point.date, avg };
  });
}

/**
 * Build complete trend data for a client from raw results.
 * @param {Array} results - Raw prompt_results from Supabase
 * @returns {{ daily: Array, rolling7: Array, rolling30: Array, byModel: Object }}
 */
export function buildTrendData(results) {
  if (!results?.length) return { daily: [], rolling7: [], rolling30: [], byModel: {} };

  // Group by date — exclude invalid responses from trend calculations
  const byDate = {};
  const byModelDate = {};

  for (const r of results) {
    if (r.response_status && r.response_status !== "valid") continue;
    const date = r.checked_at?.split("T")[0];
    if (!date) continue;

    if (!byDate[date]) byDate[date] = { total: 0, mentioned: 0 };
    byDate[date].total++;
    if (r.was_mentioned) byDate[date].mentioned++;

    const model = r.ai_model;
    if (!byModelDate[model]) byModelDate[model] = {};
    if (!byModelDate[model][date]) byModelDate[model][date] = { total: 0, mentioned: 0 };
    byModelDate[model][date].total++;
    if (r.was_mentioned) byModelDate[model][date].mentioned++;
  }

  // Convert to sorted arrays
  const daily = Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, stats]) => ({
      date,
      rate: Math.round((stats.mentioned / stats.total) * 100),
      total: stats.total,
      mentioned: stats.mentioned,
    }));

  const rolling7 = computeRollingAverage(daily, 7);
  const rolling30 = computeRollingAverage(daily, 30);

  // Per-model daily rates
  const byModel = {};
  for (const [model, dates] of Object.entries(byModelDate)) {
    byModel[model] = Object.entries(dates)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stats]) => ({
        date,
        rate: Math.round((stats.mentioned / stats.total) * 100),
      }));
  }

  return { daily, rolling7, rolling30, byModel };
}
