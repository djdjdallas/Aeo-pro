"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackerClientActions({ clientId, adminKey }) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  async function handleRun() {
    setRunning(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/tracker/run?key=${adminKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");

      const summary = data.summary?.[0];
      setMessage(
        `Run complete — ${summary?.mentioned || 0} of ${summary?.checked || 0} prompts triggered a mention`
      );

      // Refresh the page data
      router.refresh();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRun}
        disabled={running}
        className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        {running ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running checks...
          </>
        ) : (
          "Run Now"
        )}
      </button>

      {message && (
        <p className={`text-xs ${message.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
