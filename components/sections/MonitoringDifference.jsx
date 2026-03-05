import { Check, X } from "lucide-react";

const rows = [
  { feature: "Shows you your visibility score", diy: true, fa: true },
  { feature: "Runs queries multiple times daily", diy: false, fa: true },
  { feature: "Statistical confidence on results", diy: false, fa: true },
  { feature: "Fixes your schema markup", diy: false, fa: true },
  { feature: "Builds your citation profile", diy: false, fa: true },
  { feature: "Runs review collection campaigns", diy: false, fa: true },
  { feature: "Drop detection alerts", diy: false, fa: true },
  { feature: "Monthly report with competitor SOV", diy: false, fa: true },
  { feature: "Tracks position quality (1st vs last mention)", diy: false, fa: true },
];

export default function MonitoringDifference() {
  return (
    <section className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-[#3b82f6] uppercase tracking-wider font-medium text-center mb-4">
          Why not just use a monitoring tool?
        </p>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Monitoring tells you the problem.{" "}
          <span className="text-[#3b82f6]">We fix it.</span>
        </h2>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Tools like Otterly and Peec AI will show you that your business
              isn&apos;t appearing in AI answers. They&apos;ll tell you your mention
              rate is 8%. Then they stop.
            </p>
            <p>
              First Answer is the work that comes after the dashboard. The citation
              building. The schema fixes. The review campaigns. The content
              restructuring. The outreach to comparison article authors. None of that
              happens automatically &mdash; and none of those tools do it for you.
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] gap-4 px-6 py-4 border-b border-[#1f1f1f] bg-[#0d0d0d]">
            <span className="text-xs text-gray-500 uppercase tracking-wider" />
            <span className="text-xs text-gray-500 uppercase tracking-wider text-center">
              DIY Tools
            </span>
            <span className="text-xs text-[#3b82f6] uppercase tracking-wider text-center font-medium">
              First Answer
            </span>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] gap-4 px-6 py-3.5 items-center ${
                i < rows.length - 1 ? "border-b border-[#1f1f1f]" : ""
              }`}
            >
              <span className="text-sm text-gray-300">{row.feature}</span>
              <div className="flex justify-center">
                {row.diy ? (
                  <Check size={18} className="text-gray-500" />
                ) : (
                  <X size={18} className="text-gray-700" />
                )}
              </div>
              <div className="flex justify-center">
                <Check size={18} className="text-[#3b82f6]" />
              </div>
            </div>
          ))}

          {/* Price row */}
          <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] gap-4 px-6 py-4 bg-[#0d0d0d] border-t border-[#1f1f1f]">
            <span className="text-sm text-gray-400 font-medium">Price</span>
            <span className="text-sm text-gray-400 text-center">$29&ndash;$399/mo</span>
            <span className="text-sm text-[#3b82f6] text-center font-semibold">From $500/mo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
