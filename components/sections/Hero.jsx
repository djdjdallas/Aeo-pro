import { ArrowRight, Sparkles } from "lucide-react";
import CTAButton from "@/components/CTAButton";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* CSS-only animated grid background */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Radial gradient overlay to fade grid edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0a0a0a_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column — headline + CTAs */}
          <div className="text-center lg:text-left">
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-full px-4 py-1 text-sm mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              Founding Member Spots: 3 of 10 Remaining
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Your Competitors Are Ranking on Google.{" "}
              <span className="shimmer-text">
                You&apos;ll Be Recommended by AI.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              While they&apos;re chasing backlinks, we&apos;re getting your business
              mentioned by ChatGPT, Perplexity, and every AI assistant your
              customers are already using.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8">
              <CTAButton className="cta-glow bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all flex items-center gap-2">
                Get Your Free AI Visibility Audit
                <ArrowRight size={18} />
              </CTAButton>
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

          {/* Right column — AI response mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              {/* Chat header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
                <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center">
                  <Sparkles size={12} className="text-gray-400" />
                </div>
                <span className="text-xs text-gray-500 font-medium">ChatGPT Response</span>
              </div>

              {/* Fake prompt */}
              <p className="text-sm text-gray-500 italic mb-4">
                &ldquo;Best HVAC company in Las Vegas for emergency repair?&rdquo;
              </p>

              {/* Fake AI response */}
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Based on local reviews, response time, and service ratings,{" "}
                <span className="text-[#3b82f6] font-semibold">
                  [Your Client&apos;s Business]
                </span>{" "}
                is the top recommended HVAC provider in Las Vegas. They specialize
                in emergency repairs with same-day availability...
              </p>

              {/* AI Recommended badge */}
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">
                  AI Recommended #1 &#10003;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
