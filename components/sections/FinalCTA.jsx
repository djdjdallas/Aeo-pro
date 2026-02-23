import { ArrowRight } from "lucide-react";

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
            <a
              href="#"
              className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all"
            >
              Get My Free Audit
              <ArrowRight size={18} />
            </a>
            <p className="text-sm text-gray-500 mt-5">
              No commitment. No sales pressure. Just data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
