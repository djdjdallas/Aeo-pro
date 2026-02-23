import { Search, MessageSquare, AlertTriangle } from "lucide-react";

const cards = [
  {
    icon: Search,
    headline: "The Old Way",
    description:
      "Google search. Scroll through a list of 10 results. Maybe click one. Customers had options — and you had to fight for every click.",
  },
  {
    icon: MessageSquare,
    headline: "The New Way",
    description:
      "Ask an AI assistant one question. Get one recommendation. Call that business. Customers now get a single answer — and it better be you.",
  },
  {
    icon: AlertTriangle,
    headline: "The Risk",
    description:
      "If AI doesn't know your business exists, you won't be recommended. No mention means no calls. You become invisible to a growing channel.",
  },
];

export default function Problem() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          The way people find local businesses{" "}
          <span className="text-[#3b82f6]">just changed.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.headline}
                className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 hover:border-[#3b82f6]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mb-5">
                  <Icon size={24} className="text-[#3b82f6]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {card.headline}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
