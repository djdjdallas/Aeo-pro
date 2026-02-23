import {
  Flame,
  Hammer,
  Smile,
  Scale,
  Sparkles,
  Wrench,
} from "lucide-react";

const businesses = [
  { icon: Flame, label: "HVAC & Plumbing" },
  { icon: Hammer, label: "Roofing" },
  { icon: Smile, label: "Dentists" },
  { icon: Scale, label: "Law Firms" },
  { icon: Sparkles, label: "Med Spas" },
  { icon: Wrench, label: "Contractors" },
];

export default function WhoItsFor() {
  return (
    <section className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-16 tracking-tight max-w-3xl mx-auto">
          Built for businesses where{" "}
          <span className="text-[#3b82f6]">one new customer</span> pays for the
          whole month
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-10">
          {businesses.map((biz) => {
            const Icon = biz.icon;
            return (
              <div
                key={biz.label}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 hover:border-[#3b82f6]/30 transition-colors flex flex-col items-center gap-3"
              >
                <Icon size={28} className="text-[#3b82f6]" />
                <span className="text-sm font-medium text-gray-300">
                  {biz.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-gray-500 text-sm">
          If a single job is worth $500+, AI visibility pays for itself.
        </p>
      </div>
    </section>
  );
}
