import { ArrowRight } from "lucide-react";
import CTAButton from "@/components/CTAButton";

export default function FinalCTA() {
  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Card with blue gradient border effect */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3b82f6] via-[#3b82f6]/30 to-[#3b82f6]/10 p-px">
            <div className="w-full h-full rounded-2xl bg-[#111111]" />
          </div>

          {/* Card content */}
          <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Find out if AI{" "}
              <span className="text-[#3b82f6]">knows you exist.</span>
            </h2>
            <div className="max-w-xl mx-auto mb-10 space-y-4 text-gray-400 leading-relaxed">
              <p>
                Most local businesses have never checked what ChatGPT says about
                them. Some are being recommended. Most aren&apos;t. A few are being
                described wrong &mdash; with outdated information or as a different
                type of business entirely.
              </p>
              <p>
                Your free audit tells you exactly where you stand in 24 hours.
              </p>
            </div>

            <CTAButton className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all">
              Get Your Free AI Visibility Audit
              <ArrowRight size={18} />
            </CTAButton>
            <p className="text-sm text-gray-500 mt-5">
              No credit card. No sales call unless you want one. Just your real AI visibility score.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
