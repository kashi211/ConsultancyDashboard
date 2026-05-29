"use client";

import { useEffect, useState, useCallback } from "react";
import { Opportunity } from "@/lib/schema";
import OpportunityCard from "@/components/OpportunityCard";
import AddOpportunityModal from "@/components/AddOpportunityModal";
import { Plus } from "lucide-react";

const TYPES = [
  { value: "all", label: "All" },
  { value: "freelance", label: "Freelance" },
  { value: "pitch", label: "Pitch" },
  { value: "job", label: "Job" },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
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

  const filtered = opps.filter(o => {
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
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> New
        </button>
      </div>

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
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search by title, pitch, or skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
