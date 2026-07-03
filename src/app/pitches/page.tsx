"use client";

import { useEffect, useState, useCallback } from "react";
import { Opportunity } from "@/lib/schema";
import OpportunityCard from "@/components/OpportunityCard";
import AddOpportunityModal from "@/components/AddOpportunityModal";
import { Plus, ChevronDown, ChevronUp, Edit2, Save, X, ArrowUpDown, Trash2 } from "lucide-react";

function PitchCriteriaNotice() {
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/notices/pitch_criteria")
      .then(r => r.json())
      .then(d => { setContent(d.content ?? ""); setDraft(d.content ?? ""); });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/notices/pitch_criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setContent(draft);
    setSaving(false);
    setEditing(false);
  }

  // Render **bold** markers as bold spans
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={line.startsWith("**") ? "font-semibold text-amber-900 mt-3 first:mt-0" : "text-amber-800"}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <span key={j} className="font-bold">{part.slice(2, -2)}</span>
              : part
          )}
        </p>
      );
    });
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl mb-6 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-lg">📋</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">Job Selection Criteria</p>
          <p className="text-xs text-amber-600">Shared guidelines for picking which jobs to pitch</p>
        </div>
        <div className="flex items-center gap-1">
          {open && !editing && (
            <button onClick={() => { setEditing(true); setDraft(content); }}
              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 hover:text-amber-700 transition-colors">
              <Edit2 size={14} />
            </button>
          )}
          <button onClick={() => setOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-amber-200 px-4 py-4">
          {editing ? (
            <div className="space-y-3">
              <textarea
                className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono resize-none"
                rows={20}
                value={draft}
                onChange={e => setDraft(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                  <Save size={13} /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setDraft(content); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-50 transition-colors">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-0.5 leading-relaxed">
              {renderContent(content)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TYPES = [
  { value: "all", label: "All" },
  { value: "freelance", label: "Freelance" },
  { value: "pitch", label: "Pitch" },
  { value: "job", label: "Job" },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "pitch_approved", label: "Pitch Approved" },
  { value: "pitch_submitted", label: "Pitch Submitted" },
  { value: "mvp_submitted", label: "MVP Submitted" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "needs_edit", label: "Needs Edit" },
  { value: "closed", label: "Closed" },
];

export default function PitchesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "rank">("rank");

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeType !== "all" ? `/api/opportunities?type=${activeType}` : "/api/opportunities";
      const res = await fetch(url);
      const data = await res.json();
      setOpps(Array.isArray(data) ? data : []);
    } catch {
      setOpps([]);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleAdd(opp: any) {
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opp),
    });
    if (res.ok) fetchOpps();
  }

  async function handleUpdate(id: number, patch: Partial<Opportunity>) {
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setOpps(prev => prev.map(o => o.id === id ? updated : o));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this opportunity?")) return;
    const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    if (res.ok) setOpps(prev => prev.filter(o => o.id !== id));
  }

  const sorted = [...opps].sort((a, b) => {
    if (sortBy === "rank") {
      const ar = a.rank ?? 0;
      const br = b.rank ?? 0;
      return br - ar; // highest rank first; unranked goes last
    }
    return 0; // keep server order (newest first)
  });

  const filtered = sorted.filter(o => {
    const matchStatus = activeStatus === "all" || o.status === activeStatus;
    const matchSearch = !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.pitch ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.skills ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    pending: opps.filter(o => o.status === "pending").length,
    approved: opps.filter(o => o.status === "approved").length,
    in_progress: opps.filter(o => o.status === "in_progress").length,
    total: opps.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pitches</h1>
          <p className="text-sm text-gray-500 mt-0.5">Freelance, job & pitch opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!confirm("Delete ALL opportunities? This cannot be undone.")) return;
              const res = await fetch("/api/opportunities", { method: "DELETE" });
              if (res.ok) setOpps([]);
            }}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} /> Delete All Jobs
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {/* Criteria notice */}
      <PitchCriteriaNotice />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: counts.total, color: "text-gray-800" },
          { label: "Pending", value: counts.pending, color: "text-yellow-600" },
          { label: "Approved", value: counts.approved, color: "text-green-600" },
          { label: "In Progress", value: counts.in_progress, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Type</span>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setActiveType(t.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeType === t.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t.label}
            </button>
          ))}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide ml-4 mr-1">Status</span>
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setActiveStatus(s.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeStatus === s.value ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by title, pitch, or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => setSortBy(s => s === "newest" ? "rank" : "newest")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
              sortBy === "rank"
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ArrowUpDown size={14} />
            {sortBy === "rank" ? "By rank" : "Newest first"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <p className="text-sm">No opportunities found. Add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(opp => (
            <OpportunityCard key={opp.id} opp={opp} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && <AddOpportunityModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
