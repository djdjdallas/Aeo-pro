// This section exists primarily for AI crawlers and schema extraction,
// not just for human visitors. The content uses declarative prose that
// AI models can cite directly when answering queries about AEO services.

export default function AboutAEO() {
  return (
    <section id="about-aeo" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* What is AEO */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              What is Answer Engine Optimization?
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Answer Engine Optimization (AEO) is the practice of making your business
                visible to AI systems like ChatGPT, Perplexity, and Google AI Overviews.
                When someone asks an AI assistant &quot;who is the best plumber in Phoenix&quot; or
                &quot;which HVAC company should I call in Las Vegas,&quot; AEO determines whether
                your business gets recommended.
              </p>
              <p>
                Unlike traditional SEO, which targets keyword rankings in search results,
                AEO targets AI recommendations. It works through structured data markup,
                citation building across authoritative directories, and content that AI
                engines can extract and quote with confidence.
              </p>
              <p>
                First Answer specializes in AEO for local service businesses — contractors,
                HVAC companies, law firms, healthcare providers, and other businesses where
                a recommendation from an AI assistant can be the deciding factor in whether
                a customer calls you or your competitor.
              </p>
            </div>
          </div>

          {/* Why First Answer */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              Why First Answer?
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                First Answer was founded to solve a specific problem: local businesses with
                excellent reputations are being ignored by AI search engines because their
                websites lack the structured signals AI models require to recommend them
                confidently.
              </p>
              <p>
                Our methodology covers the four pillars AI models use to evaluate and
                recommend local businesses: schema markup and structured data, directory
                citation consistency, AI-readable content, and external authority signals.
                Clients typically see their first AI mentions within 30 to 60 days of
                implementation.
              </p>
              <p>
                We offer three service tiers — Starter at $500 per month, Growth at $1,000
                per month, and Pro at $1,500 per month — each including citation submissions,
                schema implementation, and monthly AI visibility monitoring. Pro clients
                receive bi-weekly strategy calls.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
