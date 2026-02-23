import { Star } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="border-y border-[#1f1f1f] bg-[#111111]/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-sm text-gray-400">
          Trusted by HVAC companies, law firms, dental practices, and
          contractors across the US
        </p>

        <div className="flex items-center gap-2 shrink-0">
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
