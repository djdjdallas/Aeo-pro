// Shared data used by both server components (JSON-LD) and client components (UI).
// Extracted here so "use client" modules like FAQ.jsx don't block server imports.

export const homepageFaqs = [
  {
    question: "What exactly is AEO?",
    answer:
      "AEO — Answer Engine Optimization — is the practice of making your business visible in AI-generated answers. When someone asks ChatGPT \"best dentist in Austin\" or Perplexity \"trusted plumber near me,\" AI assistants pull from a specific set of signals to decide who to recommend. AEO is the work of building those signals: structured data, external citations, verified reviews, content that AI can extract and quote. It's separate from SEO, which targets Google's ranking algorithm.",
  },
  {
    question: "How is this different from SEO?",
    answer:
      "SEO gets you ranked on Google. AEO gets you recommended by AI. They're complementary but completely different systems — only 12% of URLs cited by AI assistants also appear in Google's top 10. Your SEO agency isn't doing this, and their work won't automatically transfer. We work alongside your SEO agency — they handle Google, we handle AI.",
  },
  {
    question: "How do you know it's actually working?",
    answer:
      "We run your tracked queries across ChatGPT and Perplexity multiple times daily, aggregate the results, and calculate your mention rate with statistical confidence intervals — so you're seeing a real trend, not a one-day snapshot. Your monthly report shows your mention rate, AEO composite score, and share of voice vs. competitors. If your visibility drops significantly between reports, you get an alert automatically.",
  },
  {
    question: "How long until I see results?",
    answer:
      "Citation tier setup shows immediate progress in weeks 1-2 (we can show you the platforms going live). First AI mention rate improvements typically appear in weeks 6-8. A full before/after comparison at 90 days is where most clients see the clearest proof — going from sub-10% to 30-40% mention rates. We require a 90-day minimum engagement because the research is clear: meaningful AI visibility changes take 90 days, and anyone promising faster is not being straight with you.",
  },
  {
    question: "What if I already have an SEO agency?",
    answer:
      "Good — keep them. We work alongside SEO agencies, not against them. They handle Google rankings; we handle AI recommendations. Many SEO signals actually support AEO work, so businesses with solid SEO foundations often see faster AEO results.",
  },
  {
    question: "Which AI platforms does First Answer target?",
    answer:
      "We optimize for ChatGPT, Perplexity, Google AI Overviews, Microsoft Copilot, Grok, and Meta AI. Starter plans include ChatGPT monitoring; Growth adds Perplexity; Pro covers all six. Because most AI platforms pull from similar underlying signals (Bing index, structured data, citation authority), improvements on one platform typically lift visibility across all of them.",
  },
  {
    question: "Can I do this myself?",
    answer:
      "Yes — and tools like Otterly ($29/month) will show you your current visibility score. But the work that moves the score — citation building, schema implementation, review campaigns, content restructuring, comparison article outreach — takes 15-20 hours in month one alone, and ongoing management after that. Most business owners hire us because their time is worth more than the monthly fee.",
  },
  {
    question: "What does the free audit include?",
    answer:
      "Your free audit runs 12 real queries across ChatGPT and Perplexity — purchase-intent queries based on your specific business type, not generic searches. You get your overall AEO score, mention rate (how often you appear vs. how often competitors do), citation tier analysis across 6 sources, schema markup assessment, and your top 3 highest-impact fixes. It's the same audit we run for paying clients at the start of engagement.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "500",
    description:
      "Full AEO foundation audit, schema markup, 6-platform citation setup, ChatGPT monitoring 3x daily, monthly report with AEO score",
  },
  {
    name: "Growth",
    price: "1000",
    description:
      "Everything in Starter plus Perplexity monitoring, verified review campaigns, Reddit + YouTube presence, competitor SOV report",
  },
  {
    name: "Pro",
    price: "1500",
    description:
      "Everything in Growth plus all 6 AI platforms monitored, comparison article outreach, quarterly content creation, bi-weekly strategy calls",
  },
];
