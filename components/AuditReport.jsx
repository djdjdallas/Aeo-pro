"use client";

import { cn } from "@/lib/utils";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Eye,
  ArrowRight,
  Target,
  Zap,
  Lightbulb,
  Sparkles,
} from "lucide-react";

function ScoreGauge({ score, size = 120 }) {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const center = size / 2;

  const color =
    score <= 40
      ? "#ef4444"
      : score <= 70
        ? "#eab308"
        : "#22c55e";

  const bgColor =
    score <= 40
      ? "rgba(239, 68, 68, 0.1)"
      : score <= 70
        ? "rgba(234, 179, 8, 0.1)"
        : "rgba(34, 197, 94, 0.1)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="8"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
            filter: `drop-shadow(0 0 6px ${bgColor})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color, fontSize: size * 0.28 }}>
          {score}
        </span>
        <span className="text-gray-500 text-xs">/ 100</span>
      </div>
    </div>
  );
}

function MiniGauge({ score }) {
  const size = 48;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const center = size / 2;

  const color =
    score <= 40
      ? "#ef4444"
      : score <= 70
        ? "#eab308"
        : "#22c55e";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#1f1f1f" strokeWidth="4" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      label: "Critical",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-400",
      label: "Needs Work",
    },
    good: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      label: "Good",
    },
    insufficient_data: {
      bg: "bg-gray-500/10",
      border: "border-gray-500/20",
      text: "text-gray-400",
      label: "No Data",
    },
  };

  const c = config[status] || config.warning;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        c.bg,
        c.border,
        c.text
      )}
    >
      {status === "critical" && <AlertTriangle className="w-3 h-3" />}
      {status === "good" && <CheckCircle className="w-3 h-3" />}
      {status === "warning" && <AlertTriangle className="w-3 h-3" />}
      {status === "insufficient_data" && <HelpCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

export default function AuditReport({ data }) {
  const {
    business_name,
    overall_score,
    categories,
    top_3_priorities,
    ai_visibility_prediction,
    information_gain_signals,
    information_gain_opportunity,
    url,
    date,
  } = data;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <ScoreGauge score={overall_score} size={140} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              {business_name}
            </h2>
            <p className="text-gray-500 text-sm mb-1 break-all">{url}</p>
            <p className="text-gray-600 text-xs">{formattedDate}</p>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Overall AEO Score:{" "}
                <span
                  className="font-bold text-lg"
                  style={{
                    color:
                      overall_score <= 40
                        ? "#ef4444"
                        : overall_score <= 70
                          ? "#eab308"
                          : "#22c55e",
                  }}
                >
                  {overall_score}/100
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print cta-glow bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Information Gain Signals */}
      {information_gain_signals?.length > 0 && (
        <div className="bg-[#111111] border border-[#3b82f6]/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-lg font-bold tracking-tight">Information Gain Signals</h3>
          </div>
          <p className="text-gray-500 text-xs mb-3">Unique facts and credentials that drive AI citations</p>
          <ul className="space-y-2">
            {information_gain_signals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{cat.name}</h3>
                  <StatusBadge status={cat.status} />
                </div>
              </div>
              <MiniGauge score={cat.score} />
            </div>
            <p className="text-gray-400 text-sm mb-3">{cat.finding}</p>
            <div className="border-l-2 border-[#3b82f6] pl-3">
              <p className="text-sm text-gray-300">
                <span className="text-[#3b82f6] font-medium">Fix: </span>
                {cat.fix}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 Priorities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-xl font-bold tracking-tight">Top 3 Priorities</h3>
        </div>
        <div className="space-y-3">
          {top_3_priorities.map((priority, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                <span className="text-[#3b82f6] font-bold text-sm">{i + 1}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{priority}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Visibility Prediction */}
      <div className="bg-[#111111] border border-[#3b82f6]/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-lg font-bold tracking-tight">AI Visibility Prediction</h3>
        </div>
        <p className="text-gray-300 italic leading-relaxed">{ai_visibility_prediction}</p>
      </div>

      {/* Information Gain Opportunity */}
      {information_gain_opportunity && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-lg font-bold tracking-tight">Information Gain Opportunity</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{information_gain_opportunity}</p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="no-print bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-xl font-bold tracking-tight">Ready to fix these issues?</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Our AEO Pro team can implement all of these optimizations and get your business recommended by AI assistants.
        </p>
        <a
          href="/#pricing"
          className="cta-glow inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
        >
          View Plans & Pricing
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
