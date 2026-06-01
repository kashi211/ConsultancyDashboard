"use client";

import { useState, useEffect } from "react";
import { Opportunity, Comment } from "@/lib/schema";
import CommentThread from "./CommentThread";
import {
  CheckCircle, CheckCircle2, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp,
  ExternalLink, Edit2, Trash2, Save, X, Briefcase, Zap, Target, Circle, Rocket,
} from "lucide-react";

const TYPE_META = {
  freelance: { label: "Freelance", color: "bg-teal-100 text-teal-700",   icon: Briefcase },
  pitch:     { label: "Pitch",     color: "bg-purple-100 text-purple-700", icon: Target    },
  job:       { label: "Job",       color: "bg-blue-100 text-blue-700",    icon: Zap       },
};

// Two-stage pipeline stages
// Stage 1: pitch review  →  pending | needs_edit | pitch_approved
// Stage 2: MVP review    →  mvp_submitted | approved
// Side exits: in_progress (working), closed (dead)
const STATUS_META: Record<string, { label: string; color: string; border: string; icon: React.ElementType }> = {
  pending:        { label: "Pitch Pending",   color: "bg-yellow-100 text-yellow-700", border: "border-l-yellow-400", icon: Clock         },
  needs_edit:     { label: "Needs Edit",      color: "bg-red-100 text-red-600",       border: "border-l-red-400",    icon: AlertCircle   },
  pitch_approved: { label: "Pitch Approved",  color: "bg-indigo-100 text-indigo-700", border: "border-l-indigo-500", icon: CheckCircle   },
  mvp_submitted:  { label: "MVP Submitted",   color: "bg-purple-100 text-purple-700", border: "border-l-purple-500", icon: Rocket        },
  approved:       { label: "Fully Approved",  color: "bg-green-100 text-green-700",   border: "border-l-green-500",  icon: CheckCircle2  },
  in_progress:    { label: "In Progress",     color: "bg-blue-100 text-blue-700",     border: "border-l-blue-500",   icon: Clock         },
  closed:         { label: "Closed",          color: "bg-gray-100 text-gray-500",     border: "border-l-gray-300",   icon: XCircle       },
};

// Ordered pipeline steps for the progress track
const PIPELINE = [
  { key: "pending",        label: "Pitch\nPending"  },
  { key: "pitch_approved", label: "Pitch\nApproved" },
  { key: "mvp_submitted",  label: "MVP\nSubmitted"  },
  { key: "approved",       label: "Fully\nApproved" },
] as const;

const PIPELINE_KEYS = PIPELINE.map(p => p.key);
type PipelineStatus = typeof PIPELINE_KEYS[number];

function isPipelineStatus(s: string): s is PipelineStatus {
  return PIPELINE_KEYS.includes(s as PipelineStatus);
}

