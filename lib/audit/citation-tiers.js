// lib/audit/citation-tiers.js
// Checks 6-tier citation hierarchy from site data and tech check results

/**
 * Builds citation tier analysis from pre-fetched site data and tech check results.
 * No additional HTTP calls — uses Cheerio $ scan results and Wikipedia check from tech phase.
 *
 * @param {object} params
 * @param {string} params.businessName - Business name for Wikipedia lookup
 * @param {object} params.$ - Cheerio instance of the page HTML
 * @param {string[]} params.directoryLinks - Already-extracted directory link names
 * @param {boolean} params.wikipediaExists - Result from Wikipedia existence check
 * @param {string} params.bodyText - Page body text
 * @returns {{ tiers: Array, score: number, summary: string }}
 */
export function buildCitationTiers({ businessName, $, directoryLinks, wikipediaExists, bodyText }) {
  const tiers = [];

  // Tier 1: Wikipedia
  tiers.push({
    tier: 1,
    name: "Wikipedia",
    status: wikipediaExists ? "found" : "not_found",
    detail: wikipediaExists
      ? `Wikipedia page exists for ${businessName}`
      : "No Wikipedia page found",
  });

  // Tier 2: Reddit — scan for reddit.com links
  let redditFound = false;
  let redditDetail = "No Reddit links found on site";
  if ($) {
    const redditLinks = [];
    $('a[href*="reddit.com"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href && !redditLinks.includes(href)) redditLinks.push(href);
    });
    if (redditLinks.length > 0) {
      redditFound = true;
      redditDetail = `${redditLinks.length} Reddit link${redditLinks.length > 1 ? "s" : ""} found on site`;
    }
  }
  tiers.push({
    tier: 2,
    name: "Reddit",
    status: redditFound ? "found" : "not_found",
    detail: redditDetail,
  });

  // Tier 3: YouTube — scan for youtube.com links or YouTube iframe embeds
  let youtubeFound = false;
  let youtubeDetail = "No YouTube presence detected";
  if ($) {
    const ytLinks = $('a[href*="youtube.com"], a[href*="youtu.be"]').length;
    const ytIframes = $('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').length;
    const total = ytLinks + ytIframes;
    if (total > 0) {
      youtubeFound = true;
      youtubeDetail = `${total} YouTube reference${total > 1 ? "s" : ""} found (${ytLinks} link${ytLinks !== 1 ? "s" : ""}, ${ytIframes} embed${ytIframes !== 1 ? "s" : ""})`;
    }
  }
  tiers.push({
    tier: 3,
    name: "YouTube",
    status: youtubeFound ? "found" : "not_found",
    detail: youtubeDetail,
  });

  // Tier 4: Best-of Articles — check for "as seen in" / "featured in" sections
  let bestOfFound = false;
  let bestOfDetail = "No 'featured in' or 'as seen in' mentions found";
  if (bodyText) {
    const patterns = [
      /as seen in/i,
      /featured in/i,
      /as featured on/i,
      /recognized by/i,
      /awarded by/i,
      /featured on/i,
      /best of \d{4}/i,
      /top \d+ /i,
    ];
    const matched = patterns.filter((p) => p.test(bodyText));
    if (matched.length > 0) {
      bestOfFound = true;
      bestOfDetail = "Site mentions being featured in best-of or award lists";
    }
  }
  tiers.push({
    tier: 4,
    name: "Best-of Articles",
    status: bestOfFound ? "found" : "not_found",
    detail: bestOfDetail,
  });

  // Tier 5: Review Platforms — use directoryLinks + check for ProductHunt
  const reviewPlatforms = [
    "G2", "Capterra", "Trustpilot", "Yelp", "BBB",
    "HomeAdvisor", "Angi", "ProductHunt",
  ];
  const foundPlatforms = directoryLinks.filter((d) =>
    reviewPlatforms.some((p) => p.toLowerCase() === d.toLowerCase())
  );
  tiers.push({
    tier: 5,
    name: "Review Platforms",
    status: foundPlatforms.length > 0 ? "found" : "not_found",
    detail: foundPlatforms.length > 0
      ? `Found on: ${foundPlatforms.join(", ")}`
      : "No review platform links detected",
  });

  // Tier 6: Press Coverage — check for press/media/news page links, NewsArticle schemas
  let pressFound = false;
  let pressDetail = "No press or media coverage signals detected";
  if ($) {
    const pressLinks = $('a[href*="/press"], a[href*="/media"], a[href*="/news"], a[href*="/in-the-news"]').length;
    if (pressLinks > 0) {
      pressFound = true;
      pressDetail = `Found ${pressLinks} press/media page link${pressLinks > 1 ? "s" : ""}`;
    }
  }
  // Also check for NewsArticle schema
  if (!pressFound && bodyText) {
    if (/NewsArticle/i.test(bodyText) || /press release/i.test(bodyText)) {
      pressFound = true;
      pressDetail = "NewsArticle schema or press release content detected";
    }
  }
  tiers.push({
    tier: 6,
    name: "Press Coverage",
    status: pressFound ? "found" : "not_found",
    detail: pressDetail,
  });

  // Calculate score
  const foundCount = tiers.filter((t) => t.status === "found").length;
  const score = Math.round((foundCount / 6) * 100);

  return {
    tiers,
    score,
    summary: `Present on ${foundCount}/6 citation tiers`,
  };
}
