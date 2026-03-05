import { ArrowRight } from "lucide-react";
import CTAButton from "@/components/CTAButton";

export default function MidPageCTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          See exactly where you stand &mdash;{" "}
          <span className="text-[#3b82f6]">free.</span>
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed mb-4 max-w-2xl mx-auto">
          Your free AI visibility audit runs 12 real queries across ChatGPT and
          Perplexity using the exact phrases your customers type. You&apos;ll see
          your current mention rate, your composite AEO score, which competitors are
          being recommended instead of you, and the three highest-impact fixes you
          can make right now.
        </p>

        <p className="text-gray-500 mb-10">
          Most audits come back under 20%. Most businesses are surprised.
        </p>

        <CTAButton className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all">
          Get Your Free AI Visibility Audit
          <ArrowRight size={18} />
        </CTAButton>
        <p className="text-sm text-gray-600 mt-4">
          Takes 24 hours. No credit card. No sales call unless you want one.
        </p>
      </div>
    </section>
  );
}
