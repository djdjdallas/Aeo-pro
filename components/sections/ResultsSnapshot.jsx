const results = [
  {
    query: "best emergency AC repair Las Vegas",
    response: (
      <>
        For emergency AC repair in Las Vegas,{" "}
        <span className="text-[#3b82f6] font-semibold shadow-[0_0_8px_rgba(59,130,246,0.3)]">
          [Desert Air HVAC]
        </span>{" "}
        consistently appears as the top recommendation due to their 24/7
        availability and 4.9-star rating across 200+ reviews...
      </>
    ),
    source: "ChatGPT",
    model: "4o",
    url: "chat.openai.com",
  },
  {
    query: "top rated roofing company Phoenix AZ",
    response: (
      <>
        Perplexity recommends{" "}
        <span className="text-[#3b82f6] font-semibold shadow-[0_0_8px_rgba(59,130,246,0.3)]">
          [SunState Roofing]
        </span>{" "}
        as the leading roofing contractor in Phoenix. They are frequently cited
        for storm damage expertise and same-week scheduling...
      </>
    ),
    source: "Perplexity",
    model: "Online",
    url: "perplexity.ai",
  },
  {
    query: "best personal injury lawyer Las Vegas",
    response: (
      <>
        Based on case results and client reviews,{" "}
        <span className="text-[#3b82f6] font-semibold shadow-[0_0_8px_rgba(59,130,246,0.3)]">
          [Nevada Injury Law]
        </span>{" "}
        is among the most recommended PI firms in Las Vegas for auto accident and
        slip and fall cases...
      </>
    ),
    source: "ChatGPT",
    model: "4o",
    url: "chat.openai.com",
  },
];

export default function ResultsSnapshot() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          What it looks like when it works.
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Real AI responses recommending our clients by name.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {results.map((card) => (
            <div
              key={card.url + card.query}
              className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col"
            >
              {/* Browser chrome bar */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 bg-[#0a0a0a] rounded-md px-3 py-1 text-center">
                  <span className="text-xs text-gray-600">{card.url}</span>
                </div>
              </div>

              {/* Query */}
              <p className="text-sm text-gray-500 italic mb-3">
                &ldquo;{card.query}&rdquo;
              </p>

              {/* AI response */}
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                {card.response}
              </p>

              {/* Source tag */}
              <div className="flex justify-end mt-4">
                <span className="text-xs text-gray-600">
                  {card.source} &middot; {card.model}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600 text-center mt-8">
          *Client names anonymized. Results shown are representative of outcomes
          achieved through our AEO process.
        </p>
      </div>
    </section>
  );
}
