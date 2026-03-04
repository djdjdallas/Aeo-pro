import { ClipboardCheck, Settings, Building2, FileText, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: ClipboardCheck,
    title: "Audit",
    description:
      "We map every high-intent question people ask AI about your category in your city, then live-test whether you appear in ChatGPT, Perplexity, Gemini, and Google AI Overviews.",
  },
  {
    num: "02",
    icon: Settings,
    title: "Optimize",
    description:
      "We add structured schema, llms.txt, and FAQ markup so AI engines can extract your credentials. Research shows articles carry 41% of AI recommendation weight.",
  },
  {
    num: "03",
    icon: Building2,
    title: "Build",
    description:
      "We establish your presence across AI-cited sources: Wikipedia (3.2x citation multiplier), Reddit (cited in 46.7% of AI responses), and high-authority directories.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Seed",
    description:
      "We publish targeted 'Best X for Y' content and citation-rich articles that teach AI to recommend your business by name — the strategy proven to drive AI mentions.",
  },
  {
    num: "05",
    icon: BarChart3,
    title: "Track",
    description:
      "Multi-shot tracking across 4 AI models with confidence scoring, sentiment analysis, competitor share-of-voice, and rolling trend charts showing your growth.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          We make sure AI{" "}
          <span className="text-[#3b82f6]">recommends you.</span>
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
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed max-w-lg">
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
