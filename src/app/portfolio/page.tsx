"use client";

import { useEffect, useState } from "react";
import { PortfolioItem } from "@/lib/schema";
import { Plus, Edit2, Save, X, Trash2, ExternalLink, GitBranch } from "lucide-react";

function PortfolioCard({ item, onUpdate, onDelete }: {
  item: PortfolioItem;
  onUpdate: (id: number, patch: Partial<PortfolioItem>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: item.title,
    description: item.description ?? "",
    url: item.url ?? "",
    repoUrl: item.repoUrl ?? "",
    skills: item.skills ?? "",
  });

  async function save() {
    await onUpdate(item.id, {
      ...form,
      description: form.description || null,
      url: form.url || null,
      repoUrl: form.repoUrl || null,
      skills: form.skills || null,
    });
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input className="w-full font-semibold border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          ) : (
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
          )}
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
              <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Live URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Repo URL" value={form.repoUrl} onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))} />
            <input className="border rounded-lg px-3 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>
        </div>
      ) : (
        <>
          {item.description && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.description}</p>}
          <div className="flex gap-3 mt-3">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ExternalLink size={11} /> Live
              </a>
            )}
            {item.repoUrl && (
              <a href={item.repoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline">
                <GitBranch size={11} /> Repo
              </a>
            )}
          </div>
          {item.skills && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "", repoUrl: "", skills: "" });

  useEffect(() => {
    fetch("/api/portfolio").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : []));
  }, []);

  async function add() {
    if (!form.title.trim()) return;
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        url: form.url || null,
        repoUrl: form.repoUrl || null,
        skills: form.skills || null,
      }),
    });
    if (res.ok) {
      const p = await res.json();
      setItems(prev => [p, ...prev]);
      setForm({ title: "", description: "", url: "", repoUrl: "", skills: "" });
      setShowAdd(false);
    }
  }

  async function update(id: number, patch: Partial<PortfolioItem>) {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Work we've shipped</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 space-y-3">
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Project title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Live URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Repo URL" value={form.repoUrl} onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))} />
            <input className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Skills (React, Node.js, ...)" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(i => <PortfolioCard key={i.id} item={i} onUpdate={update} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}
