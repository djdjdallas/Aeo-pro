import { EyeOff, HelpCircle, Clock } from "lucide-react";

const cards = [
  {
    icon: EyeOff,
    headline: "You're not showing up in AI answers",
    description:
      "Customers are asking AI who to hire. Your competitors are getting named. You're not. We fix that.",
  },
  {
    icon: HelpCircle,
    headline: "You have no idea what AI says about you",
    description:
      "AI assistants might be recommending you — or describing you wrong — and you'd never know. Your free audit shows you exactly where you stand.",
  },
  {
    icon: Clock,
    headline: "You don't have time to figure this out yourself",
    description:
      "AEO isn't a one-hour setup. It's schema markup, citation building, review signals, content structure, and ongoing monitoring. We do all of it.",
  },
];

export default function WhoItsFor() {
  return (
    <section className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Built for local businesses that can&apos;t afford to be{" "}
          <span className="text-[#3b82f6]">invisible.</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto text-lg">
          If a new customer in your city asked ChatGPT for the best plumber, dentist,
          or roofer right now &mdash; would your business come up? We work with local
          service businesses where one new customer per week from AI referrals pays
          for the service ten times over.
        </p>

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
