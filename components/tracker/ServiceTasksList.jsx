"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Loader2, AlertTriangle, Plus } from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", label: "Pending" },
  in_progress: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Completed" },
  blocked: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Blocked" },
};

const NEXT_STATUS = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
  blocked: "in_progress",
};

export default function ServiceTasksList({ clientId, plan }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [clientId]);

  async function fetchTasks() {
    try {
      const res = await fetch(`/api/tracker/tasks?client_id=${clientId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFromTemplate() {
    setCreating(true);
    try {
      const res = await fetch("/api/tracker/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, plan: plan || "starter" }),
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(taskId, currentStatus) {
    const newStatus = NEXT_STATUS[currentStatus] || "pending";
    try {
      const res = await fetch("/api/tracker/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null } : t
          )
        );
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading tasks...
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Service Delivery</h3>
          {tasks.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount}/{tasks.length} tasks completed ({progress}%)
            </p>
          )}
        </div>
        {tasks.length === 0 && (
          <button
            onClick={handleCreateFromTemplate}
            disabled={creating}
            className="flex items-center gap-1.5 text-xs bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Create Tasks
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <>
          {/* Progress bar */}
          <div className="w-full bg-[#1f1f1f] rounded-full h-1.5 mb-4">
            <div
              className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-2">
            {tasks.map((task) => {
              const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
              const Icon = config.icon;
              return (
                <div key={task.id} className="flex items-start gap-3 py-2 border-b border-[#1f1f1f] last:border-0">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md ${config.bg} border ${config.border} flex items-center justify-center transition-colors hover:opacity-80`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${config.color} ${task.status === "in_progress" ? "animate-spin" : ""}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === "completed" ? "text-gray-500 line-through" : "text-gray-300"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 text-xs ${config.color} ${config.bg} border ${config.border} px-2 py-0.5 rounded`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tasks.length === 0 && !creating && (
        <p className="text-gray-500 text-sm">No service tasks yet. Click &quot;Create Tasks&quot; to generate the delivery checklist.</p>
      )}
    </div>
  );
}
