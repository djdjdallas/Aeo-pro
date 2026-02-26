"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewTrackerClientForm() {
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    location: "",
    target_url: "",
    differentiators: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editablePrompts, setEditablePrompts] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Generate prompts (no DB writes)
  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tracker/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setEditablePrompts(data.prompts.map((p) => p));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Save client + edited prompts
  async function handleSave() {
    const validPrompts = editablePrompts.filter((p) => p.trim());
    if (!validPrompts.length) {
      setError("Add at least one prompt.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/tracker/save-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prompts: validPrompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updatePrompt(index, value) {
    setEditablePrompts((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function removePrompt(index) {
    setEditablePrompts((prev) => prev.filter((_, i) => i !== index));
  }

  function addPrompt() {
    setEditablePrompts((prev) => [...prev, ""]);
  }

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Add Tracker Client</h1>
          <p className="text-gray-400 text-sm mt-1">
            {!editablePrompts && !result
              ? "Claude will auto-generate tracking prompts for this business."
              : editablePrompts && !result
                ? "Review and edit prompts before saving."
                : "Client created successfully."}
          </p>
        </div>
        <Link
          href="/admin/tracker"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      {/* Step 1: Business details form */}
      {!editablePrompts && !result && (
        <form onSubmit={handleGenerate} className="space-y-5">
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
                className={inputClass}
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
                className={inputClass}
              />
              <p className="text-xs text-gray-600 mt-1">
                e.g. &quot;roofing company&quot;, &quot;personal injury law firm&quot;, &quot;dental office&quot;
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                Location <span className="text-gray-600">(optional for SaaS/agencies)</span>
              </label>
              <input
                type="text"
                placeholder="Las Vegas, NV"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
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
                className={inputClass}
              />
              <p className="text-xs text-gray-600 mt-1">
                Used to detect URL/domain citations in AI responses
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                Key Differentiators <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="voice DNA matching, retention optimization, PVSS framework"
                value={form.differentiators}
                onChange={(e) => setForm({ ...form, differentiators: e.target.value })}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-gray-600 mt-1">
                What makes this business unique? Helps generate more targeted prompts.
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
              "Generate Prompts"
            )}
          </button>
        </form>
      )}

      {/* Step 2: Edit prompts before saving */}
      {editablePrompts && !result && (
        <div className="space-y-5">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Edit Prompts ({editablePrompts.length})
              </p>
              <button
                onClick={addPrompt}
                className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              >
                + Add prompt
              </button>
            </div>

            <div className="space-y-2.5">
              {editablePrompts.map((prompt, i) => (
                <div key={i} className="flex gap-2 items-start group">
                  <span className="text-gray-600 text-sm mt-2.5 shrink-0 w-5 text-right">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => updatePrompt(i, e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={() => removePrompt(i)}
                    className="text-gray-700 hover:text-red-400 transition-colors mt-2 shrink-0"
                    title="Remove prompt"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                `Save Client & ${editablePrompts.filter((p) => p.trim()).length} Prompts`
              )}
            </button>
            <button
              onClick={() => { setEditablePrompts(null); setError(null); }}
              disabled={saving}
              className="bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-gray-300 font-medium py-3 px-5 rounded-lg transition-colors text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {result && (
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <p className="text-green-400 font-medium mb-1">Client created successfully</p>
            <p className="text-gray-400 text-sm">
              {result.prompts_created} prompts saved for {form.business_name}
            </p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Saved Prompts</p>
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
              href={`/admin/tracker/${result.client_id}`}
              className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-3 rounded-lg transition-colors text-center text-sm"
            >
              View Client Dashboard
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setEditablePrompts(null);
                setForm({ business_name: "", business_type: "", location: "", target_url: "", differentiators: "" });
              }}
              className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 font-medium py-3 px-5 rounded-lg transition-colors text-sm"
            >
              Add Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
