"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import AuditReport from "@/components/AuditReport";
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Search,
  FileText,
  Brain,
  BarChart3,
  Bot,
  Building2,
  MessageSquare,
} from "lucide-react";

const LOADING_STEPS = [
  { label: "Fetching website...", icon: Search },
  { label: "Analyzing content structure...", icon: FileText },
  { label: "Checking AI accessibility...", icon: FileText },
  { label: "Generating buyer-intent prompts...", icon: Brain },
  { label: "Querying ChatGPT (6 prompts)...", icon: Bot },
  { label: "Querying Perplexity (6 prompts)...", icon: Bot },
  { label: "Checking citation sources...", icon: FileText },
  { label: "Running AI analysis...", icon: Brain },
  { label: "Generating report...", icon: BarChart3 },
];

const EXAMPLE_URLS = [
  "www.rfrplumbing.com",
  "www.acehandymanservices.com",
  "www.1800gotjunk.com",
];

export default function AuditPage() {
  const [view, setView] = useState("input");
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const stepTimerRef = useRef(null);
  const apiDoneRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  async function runAudit(inputUrl) {
    setError("");
    setReport(null);
    setLoadingStep(0);
    apiDoneRef.current = false;

    // Auto-prepend https://
    let fullUrl = inputUrl.trim();
    if (!fullUrl) {
      setError("Please enter a website URL.");
      return;
    }
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = `https://${fullUrl}`;
    }

    setView("loading");

    // Animate loading steps (~2s each for 8 steps)
    let currentStep = 0;
    stepTimerRef.current = setInterval(() => {
      if (apiDoneRef.current) return;
      currentStep++;
      if (currentStep < LOADING_STEPS.length - 1) {
        setLoadingStep(currentStep);
      } else {
        clearTimers();
      }
    }, 2000);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fullUrl,
          business_name: businessName.trim() || undefined,
          business_description: businessDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      apiDoneRef.current = true;
      clearTimers();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setView("input");
        return;
      }

      // Jump to final step, brief pause, then show results
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => {
        setReport(data.audit);
        setView("results");
      }, 600);
    } catch {
      apiDoneRef.current = true;
      clearTimers();
      setError("Network error. Please check your connection and try again.");
      setView("input");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runAudit(url);
  }

  function handleReset() {
    setView("input");
    setUrl("");
    setBusinessName("");
    setBusinessDescription("");
    setError("");
    setReport(null);
    setLoadingStep(0);
  }

  // ─── Input State ───
  if (view === "input") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI Visibility{" "}
              <span className="text-[#3b82f6]">Audit</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto">
              See how your website performs in AI-powered search engines and answer engines.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="Enter a website URL..."
                className={cn(
                  "w-full bg-[#111111] border text-white rounded-xl pl-12 pr-4 py-4 text-base placeholder:text-gray-600 focus:outline-none transition-colors",
                  error ? "border-red-500" : "border-[#1f1f1f] focus:border-[#3b82f6]"
                )}
                autoFocus
              />
            </div>

            {/* Optional: Business Name */}
            <div className="relative mb-4">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name (optional)"
                className="w-full bg-[#111111] border border-[#1f1f1f] text-white rounded-xl pl-12 pr-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>

            {/* Optional: Business Description */}
            <div className="relative mb-4">
              <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="What does this business do and who is it for? (optional, dramatically improves accuracy)"
                rows={2}
                className="w-full bg-[#111111] border border-[#1f1f1f] text-white rounded-xl pl-12 pr-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full cta-glow bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
            >
              Run Audit
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs mb-3">Try an example</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_URLS.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setUrl(example);
                    setError("");
                  }}
                  className="bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading State ───
  if (view === "loading") {
    const progress = ((loadingStep + 1) / LOADING_STEPS.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Analyzing Website</h2>
            <p className="text-gray-500 text-sm break-all">{url}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#1f1f1f] rounded-full h-1.5 mb-8">
            <div
              className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {LOADING_STEPS.map((step, i) => {
              const isActive = i === loadingStep;
              const isCompleted = i < loadingStep;
              const Icon = step.icon;

              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                    isActive
                      ? "bg-[#111111] border-[#3b82f6]/30"
                      : isCompleted
                        ? "bg-[#111111]/50 border-[#1f1f1f]"
                        : "border-transparent"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-[#3b82f6] animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "text-gray-500"
                          : "text-gray-600"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Results State ───
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 no-print">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleReset}
            className="border border-[#1f1f1f] hover:border-[#3b82f6]/50 text-gray-300 hover:text-white font-medium px-4 py-2 rounded-xl text-sm transition-all"
          >
            Run Another Audit
          </button>
        </div>

        <AuditReport data={report} />
      </div>
    </div>
  );
}
