"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "closed"];
const STATUS_COLORS = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const BUSINESS_TYPES = [
  "All Types",
  "HVAC / Plumbing",
  "Roofing",
  "Dentist",
  "Law Firm",
  "Med Spa",
  "Contractor",
  "Other",
];

export default function AdminLeadsTable({ leads: initialLeads }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState({});

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.business_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    const matchesType =
      typeFilter === "All Types" || lead.business_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  async function updateLead(id, updates) {
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#1f1f1f] text-white rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111111] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6] appearance-none"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#111111] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6] appearance-none"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-3">
        Showing {filtered.length} of {leads.length} leads
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {leads.length === 0
            ? "No leads yet. They'll appear here once someone submits the form."
            : "No leads match your filters."}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[2fr_1.5fr_2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
            <span>Business</span>
            <span>Contact</span>
            <span>Email</span>
            <span>Type</span>
            <span>Spend</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {filtered.map((lead) => (
            <div key={lead.id}>
              {/* Row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === lead.id ? null : lead.id)
                }
                className="w-full grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_2fr_1fr_1fr_1fr_80px] gap-2 lg:gap-4 bg-[#111111] border border-[#1f1f1f] hover:border-[#3b82f6]/30 rounded-xl px-4 py-3 text-left transition-colors items-center"
              >
                <span className="text-sm text-white font-medium truncate">
                  {lead.business_name}
                  {lead.plan && (
                    <span className="ml-2 text-xs text-[#3b82f6]">
                      {lead.plan}
                    </span>
                  )}
                </span>
                <span className="text-sm text-gray-300 truncate">
                  {lead.contact_name}
                </span>
                <span className="text-sm text-gray-400 truncate">
                  {lead.email}
                </span>
                <span className="text-xs text-gray-400 truncate hidden lg:block">
                  {lead.business_type}
                </span>
                <span className="text-xs text-gray-400 hidden lg:block">
                  {lead.marketing_spend}
                </span>
                <span className="hidden lg:block">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}
                  >
                    {lead.status || "new"}
                  </span>
                </span>
                <span className="text-xs text-gray-500 hidden lg:flex items-center gap-1">
                  {formatDate(lead.created_at)}
                  {expandedId === lead.id ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </span>
              </button>

              {/* Expanded detail */}
              {expandedId === lead.id && (
                <ExpandedRow
                  lead={lead}
                  saving={saving[lead.id]}
                  onUpdate={updateLead}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedRow({ lead, saving, onUpdate }) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [status, setStatus] = useState(lead.status || "new");

  return (
    <div className="bg-[#0e0e0e] border border-[#1f1f1f] border-t-0 rounded-b-xl px-4 py-4 -mt-1 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Phone</span>
          <p className="text-gray-300">{lead.phone || "Not provided"}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Location</span>
          <p className="text-gray-300">{lead.location}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Business Type</span>
          <p className="text-gray-300">{lead.business_type}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Marketing Spend</span>
          <p className="text-gray-300">{lead.marketing_spend}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Plan Interest</span>
          <p className="text-gray-300">{lead.plan || "None specified"}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Submitted</span>
          <p className="text-gray-300">
            {new Date(lead.created_at).toLocaleString("en-US")}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status changer */}
        <div className="sm:w-48">
          <label className="text-gray-500 text-xs block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              onUpdate(lead.id, { status: e.target.value });
            }}
            className="w-full bg-[#111111] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6] appearance-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex-1">
          <label className="text-gray-500 text-xs block mb-1">Notes</label>
          <div className="flex gap-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={2}
              className="flex-1 bg-[#111111] border border-[#1f1f1f] text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] resize-none"
            />
            <button
              onClick={() => onUpdate(lead.id, { notes })}
              disabled={saving}
              className="self-end bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
