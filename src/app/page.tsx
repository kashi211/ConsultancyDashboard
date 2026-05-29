"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Target as TargetIcon, Wrench, FolderOpen, Edit2, Save, X, Plus,
  Trash2, ChevronDown, ChevronUp, CheckCircle, Clock, PauseCircle, GripVertical,
} from "lucide-react";
import type { Target, TargetComment } from "@/lib/schema";

const STATUS_META = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: Clock },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  paused: { label: "Paused", color: "bg-gray-100 text-gray-500", icon: PauseCircle },
};

const NAV_TILES = [
  { href: "/pitches", label: "Pitches", desc: "Freelance, job & pitch opportunities", icon: TargetIcon, color: "from-indigo-500 to-purple-600" },
  { href: "/services", label: "Services", desc: "Tools and services we use", icon: Wrench, color: "from-teal-500 to-cyan-600" },
  { href: "/portfolio", label: "Portfolio", desc: "Work we've shipped", icon: FolderOpen, color: "from-orange-500 to-pink-600" },
];

function SortableTargetCard({ target, onUpdate, onDelete }: {
  target: Target;
  onUpdate: (id: number, patch: Partial<Target>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: target.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<TargetComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [form, setForm] = useState({
    title: target.title,
    description: target.description ?? "",
    duration: target.duration ?? "",
    status: target.status,
  });

  useEffect(() => {
    if (expanded && !loaded) {
      fetch(`/api/targets/${target.id}/comments`)
        .then(r => r.json())
        .then(d => { setComments(d); setLoaded(true); });
    }
  }, [expanded, loaded, target.id]);

  async function save() {
    await onUpdate(target.id, {
      ...form,
      description: form.description || null,
      duration: form.duration || null,
    });
    setEditing(false);
  }

  async function postComment() {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/targets/${target.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText, author: commentAuthor || "Anonymous" }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [...prev, c]);
      setCommentText("");
    }
  }

  const meta = STATUS_META[target.status];
  const StatusIcon = meta.icon;

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          >
            <GripVertical size={16} />
          </button>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                className="w-full font-semibold border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            ) : (
              <h3 className="font-semibold text-gray-900">{target.title}</h3>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {editing ? (
                <select
                  className="text-xs border rounded-full px-2 py-0.5 focus:outline-none"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Target["status"] }))}
                >
                  {Object.entries(STATUS_META).map(([v, m]) => (
                    <option key={v} value={v}>{m.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                  <StatusIcon size={10} /> {meta.label}
                </span>
              )}
              {target.duration && !editing && (
                <span className="text-xs text-gray-400">⏱ {target.duration}</span>
              )}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            {editing ? (
              <>
                <button onClick={save} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><Save size={15} /></button>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={15} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                <button onClick={() => onDelete(target.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-3 ml-7 space-y-2">
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Duration (e.g. Q3 2025, 3 months)"
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            />
          </div>
        ) : (
          target.description && (
            <p className="mt-2 ml-7 text-sm text-gray-500 leading-relaxed">{target.description}</p>
          )
        )}

        {!editing && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 ml-7 flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 py-0.5 transition-colors"
          >
            {expanded
              ? <><ChevronUp size={12} /> Hide progress</>
              : <><ChevronDown size={12} /> Progress ({loaded ? comments.length : "…"})</>}
          </button>
        )}
      </div>

      {expanded && !editing && (
        <div className="border-t bg-gray-50 p-4 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                {c.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-medium text-gray-700">{c.author}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="space-y-2 pt-1">
            <input
              className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your name"
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Add a progress update..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && postComment()}
              />
              <button
                onClick={postComment}
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [mission, setMission] = useState("");
  const [editingMission, setEditingMission] = useState(false);
  const [missionDraft, setMissionDraft] = useState("");
  const [targets, setTargets] = useState<Target[]>([]);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTarget, setNewTarget] = useState({ title: "", description: "", duration: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetch("/api/mission").then(r => r.json()).then(d => { setMission(d.content); setMissionDraft(d.content); });
    fetch("/api/targets").then(r => r.json()).then(d => setTargets(Array.isArray(d) ? d : []));
  }, []);

  async function saveMission() {
    const res = await fetch("/api/mission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: missionDraft }),
    });
    if (res.ok) { setMission(missionDraft); setEditingMission(false); }
  }

  async function addTarget() {
    if (!newTarget.title.trim()) return;
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTarget.title,
        description: newTarget.description || null,
        duration: newTarget.duration || null,
        position: targets.length,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTargets(prev => [...prev, t]);
      setNewTarget({ title: "", description: "", duration: "" });
      setShowAddTarget(false);
    }
  }

  async function updateTarget(id: number, patch: Partial<Target>) {
    const res = await fetch(`/api/targets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setTargets(prev => prev.map(t => t.id === id ? updated : t));
    }
  }

  async function deleteTarget(id: number) {
    if (!confirm("Delete this target?")) return;
    const res = await fetch(`/api/targets/${id}`, { method: "DELETE" });
    if (res.ok) setTargets(prev => prev.filter(t => t.id !== id));
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTargets(prev => {
      const oldIndex = prev.findIndex(t => t.id === active.id);
      const newIndex = prev.findIndex(t => t.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      // Persist to DB
      fetch("/api/targets/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map(t => t.id) }),
      });

      return reordered;
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Mission */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Mission</h2>
          {!editingMission && (
            <button
              onClick={() => setEditingMission(true)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Edit2 size={13} /> Edit
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          {editingMission ? (
            <div className="space-y-3">
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                rows={5}
                value={missionDraft}
                onChange={e => setMissionDraft(e.target.value)}
                placeholder="Write your mission statement..."
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={saveMission}
                  className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  <Save size={13} /> Save
                </button>
                <button onClick={() => { setEditingMission(false); setMissionDraft(mission); }}
                  className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : mission ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mission}</p>
          ) : (
            <p className="text-gray-400 italic text-sm">No mission set yet. Click Edit to add one.</p>
          )}
        </div>
      </section>

      {/* Targets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Targets</h2>
            <p className="text-xs text-gray-400 mt-0.5">Drag to reorder</p>
          </div>
          <button
            onClick={() => setShowAddTarget(s => !s)}
            className="flex items-center gap-1 text-sm text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-indigo-200 transition-colors"
          >
            <Plus size={14} /> Add Target
          </button>
        </div>

        {showAddTarget && (
          <div className="bg-white rounded-xl border shadow-sm p-4 mb-4 space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Target title *"
              value={newTarget.title}
              onChange={e => setNewTarget(f => ({ ...f, title: e.target.value }))}
              autoFocus
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Description (optional)"
              value={newTarget.description}
              onChange={e => setNewTarget(f => ({ ...f, description: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Duration (e.g. Q3 2025, 6 weeks)"
              value={newTarget.duration}
              onChange={e => setNewTarget(f => ({ ...f, duration: e.target.value }))}
            />
            <div className="flex gap-2">
              <button onClick={addTarget} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
              <button onClick={() => setShowAddTarget(false)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {targets.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No targets yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={targets.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {targets.map(t => (
                  <SortableTargetCard key={t.id} target={t} onUpdate={updateTarget} onDelete={deleteTarget} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Navigation tiles */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Workspace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NAV_TILES.map(({ href, label, desc, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${color}`} />
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{label}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
