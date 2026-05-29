"use client";

import { useEffect, useState, useCallback } from "react";
import { Item } from "@/lib/schema";
import ItemCard from "@/components/ItemCard";
import AddItemModal from "@/components/AddItemModal";
import { Plus, LayoutDashboard, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "pitch", label: "Pitches" },
  { value: "mvp_link", label: "MVP Links" },
  { value: "pdf_pitch", label: "PDF Pitches" },
  { value: "job_suggestion", label: "Job Suggestions" },
  { value: "freelance", label: "Freelance" },
  { value: "coworker_suggestion", label: "Coworker Suggestions" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "needs_edit", label: "Needs Edit" },
];

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeCategory !== "all" ? `/api/items?category=${activeCategory}` : "/api/items";
      const res = await fetch(url);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleAdd(newItem: any) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (res.ok) fetchItems();
  }

  async function handleUpdate(id: number, patch: Partial<Item>) {
    const res = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  }

  const filtered = items.filter(item => {
    const matchStatus = activeStatus === "all" || item.status === activeStatus;
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    pending: items.filter(i => i.status === "pending").length,
    approved: items.filter(i => i.status === "approved").length,
    needs_edit: items.filter(i => i.status === "needs_edit").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Consultancy Dashboard</h1>
              <p className="text-xs text-gray-500">Pitches, suggestions & opportunities</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
            <p className="text-sm text-gray-500 mt-0.5">Pending review</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
            <p className="text-sm text-gray-500 mt-0.5">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-red-500">{counts.needs_edit}</p>
            <p className="text-sm text-gray-500 mt-0.5">Needs edit</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value}
                  onClick={() => setActiveCategory(c.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === c.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              {STATUSES.map(s => (
                <button key={s.value}
                  onClick={() => setActiveStatus(s.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeStatus === s.value
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by title, description, or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
            <LayoutDashboard size={40} className="opacity-30" />
            <p className="text-sm">No items found. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddItemModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
