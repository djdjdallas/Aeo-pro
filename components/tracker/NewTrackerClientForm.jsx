"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NewTrackerClientForm() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    location: "",
    target_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/tracker/generate-prompts?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Add Tracker Client</h1>
            <p className="text-gray-400 text-sm mt-1">
              Claude will auto-generate 10 tracking prompts for this business.
            </p>
          </div>
          <Link
            href={`/admin/tracker?key=${key}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vegas Pro Roofing"
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Business Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="roofing company"
                  value={form.business_type}
                  onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
                <p className="text-xs text-gray-600 mt-1">
                  e.g. &quot;roofing company&quot;, &quot;personal injury law firm&quot;, &quot;dental office&quot;
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Las Vegas, NV"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Target URL <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://vegasproroofing.com"
                  value={form.target_url}
                  onChange={(e) => setForm({ ...form, target_url: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Used to detect URL/domain citations in AI responses
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating prompts with Claude...
                </>
              ) : (
                "Create Client & Generate Prompts"
              )}
            </button>
          </form>
        ) : (
          /* Success state */
          <div className="space-y-5">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <p className="text-green-400 font-medium mb-1">Client created successfully</p>
              <p className="text-gray-400 text-sm">
                {result.prompts_created} prompts generated for {form.business_name}
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Generated Prompts</p>
              <ol className="space-y-2">
                {result.prompts?.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-gray-600 shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/admin/tracker/${result.client_id}?key=${key}`}
                className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-3 rounded-lg transition-colors text-center text-sm"
              >
                View Client Dashboard
              </Link>
              <button
                onClick={() => { setResult(null); setForm({ business_name: "", business_type: "", location: "", target_url: "" }); }}
                className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 font-medium py-3 px-5 rounded-lg transition-colors text-sm"
              >
                Add Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
