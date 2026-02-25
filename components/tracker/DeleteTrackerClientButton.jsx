"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTrackerClientButton({ clientId, businessName }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/tracker/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      router.refresh();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs bg-[#1f1f1f] hover:bg-red-500/20 text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
      title={`Delete ${businessName}`}
    >
      Delete
    </button>
  );
}
