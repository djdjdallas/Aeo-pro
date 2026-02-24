// Content registry — all blog posts and local pages
// Posts are imported and registered here for central access

const posts = [];

export const categories = [
  { slug: "all", label: "All Posts" },
  { slug: "foundation", label: "AEO Fundamentals" },
  { slug: "faq", label: "FAQ" },
  { slug: "industry", label: "Industry Guides" },
  { slug: "local", label: "Local SEO" },
];

export function registerPost(postModule) {
  posts.push(postModule);
}

export function getAllPosts() {
  return posts.map((p) => p.metadata).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getAllSlugs() {
  return posts.map((p) => p.metadata.slug);
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.metadata.slug === slug) || null;
}

export function getPostsByCategory(category) {
  if (category === "all") return getAllPosts();
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(slug, limit = 3) {
  const post = getPostBySlug(slug);
  if (!post) return [];
  const related = post.metadata.relatedSlugs || [];
  return related
    .map((s) => getPostBySlug(s))
    .filter(Boolean)
    .map((p) => p.metadata)
    .slice(0, limit);
}

// Import and register all posts
import * as post1 from "./posts/what-is-answer-engine-optimization.js";
import * as post2 from "./posts/aeo-vs-seo-local-businesses.js";
import * as post3 from "./posts/how-chatgpt-recommends-local-businesses.js";
import * as post4 from "./posts/how-to-check-if-chatgpt-recommends-your-business.js";
import * as post5 from "./posts/how-long-does-aeo-take.js";
import * as post6 from "./posts/how-much-does-aeo-cost-small-business.js";
import * as post7 from "./posts/can-i-do-aeo-myself.js";
import * as post8 from "./posts/why-isnt-my-business-showing-up-in-ai-search.js";
import * as post9 from "./posts/what-is-schema-markup-local-business.js";
import * as post10 from "./posts/faq-schema-guide-with-examples.js";
import * as post11 from "./posts/aeo-for-hvac-companies.js";
import * as post12 from "./posts/aeo-for-personal-injury-lawyers.js";
import * as post13 from "./posts/aeo-for-med-spas.js";
import * as post14 from "./posts/aeo-for-roofers.js";
import * as post15 from "./posts/aeo-for-plumbers.js";
import * as post16 from "./posts/why-your-hvac-business-isnt-on-chatgpt.js";
import * as post17 from "./posts/hvac-schema-markup-guide.js";
import * as post18 from "./posts/why-your-law-firm-missing-ai-overviews.js";
import * as post19 from "./posts/legal-schema-markup-for-lawyers.js";
import * as post20 from "./posts/med-spa-yelp-perplexity-connection.js";
import * as post21 from "./posts/medical-credentials-ai-search.js";
import * as post22 from "./posts/roofing-leads-from-ai-search.js";
import * as post23 from "./posts/emergency-plumber-chatgpt-visibility.js";

[post1, post2, post3, post4, post5, post6, post7, post8, post9, post10,
 post11, post12, post13, post14, post15, post16, post17, post18, post19,
 post20, post21, post22, post23].forEach(registerPost);
