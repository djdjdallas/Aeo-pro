import { ClipboardCheck, Settings, Building2, FileText, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: ClipboardCheck,
    title: "Audit",
    description:
      "We find every question people ask AI about your category in your city.",
  },
  {
    num: "02",
    icon: Settings,
    title: "Optimize",
    description:
      "We make your website readable and trustworthy to AI engines.",
  },
  {
    num: "03",
    icon: Building2,
    title: "Build",
    description:
      "We establish your presence across every source AI pulls from.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Seed",
    description:
      "We publish targeted content that teaches AI to recommend you by name.",
  },
  {
    num: "05",
    icon: BarChart3,
    title: "Track",
    description:
      "Weekly reports showing your AI visibility score growing over time.",
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
