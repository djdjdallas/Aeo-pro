export default function TrustBar() {
  const platforms = [
    "ChatGPT",
    "Perplexity",
    "Google AI Overviews",
    "Microsoft Copilot",
    "Grok",
    "Meta AI",
  ];

  return (
    <section className="bg-[#0d0d0d] border-y border-[#1f1f1f] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-5">
          AI platforms we optimize for
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="text-sm text-gray-400 font-medium"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
