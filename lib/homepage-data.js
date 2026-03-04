// Shared data used by both server components (JSON-LD) and client components (UI).
// Extracted here so "use client" modules like FAQ.jsx don't block server imports.

export const homepageFaqs = [
  {
    question: "How is this different from SEO?",
    answer:
      "SEO gets you ranked on Google. AEO gets you recommended by AI. They're complementary but most agencies only do one. We specialize in the one that's growing fastest — research shows AI-driven search is now the primary way 40%+ of consumers discover local businesses.",
  },
  {
    question: "How do I know it's working?",
    answer:
      "We run multi-shot tracking across ChatGPT, Perplexity, Gemini, and Google AI Overviews — querying each prompt 3 times for statistical rigor (AI responses are non-deterministic, with only ~30% of brands remaining visible between single runs). You get confidence scores, sentiment analysis, competitor share-of-voice tracking, and rolling trend charts.",
  },
  {
    question: "What if I already have an SEO agency?",
    answer:
      "Perfect. We work alongside them. They handle Google, we handle AI. Different channels, same goal.",
  },
  {
    question: "How long until I see results?",
    answer:
      "Most clients see their first AI mentions within 30–60 days. Broad category mentions typically come in by month 3.",
  },
  {
    question: "Which AI platforms does First Answer target?",
    answer:
      "We optimize for ChatGPT (OpenAI), Perplexity, Google Gemini / AI Overviews, Microsoft Copilot, and Apple Intelligence. Our approach uses schema markup, llms.txt, and citation signals that all major AI platforms use to evaluate and recommend businesses — so improvements across one platform typically lift visibility across all of them.",
  },
  {
    question: "How do AI citations actually drive customers to my business?",
    answer:
      "When a potential customer asks ChatGPT or Perplexity for a recommendation — 'best roofer in Phoenix' or 'trusted HVAC company near me' — AI models that cite your business include your business name, often your location, and sometimes a direct link to your website. These AI-referred visitors are high-intent: they've already been pre-qualified by the AI's recommendation before they ever reach your site.",
  },
  {
    question: "Why do Reddit and Wikipedia matter for AI?",
    answer:
      "Research shows Reddit is cited in 46.7% of AI responses and Wikipedia has a 3.2x citation multiplier — meaning businesses referenced on Wikipedia are over 3x more likely to be recommended by AI. Articles carry 41% of the weight in AI recommendation decisions. Our strategy targets these high-impact citation sources to maximize your AI visibility.",
  },
  {
    question: "What makes First Answer different from a traditional SEO agency?",
    answer:
      "Traditional SEO targets Google's ranking algorithm using backlinks, keyword density, and technical optimization. AEO targets AI recommendation systems using structured data, citation consistency, and content designed for machine extraction. We focus exclusively on AEO — it's the only thing we do, which means our methodology and monitoring are built specifically for AI visibility rather than adapted from SEO playbooks.",
  },
  {
    question: "Do I need to cancel my existing SEO agency to work with First Answer?",
    answer:
      "No. AEO and SEO are complementary. Your SEO agency improves your Google rankings; we get you recommended by AI assistants. In fact, many SEO signals (strong domain authority, quality backlinks, consistent NAP data) also support AEO — so businesses with solid SEO foundations often see faster results with our AEO work.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "500",
    description:
      "Schema + llms.txt optimization, 20 citation submissions, monthly AI visibility report",
  },
  {
    name: "Growth",
    price: "1000",
    description:
      "Everything in Starter plus 'Best X for Y' article placement, Reddit authority building, Wikipedia citation strategy",
  },
  {
    name: "Pro",
    price: "1500",
    description:
      "Everything in Growth plus review platform management, competitor share-of-voice tracking, bi-weekly strategy calls",
  },
];
