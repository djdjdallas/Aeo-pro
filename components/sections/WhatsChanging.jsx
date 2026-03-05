export default function WhatsChanging() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-[#3b82f6] uppercase tracking-wider font-medium mb-4">
          What&apos;s changing
        </p>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8">
          Google used to be the only game in town.
        </h2>

        <div className="space-y-5 text-gray-400 leading-relaxed text-lg">
          <p>
            Now your customers have a new habit. Before they call anyone, they ask
            ChatGPT. They ask Perplexity. They ask Siri.
          </p>
          <p>
            And these AI assistants don&apos;t show a list of ten blue links. They
            pick two or three businesses &mdash; by name &mdash; and recommend them
            directly.
          </p>
          <p>
            The businesses that get recommended get the call. The ones that
            don&apos;t, don&apos;t exist.
          </p>
          <p>
            This shift has a name: <strong className="text-white">Answer Engine
            Optimization</strong>. AEO is the work of making sure AI assistants know
            who you are, trust what you do, and recommend you when it matters.
          </p>
        </div>

        {/* Callout stat */}
        <div className="mt-12 bg-[#111111] border-l-4 border-[#3b82f6] rounded-r-xl p-6 sm:p-8">
          <p className="text-xl sm:text-2xl font-semibold text-white leading-snug mb-2">
            &ldquo;Only 12% of businesses recommended by AI also rank in
            Google&apos;s top 10.&rdquo;
          </p>
          <p className="text-sm text-gray-500">
            AI visibility is a completely separate game. Your SEO agency isn&apos;t solving this.
          </p>
        </div>
      </div>
    </section>
  );
}
