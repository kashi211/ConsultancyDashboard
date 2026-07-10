"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Idea } from "@/lib/schema";
import {
  Plus, Pin, PinOff, Trash2, Search, X, Tag,
  Lightbulb, Maximize2, Minimize2, ChevronDown,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const COLORS = [
  { id: "white",  bg: "bg-white",       border: "border-gray-200",   dot: "bg-gray-300"    },
  { id: "yellow", bg: "bg-yellow-50",   border: "border-yellow-200", dot: "bg-yellow-400"  },
  { id: "blue",   bg: "bg-blue-50",     border: "border-blue-200",   dot: "bg-blue-400"    },
  { id: "green",  bg: "bg-green-50",    border: "border-green-200",  dot: "bg-green-500"   },
  { id: "pink",   bg: "bg-pink-50",     border: "border-pink-200",   dot: "bg-pink-400"    },
  { id: "purple", bg: "bg-purple-50",   border: "border-purple-200", dot: "bg-purple-400"  },
  { id: "orange", bg: "bg-orange-50",   border: "border-orange-200", dot: "bg-orange-400"  },
];

const STATUSES = [
  { id: "idea",        label: "Idea",        color: "bg-gray-100 text-gray-600"   },
  { id: "exploring",   label: "Exploring",   color: "bg-blue-100 text-blue-700"   },
  { id: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { id: "done",        label: "Done",        color: "bg-green-100 text-green-700" },
  { id: "shelved",     label: "Shelved",     color: "bg-red-100 text-red-600"     },
];

const PRIORITIES = [
  { id: "low",    label: "Low",    color: "text-gray-400" },
  { id: "medium", label: "Medium", color: "text-amber-500" },
  { id: "high",   label: "High",   color: "text-red-500"  },
];

function colorMeta(id: string) { return COLORS.find(c => c.id === id) ?? COLORS[0]; }
function statusMeta(id: string) { return STATUSES.find(s => s.id === id) ?? STATUSES[0]; }
function priorityMeta(id: string) { return PRIORITIES.find(p => p.id === id) ?? PRIORITIES[1]; }

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── IdeaCard ───────────────────────────────────────────────────────────────

function IdeaCard({ idea, onUpdate, onDelete, onClick }: {
  idea: Idea;
  onUpdate: (id: number, patch: Partial<Idea>) => Promise<void>;
  onDelete: (id: number) => void;
  onClick: () => void;
}) {
  const c = colorMeta(idea.color);
  const s = statusMeta(idea.status);
  const p = priorityMeta(idea.priority);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border ${c.bg} ${c.border} shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-2 min-h-[160px]`}
    >
      {idea.pinned === 1 && (
        <div className="absolute top-2 right-2 text-amber-400"><Pin size={13} /></div>
      )}

      {/* Status + priority row */}
      <div className="flex items-center gap-2 flex-wrap pr-5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
        <span className={`text-xs font-medium ${p.color}`}>● {p.label}</span>
        {idea.category && idea.category !== "general" && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{idea.category}</span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
        {idea.title || "Untitled Idea"}
      </p>

      {/* Body preview */}
      {idea.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{idea.description}</p>
      )}

      {/* Tags */}
      {idea.tags && (
        <div className="flex flex-wrap gap-1 mt-1">
          {idea.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
            <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">#{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-400">{timeAgo(idea.updatedAt)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onUpdate(idea.id, { pinned: idea.pinned === 1 ? 0 : 1 })}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-amber-500 transition-colors"
            title={idea.pinned === 1 ? "Unpin" : "Pin"}
          >
            {idea.pinned === 1 ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── IdeaEditor ─────────────────────────────────────────────────────────────

function IdeaEditor({ idea, onUpdate, onClose }: {
  idea: Idea;
  onUpdate: (id: number, patch: Partial<Idea>) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle]           = useState(idea.title);
  const [description, setDesc]      = useState(idea.description);
  const [category, setCategory]     = useState(idea.category);
  const [status, setStatus]         = useState(idea.status);
  const [priority, setPriority]     = useState(idea.priority);
  const [color, setColor]           = useState(idea.color);
  const [tags, setTags]             = useState(idea.tags ?? "");
  const [saving, setSaving]         = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = colorMeta(color);

  function schedule(patch: Partial<Idea>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await onUpdate(idea.id, patch);
      setSaving(false);
    }, 600);
  }

  function handleClose() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      onUpdate(idea.id, { title, description, category, status, priority, color, tags });
    }
    onClose();
  }

  async function immediateUpdate(patch: Partial<Idea>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    await onUpdate(idea.id, patch);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={!fullscreen ? handleClose : undefined}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={`relative flex flex-col border shadow-2xl ${c.bg} ${c.border} transition-all duration-200 ${
          fullscreen ? "w-full h-full rounded-none" : "w-full max-w-2xl rounded-2xl"
        }`}
        style={fullscreen ? undefined : { maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-wrap">
          {/* Color dots */}
          <div className="flex gap-1.5">
            {COLORS.map(nc => (
              <button key={nc.id} title={nc.id}
                onClick={() => { setColor(nc.id); immediateUpdate({ title, description, category, status, priority, color: nc.id, tags }); }}
                className={`w-4 h-4 rounded-full ${nc.dot} transition-transform ${color === nc.id ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
              />
            ))}
          </div>

          {/* Status picker */}
          <div className="relative ml-2">
            <select
              className="text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              value={status}
              onChange={e => { setStatus(e.target.value); immediateUpdate({ title, description, category, status: e.target.value, priority, color, tags }); }}
            >
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Priority picker */}
          <select
            className="text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            value={priority}
            onChange={e => { setPriority(e.target.value); immediateUpdate({ title, description, category, status, priority: e.target.value, color, tags }); }}
          >
            {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label} priority</option>)}
          </select>

          <div className="ml-auto flex items-center gap-2">
            {saving && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
            <button onClick={() => setFullscreen(f => !f)}
              className="p-1.5 rounded-lg hover:bg-black/10 text-gray-400 hover:text-gray-700 transition-colors"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-black/10 text-gray-400 hover:text-gray-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Category + tags row */}
        <div className="flex items-center gap-2 px-4 pb-2 flex-wrap">
          <input
            className="text-xs border rounded-lg px-2 py-1 bg-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-32"
            placeholder="Category…"
            value={category}
            onChange={e => { setCategory(e.target.value); schedule({ title, description, category: e.target.value, status, priority, color, tags }); }}
          />
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Tag size={11} className="text-gray-400 shrink-0" />
            <input
              className="text-xs border rounded-lg px-2 py-1 bg-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-400 flex-1"
              placeholder="Tags (comma-separated)…"
              value={tags}
              onChange={e => { setTags(e.target.value); schedule({ title, description, category, status, priority, color, tags: e.target.value }); }}
            />
          </div>
        </div>

        <div className={`mx-4 border-t ${c.border}`} />

        {/* Title */}
        <input
          className="w-full text-xl font-bold text-gray-900 bg-transparent border-none outline-none px-4 py-3 placeholder-gray-300"
          placeholder="Idea title…"
          value={title}
          autoFocus
          onChange={e => { setTitle(e.target.value); schedule({ title: e.target.value, description, category, status, priority, color, tags }); }}
        />

        <div className={`mx-4 border-t ${c.border}`} />

        {/* Description */}
        <textarea
          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none leading-relaxed"
          placeholder="Describe the idea…"
          value={description}
          style={fullscreen ? undefined : { minHeight: "280px" }}
          onChange={e => { setDesc(e.target.value); schedule({ title, description: e.target.value, category, status, priority, color, tags }); }}
        />

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t ${c.border} flex items-center`}>
          <span className="text-xs text-gray-400">Last edited {timeAgo(idea.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const [ideas, setIdeas]           = useState<Idea[]>([]);
  const [loading, setLoading]       = useState(true);
  const [openId, setOpenId]         = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      setIdeas(Array.isArray(data) ? data : []);
    } catch { setIdeas([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function addIdea() {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", description: "", category: "general", status: "idea", priority: "medium", color: "white", pinned: 0 }),
    });
    if (res.ok) {
      const n: Idea = await res.json();
      setIdeas(prev => [n, ...prev]);
      setOpenId(n.id);
    }
  }

  async function updateIdea(id: number, patch: Partial<Idea>) {
    const res = await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: Idea = await res.json();
      setIdeas(prev => prev
        .map(n => n.id === id ? updated : n)
        .sort((a, b) => {
          if (b.pinned !== a.pinned) return b.pinned - a.pinned;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
      );
    }
  }

  async function deleteIdea(id: number) {
    if (!confirm("Delete this idea?")) return;
    const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIdeas(prev => prev.filter(n => n.id !== id));
      if (openId === id) setOpenId(null);
    }
  }

  // Derived categories for filter
  const categories = ["all", ...Array.from(new Set(ideas.map(i => i.category).filter(Boolean)))];

  const filtered = ideas.filter(i => {
    const matchStatus   = filterStatus === "all" || i.status === filterStatus;
    const matchCat      = filterCategory === "all" || i.category === filterCategory;
    const matchSearch   = !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
                          i.description.toLowerCase().includes(search.toLowerCase()) ||
                          (i.tags ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const pinned = filtered.filter(i => i.pinned === 1);
  const rest   = filtered.filter(i => i.pinned !== 1);
  const openIdea = ideas.find(i => i.id === openId);

  const counts = {
    total:       ideas.length,
    exploring:   ideas.filter(i => i.status === "exploring").length,
    in_progress: ideas.filter(i => i.status === "in_progress").length,
    done:        ideas.filter(i => i.status === "done").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={addIdea}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> New Idea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",       value: counts.total,       color: "text-gray-700" },
          { label: "Exploring",   value: counts.exploring,   color: "text-blue-600" },
          { label: "In Progress", value: counts.in_progress, color: "text-amber-600" },
          { label: "Done",        value: counts.done,        color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-3 shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Search ideas, descriptions, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Status</span>
          {["all", ...STATUSES.map(s => s.id)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                filterStatus === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {s === "all" ? "All" : STATUSES.find(x => x.id === s)?.label ?? s}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Category</span>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  filterCategory === c ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">Loading…</div>
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Lightbulb size={28} className="text-indigo-300" />
          </div>
          <p className="text-gray-500 font-medium">No ideas yet</p>
          <p className="text-sm text-gray-400 mt-1">Click &quot;New Idea&quot; to get started</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16 text-sm">No ideas match your filters</p>
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={12} className="text-amber-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pinned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map(i => (
                  <IdeaCard key={i.id} idea={i} onUpdate={updateIdea} onDelete={deleteIdea} onClick={() => setOpenId(i.id)} />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ideas</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rest.map(i => (
                  <IdeaCard key={i.id} idea={i} onUpdate={updateIdea} onDelete={deleteIdea} onClick={() => setOpenId(i.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {openIdea && (
        <IdeaEditor idea={openIdea} onUpdate={updateIdea} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