function PipelineTrack({ status, onStageClick }: {
  status: string;
  onStageClick: (newStatus: Opportunity["status"]) => void;
}) {
  const currentIdx = PIPELINE_KEYS.indexOf(status as PipelineStatus);
  // Only show track for pipeline statuses
  if (currentIdx === -1) return null;

  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {PIPELINE.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const reachable = i === currentIdx + 1; // next allowed step
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                disabled={!reachable}
                onClick={() => reachable && onStageClick(step.key as Opportunity["status"])}
                title={reachable ? `Advance to "${step.label.replace("\n", " ")}"` : undefined}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                  ${done    ? "bg-indigo-600 text-white"                              : ""}
                  ${active  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"       : ""}
                  ${reachable ? "bg-white border-2 border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 cursor-pointer" : ""}
                  ${!done && !active && !reachable ? "bg-white border-2 border-gray-200 text-gray-300 cursor-default" : ""}
                `}
              >
                {done || active ? <CheckCircle2 size={14} /> : <Circle size={10} />}
              </button>
              <span className={`text-center leading-tight whitespace-pre text-[9px] font-medium
                ${active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {/* Connector (not after last) */}
            {i < PIPELINE.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentIdx ? "bg-indigo-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  opp: Opportunity;
  onUpdate: (id: number, patch: Partial<Opportunity>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function OpportunityCard({ opp, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pitchExpanded, setPitchExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showMvpInput, setShowMvpInput] = useState(false);
  const [mvpDraft, setMvpDraft] = useState(opp.mvpLink ?? "");
  const [form, setForm] = useState({
    title:    opp.title,
    pitch:    opp.pitch    ?? "",
    jobLink:  opp.jobLink  ?? "",
    mvpLink:  opp.mvpLink  ?? "",
    budget:   opp.budget   ?? "",
    deadline: opp.deadline ?? "",
    skills:   opp.skills   ?? "",
    status:   opp.status,
    type:     opp.type,
  });

  const typeMeta   = TYPE_META[opp.type];
  const statusMeta = STATUS_META[opp.status] ?? STATUS_META["pending"];
  const TypeIcon   = typeMeta.icon;
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
      pitch:    form.pitch    || null,
      jobLink:  form.jobLink  || null,
      mvpLink:  form.mvpLink  || null,
      budget:   form.budget   || null,
      deadline: form.deadline || null,
      skills:   form.skills   || null,
    });
    setEditing(false);
  }

  // Advance pipeline: pitch pending → pitch_approved, etc.
  async function advanceTo(newStatus: Opportunity["status"]) {
    await onUpdate(opp.id, { status: newStatus });
  }

  // Submit MVP link and move to mvp_submitted
  async function submitMvp() {
    if (!mvpDraft.trim()) return;
    await onUpdate(opp.id, { mvpLink: mvpDraft, status: "mvp_submitted" });
    setShowMvpInput(false);
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

  // Contextual action buttons based on current pipeline stage
  function StageActions() {
    if (editing) return null;
    if (opp.status === "pending") {
      return (
        <button
          onClick={() => advanceTo("pitch_approved")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
        >
          <CheckCircle size={13} /> Approve Pitch
        </button>
      );
    }
    if (opp.status === "pitch_approved") {
      return showMvpInput ? (
        <div className="flex items-center gap-2 w-full">
          <input
            className="flex-1 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Paste MVP / demo link…"
            value={mvpDraft}
            onChange={e => setMvpDraft(e.target.value)}
            autoFocus
          />
          <button onClick={submitMvp}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors">
            Submit
          </button>
          <button onClick={() => setShowMvpInput(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={13} /></button>
        </div>
      ) : (
        <button
          onClick={() => setShowMvpInput(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
        >
          <Rocket size={13} /> Submit MVP Link
        </button>
      );
    }
    if (opp.status === "mvp_submitted") {
      return (
        <button
          onClick={() => advanceTo("approved")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
        >
          <CheckCircle2 size={13} /> Approve MVP
        </button>
      );
    }
    return null;
  }

  return (
    <div className={`bg-white rounded-xl border-l-4 ${statusMeta.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-5">
        {/* Title row */}
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
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Opportunity["status"] }))}
                >
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                  <StatusIcon size={11} /> {statusMeta.label}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><Save size={17} /></button>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={17} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} title="Edit"
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={17} />
                </button>
                <button onClick={() => onDelete(opp.id)} title="Delete"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={17} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Pipeline progress track (only for pipeline statuses) */}
        {!editing && isPipelineStatus(opp.status) && (
          <PipelineTrack status={opp.status} onStageClick={advanceTo} />
        )}

        {/* Edit form */}
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
            {opp.pitch && (
              <div>
                <p className={`text-sm text-gray-600 leading-relaxed ${pitchExpanded ? "" : "line-clamp-3"}`}>
                  {opp.pitch}
                </p>
                {opp.pitch.length > 180 && (
                  <button
                    onClick={() => setPitchExpanded(p => !p)}
                    className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    {pitchExpanded ? "Read less ↑" : "Read more ↓"}
                  </button>
                )}
              </div>
            )}
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

        {/* Stage action buttons */}
        {!editing && (
          <div className="mt-4 flex items-center gap-2">
            <StageActions />
            {/* Needs edit / close quick actions for non-terminal states */}
            {!["approved", "closed"].includes(opp.status) && (
              <div className="ml-auto flex gap-1.5">
                {opp.status !== "needs_edit" && (
                  <button onClick={() => advanceTo("needs_edit")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors">
                    <AlertCircle size={11} /> Needs Edit
                  </button>
                )}
                <button onClick={() => advanceTo("closed")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-xs font-medium transition-colors">
                  <XCircle size={11} /> Close
                </button>
              </div>
            )}
          </div>
        )}

        {!editing && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-indigo-600 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            {expanded
              ? <><ChevronUp size={13} /> Hide comments</>
              : <><ChevronDown size={13} /> Comments ({commentsLoaded ? comments.length : "…"})</>}
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
