import { Star } from "lucide-react";

const stats = [
  { value: "30-60 Days", label: "To First AI Mention", highlight: false },
  { value: "3 of 10", label: "Founding Spots Left", highlight: true },
  { value: "$500+", label: "Avg Job Value for Our Clients", highlight: false },
  { value: "100%", label: "Audit Success Rate", highlight: false },
];

export default function SocialProof() {
  return (
    <section className="bg-[#0d0d0d] border-y border-[#1f1f1f] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#1f1f1f]">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:px-8">
              <p
                className={`text-3xl font-bold ${
                  stat.highlight ? "text-[#3b82f6]" : "text-white"
                }`}
              >
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 5-star trust line */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-[#1f1f1f]">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className="text-yellow-500 fill-yellow-500"
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            47 businesses and counting
          </span>
        </div>
      </div>
    </section>
  );
}
