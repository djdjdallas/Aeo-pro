import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCTA() {
  return (
    <section className="my-16 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-8 sm:p-10 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Is Your Business Visible in AI Search?
      </h2>
      <p className="mt-3 text-gray-400 max-w-xl mx-auto">
        Get a free AI visibility audit and find out exactly how ChatGPT, Perplexity, and Google AI Overviews see your business.
      </p>
      <Link
        href="/audit"
        className="cta-glow inline-flex items-center gap-2 mt-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-3 rounded-lg transition-all"
      >
        Get Your Free Audit
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
