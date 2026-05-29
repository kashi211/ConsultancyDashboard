"use client";

import { useEffect, useState, useRef } from "react";
import type { Note } from "@/lib/schema";
import { Plus, Pin, PinOff, Trash2, Search, X } from "lucide-react";

const NOTE_COLORS: { id: string; bg: string; border: string; dot: string }[] = [
  { id: "white",  bg: "bg-white",         border: "border-gray-200",  dot: "bg-gray-300"     },
  { id: "yellow", bg: "bg-yellow-50",     border: "border-yellow-200",dot: "bg-yellow-400"   },
  { id: "blue",   bg: "bg-blue-50",       border: "border-blue-200",  dot: "bg-blue-400"     },
  { id: "green",  bg: "bg-green-50",      border: "border-green-200", dot: "bg-green-500"    },
  { id: "pink",   bg: "bg-pink-50",       border: "border-pink-200",  dot: "bg-pink-400"     },
  { id: "purple", bg: "bg-purple-50",     border: "border-purple-200",dot: "bg-purple-400"   },
  { id: "orange", bg: "bg-orange-50",     border: "border-orange-200",dot: "bg-orange-400"   },
];

function colorMeta(id: string) {
  return NOTE_COLORS.find(c => c.id === id) ?? NOTE_COLORS[0];
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NoteCard({ note, onUpdate, onDelete, onClick, isOpen }: {
  note: Note;
  onUpdate: (id: number, patch: Partial<Note>) => Promise<void>;
  onDelete: (id: number) => void;
  onClick: () => void;
  isOpen: boolean;
}) {
  const c = colorMeta(note.color);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border ${c.bg} ${c.border} shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-2 min-h-[140px]`}
    >
      {/* Pin badge */}
      {note.pinned === 1 && (
        <div className="absolute top-2 right-2 text-amber-400">
          <Pin size={13} />
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 pr-5 leading-snug line-clamp-2">
        {note.title || "Untitled"}
      </p>

      {/* Body preview */}
      {note.content && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 flex-1">
          {note.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-400">{timeAgo(note.updatedAt)}</span>
        {/* Actions shown on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onUpdate(note.id, { pinned: note.pinned === 1 ? 0 : 1 })}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-amber-500 transition-colors"
            title={note.pinned === 1 ? "Unpin" : "Pin"}
          >
            {note.pinned === 1 ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteEditor({ note, onUpdate, onClose }: {
  note: Note;
  onUpdate: (id: number, patch: Partial<Note>) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = colorMeta(color);

  // Auto-save with debounce
  function scheduleAutoSave(newTitle: string, newContent: string, newColor: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await onUpdate(note.id, { title: newTitle, content: newContent, color: newColor });
      setSaving(false);
    }, 600);
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    scheduleAutoSave(v, content, color);
  }

  function handleContentChange(v: string) {
    setContent(v);
    scheduleAutoSave(title, v, color);
  }

  async function handleColorChange(v: string) {
    setColor(v);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    await onUpdate(note.id, { title, content, color: v });
    setSaving(false);
  }

  // Save on close
  function handleClose() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      onUpdate(note.id, { title, content, color });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl ${c.bg} ${c.border} flex flex-col`}
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          {/* Color picker */}
          <div className="flex gap-1.5">
            {NOTE_COLORS.map(nc => (
              <button
                key={nc.id}
                onClick={() => handleColorChange(nc.id)}
                className={`w-4 h-4 rounded-full ${nc.dot} transition-transform ${color === nc.id ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                title={nc.id}
              />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {saving && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-black/10 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          className={`w-full text-xl font-bold text-gray-900 bg-transparent border-none outline-none px-5 py-2 placeholder-gray-300`}
          placeholder="Title"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          autoFocus
        />

        {/* Divider */}
        <div className={`mx-5 border-t ${c.border}`} />

        {/* Content */}
        <textarea
          className="flex-1 bg-transparent border-none outline-none px-5 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none leading-relaxed"
          placeholder="Start writing…"
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          style={{ minHeight: "300px" }}
        />

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center gap-3">
          <span className="text-xs text-gray-400">Last edited {timeAgo(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/notes").then(r => r.json())
      .then(d => { setNotes(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function addNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", content: "", color: "white", pinned: 0 }),
    });
    if (res.ok) {
      const n: Note = await res.json();
      setNotes(prev => [n, ...prev]);
      setOpenId(n.id);
    }
  }

  async function updateNote(id: number, patch: Partial<Note>) {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: Note = await res.json();
      setNotes(prev => {
        const next = prev.map(n => n.id === id ? updated : n);
        // Re-sort: pinned first, then by updatedAt desc
        return next.sort((a, b) => {
          if (b.pinned !== a.pinned) return b.pinned - a.pinned;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    }
  }

  async function deleteNote(id: number) {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (openId === id) setOpenId(null);
    }
  }

  const openNote = notes.find(n => n.id === openId);

  const filtered = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  const pinned = filtered.filter(n => n.pinned === 1);
  const rest = filtered.filter(n => n.pinned !== 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={addNote}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          placeholder="Search notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">Loading…</div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Plus size={28} className="text-indigo-300" />
          </div>
          <p className="text-gray-500 font-medium">No notes yet</p>
          <p className="text-sm text-gray-400 mt-1">Click &quot;New Note&quot; to get started</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">No notes match &quot;{search}&quot;</p>
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={12} className="text-amber-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pinned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map(n => (
                  <NoteCard key={n.id} note={n} onUpdate={updateNote} onDelete={deleteNote}
                    onClick={() => setOpenId(n.id)} isOpen={openId === n.id} />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Other</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rest.map(n => (
                  <NoteCard key={n.id} note={n} onUpdate={updateNote} onDelete={deleteNote}
                    onClick={() => setOpenId(n.id)} isOpen={openId === n.id} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Editor modal */}
      {openNote && (
        <NoteEditor note={openNote} onUpdate={updateNote} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
