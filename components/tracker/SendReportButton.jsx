"use client";

import { useState } from "react";

export default function SendReportButton({ adminKey }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSend() {
    if (!confirm("Send the monthly tracker report to admin email?")) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/tracker/send-report?key=${adminKey}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Report sent (${data.clients} clients)` });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send report" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSend}
        disabled={loading}
        className="text-sm bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-[#2a2a2a] disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Report"}
      </button>
      {message && (
        <span
          className={`text-xs ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
