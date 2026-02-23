import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* CSS-only animated grid background */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Radial gradient overlay to fade grid edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0a0a0a_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Your Competitors Are Ranking on Google.{" "}
          <span className="shimmer-text">
            You&apos;ll Be Recommended by AI.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          While they&apos;re chasing backlinks, we&apos;re getting your business
          mentioned by ChatGPT, Perplexity, and every AI assistant your
          customers are already using.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="#cta"
            className="cta-glow bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all flex items-center gap-2"
          >
            Get Your Free AI Visibility Audit
            <ArrowRight size={18} />
          </a>
          <a
            href="#how-it-works"
            className="border border-[#1f1f1f] hover:border-[#3b82f6]/50 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-base sm:text-lg transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <p className="text-sm text-gray-500">
          Results in 30 days or we work free until you see them
        </p>
      </div>
    </section>
  );
}
