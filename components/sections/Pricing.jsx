import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTAButton from "@/components/CTAButton";

const plans = [
  {
    name: "Starter",
    price: "$500",
    popular: false,
    features: [
      "Schema optimization",
      "20 citation submissions",
      "Monthly AI visibility report",
    ],
    footnote: "Setup in 48 hours \u00B7 Cancel anytime",
  },
  {
    name: "Growth",
    price: "$1,000",
    popular: true,
    features: [
      "Everything in Starter",
      "Weekly AI monitoring",
      "Content drops for top 10 queries",
      "Competitor gap analysis",
    ],
    footnote: "Setup in 48 hours \u00B7 Cancel anytime \u00B7 Most popular",
  },
  {
    name: "Pro",
    price: "$1,500",
    popular: false,
    features: [
      "Everything in Growth",
      "Google Business optimization",
      "Review strategy + response management",
      "Bi-weekly strategy calls",
    ],
    footnote: "Setup in 48 hours \u00B7 Dedicated onboarding call",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Every plan includes our core AEO methodology. Pick the level
          of intensity that matches your goals.
        </p>

        {/* Scarcity / founding member line */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm text-blue-400 border border-blue-500/20 bg-blue-500/5 rounded-lg py-3 px-6">
            Founding member pricing — locked in for life when you start today.
            Price increases when all 10 spots are filled.
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
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
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
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

              {/* Footnote under CTA */}
              <p className="text-xs text-gray-500 text-center mt-3">
                {plan.footnote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
