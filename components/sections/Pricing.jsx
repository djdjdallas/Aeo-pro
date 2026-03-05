import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTAButton from "@/components/CTAButton";

const plans = [
  {
    name: "Starter",
    price: "$500",
    popular: false,
    subtitle: "For single-location local businesses ready to start showing up in AI answers.",
    features: [
      "Full AEO foundation audit",
      "Schema markup implementation",
      "6-platform citation setup (G2, Capterra, Bing, Google Business, AlternativeTo, Crunchbase)",
      "ChatGPT monitoring — queries run 3x daily",
      "Monthly report: mention rate, AEO score, top competitors",
      "Drop detection alerts (15-point threshold)",
    ],
    bestFor: "Plumbers, HVAC, roofers, trades, single-location service businesses",
    footnote: "Cancel anytime",
  },
  {
    name: "Growth",
    price: "$1,000",
    popular: true,
    subtitle: "For businesses serious about building lasting AI authority.",
    features: [
      "Everything in Starter",
      "Perplexity monitoring added",
      "Verified review collection campaign (G2 + Capterra)",
      "Reddit + YouTube presence building",
      "Monthly competitor share of voice report",
      "Comparison content strategy",
      "Position quality score tracking",
    ],
    bestFor: "Multi-location service businesses, professional services (lawyers, dentists, accountants)",
    footnote: "Cancel anytime",
  },
  {
    name: "Pro",
    price: "$1,500",
    popular: false,
    subtitle: "For businesses that want to dominate AI recommendations in their category.",
    features: [
      "Everything in Growth",
      "All 6 AI platforms monitored (ChatGPT, Perplexity, Gemini, Copilot, Grok, Meta AI)",
      "Comparison article outreach (\"best X in [city]\" publishers)",
      "Quarterly content creation (FAQ pages, comparison pages, accuracy explainers)",
      "Bi-weekly strategy calls",
      "Full share of voice dashboard with 90-day trends",
    ],
    bestFor: "High-value service businesses where one new client = $5,000+",
    footnote: "Dedicated onboarding call",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-[#3b82f6] uppercase tracking-wider font-medium text-center mb-4">
          Pricing
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          Simple monthly plans. Cancel anytime.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-16 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col ${
                plan.popular
                  ? "bg-[#111111] border-2 border-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                  : "bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30"
              }`}
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {plan.subtitle}
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="text-[#3b82f6] mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Best for */}
              <p className="text-xs text-gray-500 mb-6 border-t border-[#1f1f1f] pt-4">
                <span className="text-gray-400 font-medium">Best for:</span>{" "}
                {plan.bestFor}
              </p>

              <CTAButton
                plan={plan.name}
                className={`cta-glow w-full inline-flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all text-sm ${
                  plan.popular
                    ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                    : "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-200 border border-[#1f1f1f]"
                }`}
              >
                Get Started
                <ArrowRight size={16} />
              </CTAButton>

              <p className="text-xs text-gray-500 text-center mt-3">
                {plan.footnote}
              </p>
            </div>
          ))}
        </div>

        {/* One-time audit option */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              One-Time Audit &mdash; $300
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Not ready for a monthly plan? Get the full audit report &mdash; AEO
              score, AI query results, citation tier analysis, and your top 3 fixes
              &mdash; as a standalone PDF. Credited toward Month 1 if you sign up
              within 30 days.
            </p>
            <CTAButton
              plan="Audit"
              className="inline-flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-200 border border-[#1f1f1f] font-medium px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              Request Paid Audit
              <ArrowRight size={16} />
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
