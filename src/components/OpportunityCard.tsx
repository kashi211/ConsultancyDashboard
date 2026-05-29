"use client";

import { useState, useEffect } from "react";
import { Opportunity, Comment } from "@/lib/schema";
import CommentThread from "./CommentThread";
import {
  CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp,
  ExternalLink, Edit2, Trash2, Save, X, Briefcase, Zap, Target
} from "lucide-react";

const TYPE_META = {
  freelance: { label: "Freelance", color: "bg-teal-100 text-teal-700", icon: Briefcase },
  pitch: { label: "Pitch", color: "bg-purple-100 text-purple-700", icon: Target },
  job: { label: "Job", color: "bg-blue-100 text-blue-700", icon: Zap },
};

const STATUS_META = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", border: "border-l-yellow-400", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", border: "border-l-green-500", icon: CheckCircle },
  needs_edit: { label: "Needs Edit", color: "bg-red-100 text-red-600", border: "border-l-red-400", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", border: "border-l-blue-500", icon: Clock },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-500", border: "border-l-gray-300", icon: XCircle },
};

const ALL_STATUSES = ["pending", "approved", "needs_edit", "in_progress", "closed"] as const;

interface Props {
  opp: Opportunity;
  onUpdate: (id: number, patch: Partial<Opportunity>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function OpportunityCard({ opp, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [form, setForm] = useState({
    title: opp.title,
    pitch: opp.pitch ?? "",
    jobLink: opp.jobLink ?? "",
    mvpLink: opp.mvpLink ?? "",
    budget: opp.budget ?? "",
    deadline: opp.deadline ?? "",
    skills: opp.skills ?? "",
  });

  const typeMeta = TYPE_META[opp.type];
  const statusMeta = STATUS_META[opp.status];
  const TypeIcon = typeMeta.icon;
  const StatusIcon = statusMeta.icon;

  useEffect(() => {
    if (expanded && !commentsLoaded) {
      fetch(`/api/opportunities/${opp.id}/comments`)
        .then(r => r.json())
        .then(data => { setComments(data); setCommentsLoaded(true); })
        .catch(() => setCommentsLoaded(true));
    }
  }, [expanded, commentsLoaded, opp.id]);

  async function handleSave() {
    await onUpdate(opp.id, {
      ...form,
      pitch: form.pitch || null,
      jobLink: form.jobLink || null,
      mvpLink: form.mvpLink || null,
      budget: form.budget || null,
      deadline: form.deadline || null,
      skills: form.skills || null,
    });
    setEditing(false);
  }

  async function handleNewComment(content: string, author: string, parentId?: number) {
    const res = await fetch(`/api/opportunities/${opp.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author, parentId: parentId ?? null }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [...prev, c]);
    }
  }

  return (
    <div className={`bg-white rounded-xl border-l-4 ${statusMeta.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                className="w-full text-lg font-semibold border rounded-lg px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeMeta.color}`}>
                <TypeIcon size={11} /> {typeMeta.label}
              </span>
              {editing ? (
                <select
                  className="text-xs border rounded-full px-2 py-0.5 focus:outline-none"
                  defaultValue={opp.status}
                  onChange={e => onUpdate(opp.id, { status: e.target.value as Opportunity["status"] })}
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                  <StatusIcon size={11} /> {statusMeta.label}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            {!editing ? (
              <>
                <button onClick={() => onUpdate(opp.id, { status: "approved" })} title="Approve"
                  className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                  <CheckCircle size={17} />
                </button>
                <button onClick={() => setEditing(true)} title="Edit"
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={17} />
                </button>
                <button onClick={() => onDelete(opp.id)} title="Delete"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={17} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><Save size={17} /></button>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={17} /></button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pitch / Description</label>
              <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4} value={form.pitch} onChange={e => setForm(f => ({ ...f, pitch: e.target.value }))} placeholder="Describe the opportunity..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Link</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.jobLink} onChange={e => setForm(f => ({ ...f, jobLink: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">MVP Link</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.mvpLink} onChange={e => setForm(f => ({ ...f, mvpLink: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget / Rate</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. $5k, $80/hr" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deadline</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} placeholder="e.g. June 30" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Skills</label>
                <input className="w-full mt-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, Node, etc." />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {opp.pitch && <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{opp.pitch}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {opp.jobLink && (
                <a href={opp.jobLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                  <ExternalLink size={11} /> Job listing
                </a>
              )}
              {opp.mvpLink && (
                <a href={opp.mvpLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium">
                  <ExternalLink size={11} /> MVP demo
                </a>
              )}
              {opp.budget && <span className="text-xs text-gray-500 font-medium">💰 {opp.budget}</span>}
              {opp.deadline && <span className="text-xs text-gray-500 font-medium">📅 {opp.deadline}</span>}
            </div>
            {opp.skills && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {opp.skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {!editing && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-indigo-600 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            {expanded ? <><ChevronUp size={13} /> Hide comments</> : <><ChevronDown size={13} /> Comments ({commentsLoaded ? comments.length : "…"})</>}
          </button>
        )}
      </div>

      {expanded && !editing && (
        <div className="px-5 pb-5">
          <CommentThread opportunityId={opp.id} comments={comments} onNewComment={handleNewComment} />
        </div>
      )}
    </div>
  );
}
