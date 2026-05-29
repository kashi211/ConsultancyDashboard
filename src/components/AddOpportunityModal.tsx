"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { NewOpportunity } from "@/lib/schema";

const TYPES = [
  { value: "freelance", label: "Freelance" },
  { value: "pitch", label: "Pitch" },
  { value: "job", label: "Job" },
];

interface Props {
  onClose: () => void;
  onAdd: (opp: Omit<NewOpportunity, "id" | "createdAt" | "updatedAt">) => void;
}

export default function AddOpportunityModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    title: "",
    type: "freelance" as "freelance" | "pitch" | "job",
    pitch: "",
    jobLink: "",
    mvpLink: "",
    budget: "",
    deadline: "",
    skills: "",
    author: "",
    assignedTo: "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      title: form.title,
      type: form.type,
      status: "pending",
      pitch: form.pitch || null,
      jobLink: form.jobLink || null,
      mvpLink: form.mvpLink || null,
      budget: form.budget || null,
      deadline: form.deadline || null,
      skills: form.skills || null,
      author: form.author || "Anonymous",
      assignedTo: form.assignedTo || null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">New Opportunity</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Title *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Opportunity title" value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.type} onChange={e => set("type", e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Author</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your name" value={form.author} onChange={e => set("author", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pitch / Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4} placeholder="Describe the opportunity, your pitch, context..." value={form.pitch} onChange={e => set("pitch", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Job Link</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..." value={form.jobLink} onChange={e => set("jobLink", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">MVP Link</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..." value={form.mvpLink} onChange={e => set("mvpLink", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Budget / Rate</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. $5,000 or $80/hr" value={form.budget} onChange={e => set("budget", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Deadline</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. June 30, 2025" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Skills Required</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="React, Node.js, Design" value={form.skills} onChange={e => set("skills", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assign To</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Team member name" value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add Opportunity
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
