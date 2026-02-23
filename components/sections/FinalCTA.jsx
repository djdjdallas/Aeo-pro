import { ArrowRight, CalendarDays, Search, BarChart3 } from "lucide-react";
import CTAButton from "@/components/CTAButton";

const steps = [
  { icon: CalendarDays, label: "Book Free Audit" },
  { icon: Search, label: "We Run Your AI Report" },
  { icon: BarChart3, label: "You See Your Gaps" },
];

export default function FinalCTA() {
  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Card with blue gradient border effect */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient border — a background layer slightly larger than the card */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3b82f6] via-[#3b82f6]/30 to-[#3b82f6]/10 p-px">
            <div className="w-full h-full rounded-2xl bg-[#111111]" />
          </div>

          {/* Card content */}
          <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to be the business{" "}
              <span className="text-[#3b82f6]">AI recommends?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Start with a free AI Visibility Audit. We&apos;ll show you exactly
              where you stand, what competitors are doing, and what it takes to
              get mentioned first.
            </p>

            {/* 3-step process strip */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center">
                      <step.icon size={18} className="text-gray-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 text-center max-w-[100px]">
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight size={16} className="text-gray-600 -mt-6 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <CTAButton className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all">
              Get My Free Audit
              <ArrowRight size={18} />
            </CTAButton>
            <p className="text-sm text-gray-500 mt-5">
              No commitment. No sales pressure. Just data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
