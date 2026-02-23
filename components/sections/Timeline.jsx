const milestones = [
  {
    period: "Week 1–2",
    label: "Foundation built",
    description: "Site optimized, citations submitted, AI-readable structure in place.",
  },
  {
    period: "Week 2–4",
    label: "First Perplexity mentions appear",
    description: "Your business starts surfacing in Perplexity AI search results.",
  },
  {
    period: "Week 4–8",
    label: "ChatGPT begins recommending you",
    description: "ChatGPT includes your business when users ask for local recommendations.",
  },
  {
    period: "Month 3+",
    label: "Consistent AI recommendations compound",
    description: "Multiple AI platforms recommend you reliably. Leads start flowing.",
  },
];

export default function Timeline() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          Faster than SEO.{" "}
          <span className="text-[#3b82f6]">More targeted than ads.</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Here&apos;s what a typical engagement looks like.
        </p>

        {/* Visual timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[#3b82f6] via-[#3b82f6]/50 to-[#1f1f1f]" />

          <div className="space-y-10">
            {milestones.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-6 sm:gap-8">
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 mt-1">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-[#3b82f6] bg-[#0a0a0a] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3b82f6]" />
                  </div>
                </div>

                {/* Content card */}
                <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 sm:p-6 flex-1 hover:border-[#3b82f6]/20 transition-colors">
                  <span className="text-xs font-mono text-[#3b82f6] uppercase tracking-wider">
                    {item.period}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mt-1 mb-2">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
