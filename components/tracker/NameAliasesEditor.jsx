"use client";

import { useState } from "react";

export default function NameAliasesEditor({ clientId, initialAliases = [] }) {
  const [input, setInput] = useState(initialAliases.join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const aliases = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/tracker/clients/${clientId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_aliases: aliases }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setMessage(`Saved ${aliases.length} alias${aliases.length === 1 ? "" : "es"}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-white mb-1">Name Aliases</h3>
      <p className="text-xs text-gray-600 mb-3">
        Alternative names, abbreviations, or domain-style variants to match in AI responses. Comma-separated.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="StatementDesk, Statement Desk Inc, statementdesk.com"
          className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
