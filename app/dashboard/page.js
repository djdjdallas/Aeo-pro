"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import TrendChart from "@/components/tracker/TrendChart";
import {
  BarChart3,
  TrendingUp,
  Users,
  Link2,
  Shield,
  LogOut,
  Loader2,
  Mail,
  ArrowRight,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function SentimentBar({ positive, neutral, negative }) {
  const total = positive + neutral + negative;
  if (total === 0) return <span className="text-gray-500 text-sm">No data</span>;
  const pPct = Math.round((positive / total) * 100);
  const nePct = Math.round((neutral / total) * 100);
  const ngPct = Math.round((negative / total) * 100);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-[#1f1f1f]">
        {pPct > 0 && <div className="bg-green-500" style={{ width: `${pPct}%` }} />}
        {nePct > 0 && <div className="bg-gray-500" style={{ width: `${nePct}%` }} />}
        {ngPct > 0 && <div className="bg-red-500" style={{ width: `${ngPct}%` }} />}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="text-green-400">{pPct}% positive</span>
        <span>{nePct}% neutral</span>
        <span className="text-red-400">{ngPct}% negative</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
      </div>
      <p className={`text-3xl font-bold ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Login View ──
function LoginView() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-400 text-sm">
            We sent a login link to <strong className="text-white">{email}</strong>.
            Click the link to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            AEO<span className="text-[#3b82f6]">Pro</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Client Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Send Login Link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Don&apos;t have an account?{" "}
          <a href="/#pricing" className="text-[#3b82f6] hover:underline">Get started</a>
        </p>
      </div>
    </div>
  );
}

// ── Dashboard View ──
function DashboardView({ session, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/client/dashboard", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to load dashboard");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [session.access_token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign out and try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { client, stats, sentiment, sov, citations, trend, prompts, recent_results } = data;
  const mentionColor = stats.mention_rate >= 50 ? "text-green-400" : stats.mention_rate >= 20 ? "text-yellow-400" : "text-red-400";

  // Convert trend data into results format for TrendChart
  const trendResults = (recent_results || []).map((r) => ({
    ...r,
    checked_at: r.checked_at,
    was_mentioned: r.was_mentioned,
    ai_model: r.ai_model,
  }));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{client.business_name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {client.business_type} &middot; {client.location}
              {client.plan && (
                <span className="ml-2 text-[#3b82f6] capitalize">{client.plan} Plan</span>
              )}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Mention Rate"
            value={stats.total_checks === 0 ? "—" : `${stats.mention_rate}%`}
            color={stats.total_checks > 0 ? mentionColor : "text-gray-400"}
            sub={`${stats.total_mentions} of ${stats.total_checks} checks`}
            icon={BarChart3}
          />
          <StatCard
            label="Share of Voice"
            value={sov ? `${sov.sov}%` : "—"}
            color="text-[#3b82f6]"
            sub="vs. competitors"
            icon={Users}
          />
          <StatCard
            label="Citations Found"
            value={citations ? citations.total : "—"}
            sub={citations?.clientCitations ? `${citations.clientCitations} to your site` : "URL references"}
            icon={Link2}
          />
          <StatCard
            label="Tracked Prompts"
            value={prompts?.length || 0}
            sub="across 4 AI models"
            icon={Shield}
          />
        </div>

        {/* Sentiment */}
        {sentiment && (sentiment.positive + sentiment.neutral + sentiment.negative) > 0 && (
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Mention Sentiment</h3>
            <SentimentBar {...sentiment} />
          </div>
        )}

        {/* Trend Chart */}
        <TrendChart results={trendResults} />

        {/* Competitors + Citations side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {sov?.topCompetitors?.length > 0 && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Top Competitors
              </h3>
              <div className="space-y-2">
                {sov.topCompetitors.map((comp, i) => (
                  <div key={comp.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      <span className="text-gray-600 mr-2">{i + 1}.</span>{comp.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded">
                      {comp.count} mentions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {citations?.topDomains?.length > 0 && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-500" />
                Top Cited Sources
              </h3>
              <div className="space-y-2">
                {citations.topDomains.map((d, i) => (
                  <div key={d.domain} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      <span className="text-gray-600 mr-2">{i + 1}.</span>{d.domain}
                    </span>
                    <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded">
                      {d.count} citations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tracked Prompts */}
        {prompts?.length > 0 && (
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">What We&apos;re Tracking</h3>
            <div className="space-y-2">
              {prompts.map((p) => (
                <div key={p.id} className="text-sm text-gray-400 py-1.5 border-b border-[#1f1f1f] last:border-0">
                  &ldquo;{p.prompt}&rdquo;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 mt-12">
          <p>Powered by <a href="https://firstanswer.co" className="text-[#3b82f6] hover:underline">First Answer</a></p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ClientDashboardPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setChecking(false);
    });

    // Listen for auth changes (magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  return <DashboardView session={session} onLogout={handleLogout} />;
}
