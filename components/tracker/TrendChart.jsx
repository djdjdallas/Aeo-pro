"use client";

import { useState, useMemo } from "react";
import { buildTrendData } from "@/lib/tracker/trends";

const MODEL_COLORS = {
  claude: "#f97316",
  chatgpt: "#22c55e",
  perplexity: "#8b5cf6",
  gemini: "#3b82f6",
};

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: Infinity },
];

export default function TrendChart({ results }) {
  const [range, setRange] = useState(30);
  const [showModels, setShowModels] = useState(false);

  const trendData = useMemo(() => buildTrendData(results), [results]);

  const filteredDaily = useMemo(() => {
    if (range === Infinity) return trendData.daily;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return trendData.daily.filter((d) => d.date >= cutoffStr);
  }, [trendData.daily, range]);

  const filteredRolling = useMemo(() => {
    if (range === Infinity) return trendData.rolling7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return trendData.rolling7.filter((d) => d.date >= cutoffStr);
  }, [trendData.rolling7, range]);

  if (!filteredDaily.length) {
    return null;
  }

  // SVG dimensions
  const width = 700;
  const height = 200;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxRate = 100;
  const xScale = (i) => padLeft + (i / Math.max(filteredDaily.length - 1, 1)) * chartW;
  const yScale = (rate) => padTop + chartH - (rate / maxRate) * chartH;

  // Build polyline points for daily mention rate
  const dailyPoints = filteredDaily.map((d, i) => `${xScale(i)},${yScale(d.rate)}`).join(" ");

  // Build polyline for 7-day rolling average
  const rollingPoints = filteredRolling.map((d, i) => `${xScale(i)},${yScale(d.avg)}`).join(" ");

  // Per-model lines
  const modelLines = {};
  if (showModels) {
    for (const [model, data] of Object.entries(trendData.byModel)) {
      const cutoff = range === Infinity ? "" : (() => {
        const d = new Date();
        d.setDate(d.getDate() - range);
        return d.toISOString().split("T")[0];
      })();
      const filtered = cutoff ? data.filter((d) => d.date >= cutoff) : data;
      if (filtered.length > 1) {
        modelLines[model] = filtered
          .map((d, i) => `${padLeft + (i / Math.max(filtered.length - 1, 1)) * chartW},${yScale(d.rate)}`)
          .join(" ");
      }
    }
  }

  // X-axis labels (show ~5 dates)
  const labelIndices = [];
  const step = Math.max(1, Math.floor(filteredDaily.length / 5));
  for (let i = 0; i < filteredDaily.length; i += step) labelIndices.push(i);
  if (!labelIndices.includes(filteredDaily.length - 1)) labelIndices.push(filteredDaily.length - 1);

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Mention Rate Over Time</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModels(!showModels)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showModels ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30" : "bg-[#1f1f1f] text-gray-500 border border-[#2a2a2a]"
            }`}
          >
            By Model
          </button>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                range === r.days ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30" : "bg-[#1f1f1f] text-gray-500 border border-[#2a2a2a]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((rate) => (
          <g key={rate}>
            <line
              x1={padLeft}
              y1={yScale(rate)}
              x2={width - padRight}
              y2={yScale(rate)}
              stroke="#1f1f1f"
              strokeWidth="1"
            />
            <text
              x={padLeft - 6}
              y={yScale(rate) + 4}
              textAnchor="end"
              fill="#6b7280"
              fontSize="10"
            >
              {rate}%
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {labelIndices.map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - 4}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="9"
          >
            {filteredDaily[i]?.date?.slice(5)}
          </text>
        ))}

        {/* Per-model lines (behind main lines) */}
        {showModels && Object.entries(modelLines).map(([model, points]) => (
          <polyline
            key={model}
            points={points}
            fill="none"
            stroke={MODEL_COLORS[model] || "#6b7280"}
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}

        {/* Daily mention rate (dots + thin line) */}
        <polyline
          points={dailyPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {filteredDaily.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.rate)}
            r="2.5"
            fill="#3b82f6"
            opacity="0.4"
          />
        ))}

        {/* 7-day rolling average (bold line) */}
        {filteredRolling.length > 1 && (
          <polyline
            points={rollingPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#3b82f6] rounded inline-block"></span>
          7-day rolling avg
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-40 inline-block"></span>
          Daily rate
        </span>
        {showModels && Object.entries(MODEL_COLORS).map(([model, color]) => (
          <span key={model} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: color, opacity: 0.5 }}></span>
            {model}
          </span>
        ))}
      </div>
    </div>
  );
}
