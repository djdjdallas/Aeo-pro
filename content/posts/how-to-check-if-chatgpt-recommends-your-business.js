// how-to-check-if-chatgpt-recommends-your-business.js
// FAQ category — First Answer AEO Blog

export const metadata = {
  slug: "how-to-check-if-chatgpt-recommends-your-business",
  title: "How to Check If ChatGPT Recommends Your Business (Step-by-Step)",
  description:
    "Learn exactly how to test whether ChatGPT, Perplexity, and other AI engines recommend your business. Step-by-step prompts, interpretation guide, and action plan.",
  keywords: [
    "chatgpt business recommendations",
    "AI search visibility",
    "check chatgpt results",
    "AI engine optimization testing",
    "does chatgpt recommend my business",
    "AI search audit",
  ],
  author: {
    name: "The First Answer Team",
    role: "AEO Specialists at First Answer",
  },
  date: "2025-02-23",
  lastModified: "2025-02-23",
  category: "faq",
  industry: null,
  readingTime: "7 min",
  wordCount: 1500,
  pillarSlug: "what-is-answer-engine-optimization",
  supportingSlugs: [],
  relatedSlugs: [
    "how-chatgpt-recommends-local-businesses",
    "why-isnt-my-business-showing-up-in-ai-search",
    "what-is-answer-engine-optimization",
  ],
  schema: { type: "Article", hasFAQ: true },
};

export const tableOfContents = [
  { id: "quick-test", label: "The 60-Second Quick Test" },
  { id: "testing-prompts", label: "Testing Prompts That Actually Work" },
  { id: "interpreting-results", label: "Interpreting Your Results" },
  { id: "not-showing-up", label: "What to Do If You're Not Showing Up" },
  { id: "next-steps", label: "Your Next Steps" },
];

export const faqs = [
  {
    question: "How do I check if ChatGPT recommends my business?",
    answer:
      "Open ChatGPT and type prompts like 'What's the best [your service] in [your city]?' or 'Who do you recommend for [service] near [location]?' Run at least 5 variations and note whether your business name, address, or website appears in any response.",
  },
  {
    question: "Why does ChatGPT recommend different businesses each time I ask?",
    answer:
      "ChatGPT uses probabilistic language generation, so responses vary between sessions. A business with strong authority signals will appear more consistently. If you only show up occasionally, your AI visibility is fragile and needs strengthening.",
  },
  {
    question: "Does ChatGPT pull from Google reviews?",
    answer:
      "ChatGPT's training data includes publicly available review content, but it doesn't query Google in real time unless using browsing mode. However, Perplexity and Google AI Overviews do pull live data, making reviews critical for AI visibility across all platforms.",
  },
  {
    question: "Can I pay to get recommended by ChatGPT?",
    answer:
      "No. There is no paid placement inside ChatGPT responses. Recommendations are based on training data authority, structured data, and content relevance. This is why Answer Engine Optimization exists as a discipline — you earn visibility through signals, not spend.",
  },
  {
    question: "Should I test on other AI engines besides ChatGPT?",
    answer:
      "Absolutely. Test on Perplexity, Google Gemini, Microsoft Copilot, and Google AI Overviews. Each AI engine pulls from different data sources and weights signals differently. A business visible on one may be invisible on another.",
  },
];

