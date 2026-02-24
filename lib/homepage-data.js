// Shared data used by both server components (JSON-LD) and client components (UI).
// Extracted here so "use client" modules like FAQ.jsx don't block server imports.

export const homepageFaqs = [
  {
    question: "How is this different from SEO?",
    answer:
      "SEO gets you ranked on Google. AEO gets you recommended by AI. They're complementary but most agencies only do one. We specialize in the one that's growing fastest.",
  },
  {
    question: "How do I know it's working?",
    answer:
      "Every week we ask ChatGPT and Perplexity about your business category in your city and screenshot the results. You'll see your name appear in real time.",
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
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "500",
    description:
      "Schema optimization, 20 citation submissions, monthly AI visibility report",
  },
  {
    name: "Growth",
    price: "1000",
    description:
      "Everything in Starter plus weekly AI monitoring, content drops, competitor gap analysis",
  },
  {
    name: "Pro",
    price: "1500",
    description:
      "Everything in Growth plus Google Business optimization, review strategy, bi-weekly strategy calls",
  },
];
