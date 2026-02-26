"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditablePromptsList({ prompts: initialPrompts, clientId }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function updatePrompt(id, value) {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, prompt: value } : p)));
  }

  function removePrompt(id) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  function addPrompt() {
    setPrompts((prev) => [...prev, { id: `new-${Date.now()}`, prompt: "", isNew: true }]);
  }

  async function handleSave() {
    const validPrompts = prompts.filter((p) => p.prompt.trim());
    if (!validPrompts.length) {
      setError("Keep at least one prompt.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/tracker/prompts/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompts: validPrompts.map((p) => ({
            id: p.isNew ? null : p.id,
            prompt: p.prompt.trim(),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setPrompts(initialPrompts);
    setEditing(false);
    setError(null);
  }

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors";

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          Tracking These Prompts ({prompts.length})
        </p>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={addPrompt}
            className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            + Add prompt
          </button>
        )}
      </div>

      {!editing ? (
        <ol className="space-y-2">
          {prompts.map((p, i) => (
            <li key={p.id} className="flex gap-3 text-sm text-gray-300">
              <span className="text-gray-600 shrink-0">{i + 1}.</span>
              <span>{p.prompt}</span>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <div className="space-y-2">
            {prompts.map((p, i) => (
              <div key={p.id} className="flex gap-2 items-start">
                <span className="text-gray-600 text-sm mt-2 shrink-0 w-5 text-right">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={p.prompt}
                  onChange={(e) => updatePrompt(p.id, e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="Enter a tracking prompt..."
                />
                <button
                  onClick={() => removePrompt(p.id)}
                  className="text-gray-700 hover:text-red-400 transition-colors mt-2 shrink-0"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2 mt-3">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-gray-400 hover:text-white text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
