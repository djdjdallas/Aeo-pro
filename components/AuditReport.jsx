"use client";

import { useState } from "react";
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
  Bot,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  BarChart3,
  TrendingUp,
} from "lucide-react";

// ─── Score Gauges ───

function ScoreGauge({ score, size = 120 }) {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const center = size / 2;

  const color =
    score <= 40 ? "#ef4444" : score <= 70 ? "#eab308" : "#22c55e";
  const bgColor =
    score <= 40
      ? "rgba(239, 68, 68, 0.1)"
      : score <= 70
        ? "rgba(234, 179, 8, 0.1)"
        : "rgba(34, 197, 94, 0.1)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#1f1f1f" strokeWidth="8" />
        <circle
          cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out", filter: `drop-shadow(0 0 6px ${bgColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color, fontSize: size * 0.28 }}>{score}</span>
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
  const color = score <= 40 ? "#ef4444" : score <= 70 ? "#eab308" : "#22c55e";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#1f1f1f" strokeWidth="4" />
        <circle
          cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Status Badge ───

function StatusBadge({ status }) {
  const config = {
    critical: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Critical" },
    warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", label: "Needs Work" },
    good: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", label: "Good" },
    insufficient_data: { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400", label: "No Data" },
  };
  const c = config[status] || config.warning;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", c.bg, c.border, c.text)}>
      {status === "critical" && <AlertTriangle className="w-3 h-3" />}
      {status === "good" && <CheckCircle className="w-3 h-3" />}
      {status === "warning" && <AlertTriangle className="w-3 h-3" />}
      {status === "insufficient_data" && <HelpCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

// ─── NEW: Multi-Prompt AI Results ───

function MultiPromptResults({ liveAiCheck }) {
  const [expandedPrompts, setExpandedPrompts] = useState({});

  // Set first 2 expanded on mount (safe — runs after null check in render)
  const promptResults = liveAiCheck?.prompt_results;
  const hasResults = Array.isArray(promptResults) && promptResults.length > 0;

  // Initialize expanded state once
  if (hasResults && Object.keys(expandedPrompts).length === 0) {
    const initial = {};
    promptResults.forEach((_, i) => { if (i < 2) initial[i] = true; });
    if (Object.keys(initial).length > 0 && !expandedPrompts[0]) {
      // Will be set on first render
      setTimeout(() => setExpandedPrompts(initial), 0);
    }
  }

  if (!hasResults) return null;

  const togglePrompt = (i) => {
    setExpandedPrompts((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const { total_checks, client_mentions, mention_rate } = liveAiCheck;

  return (
    <div className="bg-[#0d0d0d] border border-[#3b82f6]/40 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-5 h-5 text-[#3b82f6]" />
        <h3 className="text-lg font-bold tracking-tight">Live AI Visibility Check</h3>
      </div>
      <p className="text-gray-500 text-xs mb-1">
        We queried ChatGPT and Perplexity with {liveAiCheck.prompt_results.length} prompts ({total_checks} total checks)
      </p>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{client_mentions}/{total_checks}</span>
          <span className="text-gray-500 text-sm">mentions</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-semibold",
          mention_rate >= 50 ? "bg-green-500/10 text-green-400" :
          mention_rate >= 25 ? "bg-yellow-500/10 text-yellow-400" :
          "bg-red-500/10 text-red-400"
        )}>
          {mention_rate}% mention rate
        </div>
      </div>

      <div className="space-y-3">
        {liveAiCheck.prompt_results.map((group, i) => {
          const isExpanded = expandedPrompts[i];
          const chatgptMentioned = group.chatgpt?.mentioned;
          const pplxMentioned = group.perplexity?.mentioned;

          return (
            <div key={i} className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <button
                onClick={() => togglePrompt(i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 italic truncate">"{group.prompt}"</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn("text-xs font-medium", chatgptMentioned ? "text-green-400" : "text-red-400")}>
                      ChatGPT: {chatgptMentioned ? "Mentioned" : "Not found"}
                    </span>
                    <span className={cn("text-xs font-medium", pplxMentioned ? "text-green-400" : "text-red-400")}>
                      Perplexity: {pplxMentioned ? "Mentioned" : "Not found"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <div className="flex gap-1">
                    {chatgptMentioned
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-500" />}
                    {pplxMentioned
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#1f1f1f] pt-3 space-y-3">
                  {/* ChatGPT Result */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">ChatGPT</p>
                    {group.chatgpt?.mentioned ? (
                      <p className="text-sm text-gray-300 italic">{group.chatgpt.snippet}</p>
                    ) : (
                      <p className="text-sm text-gray-600">Not mentioned in response</p>
                    )}
                    {group.chatgpt?.full_response && (
                      <details className="mt-2">
                        <summary className="text-xs text-[#3b82f6] cursor-pointer hover:underline">View full response</summary>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap max-h-40 overflow-y-auto">{group.chatgpt.full_response}</p>
                      </details>
                    )}
                  </div>
                  {/* Perplexity Result */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Perplexity</p>
                    {group.perplexity?.mentioned ? (
                      <p className="text-sm text-gray-300 italic">{group.perplexity.snippet}</p>
                    ) : (
                      <p className="text-sm text-gray-600">Not mentioned in response</p>
                    )}
                    {group.perplexity?.full_response && (
                      <details className="mt-2">
                        <summary className="text-xs text-[#3b82f6] cursor-pointer hover:underline">View full response</summary>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap max-h-40 overflow-y-auto">{group.perplexity.full_response}</p>
                      </details>
                    )}
                  </div>
                  {/* Competitors */}
                  {group.competitors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Competitors mentioned</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.competitors.slice(0, 10).map((comp, ci) => (
                          <span key={ci} className="bg-[#1f1f1f] border border-[#2a2a2a] text-gray-400 text-xs px-2 py-0.5 rounded-full">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEW: Share of Voice Table ───

function ShareOfVoiceTable({ liveAiCheck }) {
  if (!liveAiCheck?.share_of_voice || typeof liveAiCheck.share_of_voice !== "object") return null;

  const sovEntries = Object.entries(liveAiCheck.share_of_voice);
  if (sovEntries.length === 0) return null;

  const entries = sovEntries
    .map(([name, data]) => ({ name, mentions: data?.mentions ?? 0, total: data?.total ?? 0, percentage: data?.percentage ?? 0 }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15);

  const clientName = (liveAiCheck.business_name || "").toLowerCase();

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
        <h3 className="text-lg font-bold tracking-tight">Share of Voice</h3>
      </div>
      <p className="text-gray-500 text-xs mb-4">
        How often each business appears across {liveAiCheck.total_checks} AI responses
      </p>
      <div className="space-y-2">
        {entries.map((entry) => {
          const isClient = entry.name.toLowerCase() === clientName;
          return (
            <div
              key={entry.name}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                isClient ? "bg-[#3b82f6]/10 border-[#3b82f6]/30" : "border-[#1f1f1f]"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate capitalize",
                  isClient ? "text-[#3b82f6]" : "text-gray-300"
                )}>
                  {entry.name}
                  {isClient && <span className="text-xs text-[#3b82f6]/70 ml-2">(You)</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500 w-12 text-right">{entry.mentions}/{entry.total}</span>
                <div className="w-24 bg-[#1f1f1f] rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", isClient ? "bg-[#3b82f6]" : "bg-gray-600")}
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
                <span className={cn(
                  "text-xs font-semibold w-10 text-right",
                  isClient ? "text-[#3b82f6]" : "text-gray-400"
                )}>
                  {entry.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEW: AI Crawler Access Grid ───

function AiCrawlerAccess({ crawlerAccess }) {
  if (!crawlerAccess || Object.keys(crawlerAccess).length === 0) return null;

  const entries = Object.entries(crawlerAccess);
  const blockedCount = entries.filter(([, status]) => status === "blocked").length;

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#3b82f6]" />
        <h3 className="text-lg font-bold tracking-tight">AI Crawler Access</h3>
      </div>

      {blockedCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm font-semibold">
            CRITICAL: {blockedCount} AI crawler{blockedCount > 1 ? "s" : ""} blocked in robots.txt
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {entries.map(([crawler, status]) => {
          const colorMap = {
            blocked: "bg-red-500/10 border-red-500/20 text-red-400",
            allowed: "bg-green-500/10 border-green-500/20 text-green-400",
            "not specified": "bg-gray-500/10 border-gray-500/20 text-gray-500",
          };
          const label = status === "not specified" ? "No rule" : status.charAt(0).toUpperCase() + status.slice(1);
          return (
            <div key={crawler} className={cn("border rounded-xl p-3 text-center", colorMap[status] || colorMap["not specified"])}>
              <p className="text-xs font-mono font-medium truncate">{crawler}</p>
              <p className="text-xs mt-1 font-semibold">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEW: Citation Tier Card ───

function CitationTierCard({ citationTiers }) {
  if (!citationTiers?.tiers) return null;

  const { tiers, score, summary } = citationTiers;

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-lg font-bold tracking-tight">Citation Tier Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{summary}</span>
          <span className={cn(
            "text-sm font-bold",
            score >= 60 ? "text-green-400" : score >= 30 ? "text-yellow-400" : "text-red-400"
          )}>
            {score}/100
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tiers.map((tier) => (
          <div key={tier.tier} className="flex items-center gap-3 p-3 rounded-xl border border-[#1f1f1f]">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">{tier.tier}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-300">{tier.name}</p>
              <p className="text-xs text-gray-500 truncate">{tier.detail}</p>
            </div>
            <span className={cn(
              "flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border",
              tier.status === "found"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {tier.status === "found" ? "Found" : "Missing"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODIFIED: AI Visibility Prediction (quantitative) ───

function AiVisibilityPrediction({ prediction }) {
  if (!prediction) return null;

  // Handle both old string format and new object format
  if (typeof prediction === "string") {
    return (
      <div className="bg-[#111111] border border-[#3b82f6]/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-lg font-bold tracking-tight">AI Visibility Prediction</h3>
        </div>
        <p className="text-gray-300 italic leading-relaxed">{prediction}</p>
      </div>
    );
  }

  const current_appearances = prediction.current_appearances ?? 0;
  const total_checks = prediction.total_checks ?? 0;
  const current_rate = prediction.current_rate ?? 0;
  const predicted_rate_after_optimization = prediction.predicted_rate_after_optimization ?? 0;
  const ninety_day_target = prediction.ninety_day_target || "";
  const narrative = prediction.narrative || "";

  return (
    <div className="bg-[#111111] border border-[#3b82f6]/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
        <h3 className="text-lg font-bold tracking-tight">AI Visibility Prediction</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs mb-1">Current Visibility</p>
          <p className="text-3xl font-bold text-white">{current_appearances}<span className="text-gray-500 text-lg">/{total_checks}</span></p>
          <p className={cn(
            "text-sm font-semibold mt-1",
            current_rate >= 50 ? "text-green-400" : current_rate >= 25 ? "text-yellow-400" : "text-red-400"
          )}>
            {current_rate}% appearance rate
          </p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#3b82f6]/20 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs mb-1">90-Day Target</p>
          <p className="text-3xl font-bold text-[#3b82f6]">{predicted_rate_after_optimization}<span className="text-[#3b82f6]/50 text-lg">%</span></p>
          {ninety_day_target && (
            <p className="text-sm text-[#3b82f6]/80 mt-1">{ninety_day_target}</p>
          )}
        </div>
      </div>

      {narrative && (
        <p className="text-gray-400 text-sm leading-relaxed italic">{narrative}</p>
      )}
    </div>
  );
}

// ─── Main Report ───

export default function AuditReport({ data }) {
  if (!data) return null;

  const {
    business_name = "Unknown",
    overall_score = 0,
    categories = [],
    top_3_priorities = [],
    ai_visibility_prediction,
    information_gain_signals = [],
    information_gain_opportunity,
    live_ai_check,
    citation_tiers,
    ai_crawler_access,
    url = "",
    date,
  } = data;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
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
                    color: overall_score <= 40 ? "#ef4444" : overall_score <= 70 ? "#eab308" : "#22c55e",
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

      {/* 2. Multi-Prompt AI Visibility Results (NEW) */}
      <MultiPromptResults liveAiCheck={live_ai_check} />

      {/* 3. Share of Voice Table (NEW) */}
      <ShareOfVoiceTable liveAiCheck={live_ai_check} />

      {/* 4. AI Crawler Access (NEW) */}
      <AiCrawlerAccess crawlerAccess={ai_crawler_access} />

      {/* 5. Information Gain Signals */}
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

      {/* 6. Citation Tier Card (NEW) */}
      <CitationTierCard citationTiers={citation_tiers} />

      {/* 7. Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories?.map((cat) => (
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

      {/* 8. Top 3 Priorities */}
      {top_3_priorities?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-xl font-bold tracking-tight">Top 3 Priorities</h3>
          </div>
          <div className="space-y-3">
            {top_3_priorities.map((priority, i) => (
              <div key={i} className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                  <span className="text-[#3b82f6] font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. AI Visibility Prediction (MODIFIED) */}
      <AiVisibilityPrediction prediction={ai_visibility_prediction} />

      {/* 10. Information Gain Opportunity */}
      {information_gain_opportunity && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-lg font-bold tracking-tight">Information Gain Opportunity</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{information_gain_opportunity}</p>
        </div>
      )}

      {/* 11. Bottom CTA */}
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
