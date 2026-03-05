import { Search, Wrench, TrendingUp, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Your Free Audit",
    description:
      "We run your business through 12 real AI queries across ChatGPT and Perplexity — the same questions your customers are actually asking. You see your current mention rate, which competitors are getting recommended instead of you, and exactly what's holding you back. Most businesses score under 20%. The audit takes 24 hours.",
  },
  {
    num: "02",
    icon: Wrench,
    title: "Foundation Month",
    description:
      "Month one is setup. We fix your schema markup, submit to Bing Webmaster Tools (the index ChatGPT actually reads), build your citation profile across G2, Capterra, Google Business, and 6 other AI citation sources, and rewrite your key page content so AI engines can extract and quote it. You get a report at the end showing every change made and your new citation tier score.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Authority Building",
    description:
      "Month two is where your AI visibility starts to move. We run a verified review collection campaign on G2 and Capterra, begin building your Reddit and YouTube presence (the two sources Perplexity cites most), and pitch your business for inclusion in \"best X in [city]\" articles — the single highest-impact signal in ChatGPT's recommendation system.",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Ongoing Monitoring & Management",
    description:
      "From month three on, our system runs your tracked queries across multiple AI platforms three times daily, applies statistical confidence intervals to filter out noise, and sends you a monthly report showing your mention rate trend, share of voice vs. competitors, and position quality score. If your visibility drops more than 15 points week-over-week, you get an alert before the monthly report — not after.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-[#3b82f6] uppercase tracking-wider font-medium text-center mb-4">
          How it works
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          Done for you.{" "}
          <span className="text-[#3b82f6]">Start to finish.</span>
        </h2>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-[#1f1f1f]" />

          <div className="space-y-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative flex gap-6 sm:gap-8">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0a0a0a] border-2 border-[#3b82f6] flex items-center justify-center">
                    <Icon size={20} className="text-[#3b82f6] sm:w-6 sm:h-6" />
                  </div>

                  {/* Content */}
                  <div className="pt-1 sm:pt-3">
                    <span className="text-xs text-[#3b82f6] font-mono mb-1 block">
                      STEP {step.num}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