export const sections = [
  {
    type: "intro",
    content:
      "Right now, potential customers are asking AI engines to recommend businesses like yours. They're not scrolling through ten blue links — they're getting a single, definitive answer. The question you need to answer today: is your business that answer? Here's how to find out in under ten minutes.",
  },

  // Section 1: Quick Test
  {
    type: "heading",
    id: "quick-test",
    content: "How Do I Quickly Test If ChatGPT Knows My Business?",
  },
  {
    type: "answer-capsule",
    content:
      "Open ChatGPT, Perplexity, or Google Gemini and ask: 'What's the best [your service] in [your city]?' If your business isn't named in the response, you're invisible to the fastest-growing discovery channel in existence. Repeat with 5 prompt variations for an accurate picture.",
  },
  {
    type: "body",
    content:
      "<p>This isn't a theoretical exercise. <strong>Over 100 million people</strong> use ChatGPT weekly, and a growing percentage use it to find local services. When someone asks 'Who's the best plumber in Austin?' and your business doesn't appear, that's a lost customer you never knew existed.</p><p>The test itself takes 60 seconds. Open ChatGPT (free version works fine) and type a natural question a customer might ask. Don't use your business name — the whole point is to see if ChatGPT independently recommends you.</p><p>But one prompt isn't enough. AI responses are probabilistic, meaning the same question can generate different answers across sessions. You need at least five different prompts to get a reliable picture of your visibility.</p>",
  },

  // Section 2: Testing Prompts
  {
    type: "heading",
    id: "testing-prompts",
    content: "What Prompts Should I Use to Test AI Visibility?",
  },
  {
    type: "answer-capsule",
    content:
      "Use category prompts ('best dentist in Dallas'), comparison prompts ('compare top HVAC companies in Phoenix'), recommendation prompts ('who do you recommend for roof repair in Denver'), and specific-need prompts ('emergency plumber open Sundays in Portland'). Test across ChatGPT, Perplexity, and Gemini.",
  },
  {
    type: "body",
    content:
      "<p>The prompts you test matter enormously. Real customers don't all ask the same way, so your testing needs to reflect the variety of natural language queries your prospects actually use.</p><p>Here are the four prompt categories you should test, with examples:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>Category prompts:</strong> 'What's the best [service] in [city]?' — This is the broadest test. Example: 'What's the best personal injury lawyer in Miami?'",
      "<strong>Comparison prompts:</strong> 'Compare the top 3 [service providers] in [city]' — This tests whether AI considers you among the leaders. Example: 'Compare the top 3 med spas in Scottsdale.'",
      "<strong>Recommendation prompts:</strong> 'Who do you recommend for [specific need] in [area]?' — This mimics how people actually ask friends for referrals. Example: 'Who do you recommend for a kitchen remodel in Charlotte?'",
      "<strong>Specific-need prompts:</strong> 'I need a [service] that [specific requirement] in [location]' — This tests niche visibility. Example: 'I need a dentist that accepts Medicaid and is open on Saturdays in Oakland.'",
      "<strong>Problem-based prompts:</strong> 'My [problem description]. Who should I call in [city]?' — This tests whether AI connects your business to specific pain points. Example: 'My AC unit is making a grinding noise. Who should I call in Tampa?'",
    ],
  },
  {
    type: "body",
    content:
      "<p><strong>Critical:</strong> Test on multiple AI platforms, not just ChatGPT. Perplexity searches the live web and often gives different results. Google Gemini has its own data sources. Microsoft Copilot integrates with Bing. Your visibility can vary dramatically between engines.</p><p>Run each prompt in a <strong>new conversation</strong> — previous context within a chat can skew results. Document every response in a spreadsheet with columns for: platform, prompt used, whether your business appeared, position in the response, and what competitors were mentioned instead.</p>",
  },

  // Section 3: Interpreting Results
  {
    type: "heading",
    id: "interpreting-results",
    content: "How Do I Interpret My AI Visibility Results?",
  },
  {
    type: "answer-capsule",
    content:
      "If your business appears in 0 out of 5 tests, you're AI-invisible — urgent action needed. Appearing in 1-2 means fragile visibility. Appearing in 3-4 means moderate presence with room to grow. Consistent appearance across platforms and prompt types means strong AI authority.",
  },
  {
    type: "body",
    content:
      "<p>Once you've run your tests, you'll fall into one of four categories:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>AI-Invisible (0 mentions):</strong> Your business has no meaningful AI presence. AI engines don't have enough structured data, authority signals, or content to reference you. This is the most common result for small businesses — and the most urgent to fix.",
      "<strong>Fragile Visibility (1-2 mentions):</strong> You appear sporadically, meaning AI has some awareness of your business but not enough confidence to recommend you consistently. You're on the edge, and competitors with stronger signals will push you out.",
      "<strong>Moderate Presence (3-4 mentions):</strong> AI engines recognize your business and consider you a viable recommendation. You're in the game, but you're not dominating. Targeted optimization can move you to first-mention status.",
      "<strong>Strong Authority (5+ consistent mentions):</strong> You're the business AI recommends by default. This is the goal. Maintain your signals and monitor competitors.",
    ],
  },
  {
    type: "body",
    content:
      "<p>Pay attention to <strong>where</strong> you appear in the response, not just whether you appear. Being mentioned first carries significantly more weight than being listed third. Also note the language AI uses about you — does it recommend you enthusiastically, or mention you as an afterthought?</p><p>If competitors appear and you don't, write down their names. Understanding who AI prefers over you reveals exactly what signals you're missing. This competitive intelligence is invaluable for your <a href='/blog/what-is-answer-engine-optimization'>AEO strategy</a>.</p>",
  },
  {
    type: "callout",
    title: "Pro Tip",
    content:
      "Screenshot every AI response during your test. AI outputs change over time, and having a baseline lets you measure improvement after optimization. Date-stamp each screenshot.",
  },

  // Section 4: Not Showing Up
  {
    type: "heading",
    id: "not-showing-up",
    content: "What If My Business Isn't Showing Up at All?",
  },
  {
    type: "answer-capsule",
    content:
      "If you're AI-invisible, the fix starts with structured data — schema markup, consistent NAP citations, authoritative content, and review velocity. AI engines need clear, machine-readable signals to recommend you. Without them, you simply don't exist in the AI layer.",
  },
  {
    type: "body",
    content:
      "<p>Don't panic, but do act quickly. Every day you're invisible to AI search is a day your competitors are capturing customers who would have chosen you. Here's why you're not showing up and what to prioritize:</p>",
  },
  {
    type: "list",
    items: [
      "<strong>Missing schema markup:</strong> Without structured data on your website, AI engines can't reliably extract your business name, services, location, hours, or credentials. This is the single most impactful fix. Learn more in our <a href='/blog/what-is-schema-markup-local-business'>schema markup guide</a>.",
      "<strong>Weak or inconsistent citations:</strong> If your business name, address, and phone number differ across directories, AI engines lose confidence in your data. Audit your listings on Google Business Profile, Yelp, BBB, and industry directories.",
      "<strong>No authoritative content:</strong> AI needs content that demonstrates your expertise. If your website is a brochure with five pages, you're not giving AI engines enough material to understand what you do and why you're the best at it.",
      "<strong>Low review volume or recency:</strong> Reviews are authority signals. If your last Google review is from 2022, AI interprets that as a business that may no longer be active or relevant.",
      "<strong>No topical authority:</strong> AI engines favor businesses that demonstrate deep expertise in their field. A roofing company with 30 pages of detailed roofing content outranks one with a generic services page.",
    ],
  },
  {
    type: "body",
    content:
      "<p>The good news: these are all fixable. The deeper explanation of <a href='/blog/why-isnt-my-business-showing-up-in-ai-search'>why businesses go invisible in AI search</a> covers each issue in detail with action steps. And understanding <a href='/blog/how-chatgpt-recommends-local-businesses'>how ChatGPT's recommendation engine works</a> gives you the strategic framework to build lasting visibility.</p>",
  },

  // Section 5: Next Steps
  {
    type: "heading",
    id: "next-steps",
    content: "What Should I Do After Testing My AI Visibility?",
  },
  {
    type: "answer-capsule",
    content:
      "Document your baseline results, prioritize fixes starting with schema markup and citation consistency, then retest monthly. For a comprehensive analysis, use a professional AI visibility audit that tests across all major AI platforms and provides a prioritized action plan.",
  },
  {
    type: "body",
    content:
      "<p>You now have data. Here's how to use it:</p><p><strong>Step 1: Document your baseline.</strong> Save screenshots, record which platforms and prompts you tested, and note every competitor mentioned. This is your starting line.</p><p><strong>Step 2: Prioritize the highest-impact fixes.</strong> Schema markup and citation consistency deliver the fastest visibility gains. These are the foundation that everything else builds on.</p><p><strong>Step 3: Build authority content.</strong> Create content that directly answers the questions your customers ask AI engines. The prompts you used for testing? Those are your content topics.</p><p><strong>Step 4: Retest monthly.</strong> AI visibility isn't static. Models update, competitors optimize, and the landscape shifts. Monthly testing keeps you informed and responsive.</p><p><strong>Step 5: Consider a professional audit.</strong> Manual testing gives you a snapshot, but a comprehensive AI visibility audit tests hundreds of prompt variations across every major AI platform, analyzes your competitors' signals, and produces a prioritized action plan specific to your business and market.</p>",
  },
  {
    type: "callout",
    title: "The Stakes Are Real",
    content:
      "Businesses that appear in AI recommendations capture customers before those customers ever see a search results page. This isn't a future trend — it's happening now. The longer you wait to optimize, the more ground your competitors gain.",
  },
  {
    type: "cta-inline",
    content: "Get Your Free AI Visibility Audit",
  },
];
