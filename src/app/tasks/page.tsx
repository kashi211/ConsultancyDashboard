"use client";

import { useEffect, useState } from "react";
import type { Task, TaskComment } from "@/lib/schema";
import {
  Plus, Edit2, Save, X, Trash2, ChevronDown, ChevronUp,
  Circle, Clock, CheckCircle2, AlertCircle, CornerDownRight,
} from "lucide-react";

const STATUS_META = {
  todo:        { label: "To Do",       color: "bg-gray-100 text-gray-600",   border: "border-l-gray-300",   icon: Circle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700",   border: "border-l-blue-400",   icon: Clock },
  done:        { label: "Done",        color: "bg-green-100 text-green-700", border: "border-l-green-500",  icon: CheckCircle2 },
  blocked:     { label: "Blocked",     color: "bg-red-100 text-red-600",     border: "border-l-red-400",    icon: AlertCircle },
};

const PRIORITY_META = {
  low:    { label: "Low",    color: "text-gray-400 bg-gray-100" },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-100" },
  high:   { label: "High",   color: "text-red-600 bg-red-100" },
};

const STATUS_COLS = [
  { key: "todo",        label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done",        label: "Done" },
  { key: "blocked",     label: "Blocked" },
] as const;

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CommentNode({
  comment, allComments, depth, onReply,
}: {
  comment: TaskComment;
  allComments: TaskComment[];
  depth: number;
  onReply: (parentId: number, content: string, author: string) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const replies = allComments.filter(c => c.parentId === comment.id);

  async function submit() {
    if (!text.trim()) return;
    await onReply(comment.id, text, author || "Anonymous");
    setText(""); setAuthor(""); setReplying(false);
  }

  return (
    <div className={depth > 0 ? "ml-5 border-l-2 border-gray-100 pl-3" : ""}>
      <div className="py-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-800">{comment.author}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed pl-8">{comment.content}</p>
        <button onClick={() => setReplying(r => !r)}
          className="mt-1 ml-8 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
          <CornerDownRight size={11} /> Reply
        </button>
        {replying && (
          <div className="ml-8 mt-2 space-y-2">
            <input className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} />
            <textarea className="w-full border rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={2} placeholder="Write a reply..." value={text} onChange={e => setText(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={submit}
                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">Send</button>
              <button onClick={() => setReplying(false)}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </div>
      {replies.map(r => (
        <CommentNode key={r.id} comment={r} allComments={allComments} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

function TaskCard({
  task, onUpdate, onDelete,
}: {
  task: Task;
  onUpdate: (id: number, patch: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assignee: task.assignee ?? "",
    dueDate: task.dueDate ?? "",
  });

  const statusMeta = STATUS_META[task.status];
  const priorityMeta = PRIORITY_META[task.priority];
  const StatusIcon = statusMeta.icon;

  useEffect(() => {
    if (expanded && !loaded) {
      fetch(`/api/tasks/${task.id}/comments`)
        .then(r => r.json())
        .then(d => { setComments(Array.isArray(d) ? d : []); setLoaded(true); });
    }
  }, [expanded, loaded, task.id]);

  async function save() {
    await onUpdate(task.id, {
      ...form,
      description: form.description || null,
      assignee: form.assignee || null,
      dueDate: form.dueDate || null,
    });
    setEditing(false);
  }

  async function postComment(content: string, author: string, parentId?: number) {
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author, parentId: parentId ?? null }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [...prev, c]);
    }
  }

  async function submitTopComment() {
    if (!commentText.trim()) return;
    await postComment(commentText, commentAuthor || "Anonymous");
    setCommentText("");
  }

  const topLevel = comments.filter(c => !c.parentId);

  return (
    <div className={`bg-white rounded-xl border-l-4 ${statusMeta.border} shadow-sm`}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                className="w-full font-semibold border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            ) : (
              <h3 className={`font-semibold text-gray-900 ${task.status === "done" ? "line-through text-gray-400" : ""}`}>
                {task.title}
              </h3>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {editing ? (
                <>
                  <select className="text-xs border rounded-full px-2 py-0.5"
                    value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Task["status"] }))}>
                    {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                  <select className="text-xs border rounded-full px-2 py-0.5"
                    value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task["priority"] }))}>
                    {Object.entries(PRIORITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                    <StatusIcon size={10} /> {statusMeta.label}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityMeta.color}`}>
                    {priorityMeta.label}
                  </span>
                  {task.assignee && <span className="text-xs text-gray-400">→ {task.assignee}</span>}
                  {task.dueDate && <span className="text-xs text-gray-400">📅 {task.dueDate}</span>}
                </>
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
                <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
              </>
            )}
          </div>
        </div>

        {/* Edit fields */}
        {editing && (
          <div className="mt-3 space-y-2">
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3} placeholder="Description..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Assignee" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
              <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Due date (e.g. June 30)" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Description */}
        {!editing && task.description && (
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">{task.description}</p>
        )}

        {/* Quick status buttons (not editing) */}
        {!editing && task.status !== "done" && (
          <div className="flex gap-2 mt-3">
            {task.status === "todo" && (
              <button onClick={() => onUpdate(task.id, { status: "in_progress" })}
                className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                Start
              </button>
            )}
            {task.status === "in_progress" && (
              <button onClick={() => onUpdate(task.id, { status: "done" })}
                className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                Mark done
              </button>
            )}
            {task.status !== "blocked" && (
              <button onClick={() => onUpdate(task.id, { status: "blocked" })}
                className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                Block
              </button>
            )}
          </div>
        )}

        {/* Comments toggle */}
        {!editing && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            {expanded ? <><ChevronUp size={12} /> Hide thread</> : <><ChevronDown size={12} /> Thread ({loaded ? comments.length : "…"})</>}
          </button>
        )}
      </div>

      {/* Thread */}
      {expanded && !editing && (
        <div className="border-t bg-gray-50/60 px-4 pb-4 pt-3">
          {topLevel.length > 0 && (
            <div className="mb-3 space-y-1">
              {topLevel.map(c => (
                <CommentNode key={c.id} comment={c} allComments={comments} depth={0}
                  onReply={(parentId, content, author) => postComment(content, author, parentId)} />
              ))}
            </div>
          )}
          <div className="space-y-2">
            <input className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your name" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} />
            <div className="flex gap-2">
              <textarea className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                rows={2} placeholder="Add a comment..." value={commentText}
                onChange={e => setCommentText(e.target.value)} />
              <button onClick={submitTopComment} disabled={!commentText.trim()}
                className="px-3 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors self-stretch">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTaskForm({ onAdd, onCancel }: {
  onAdd: (t: Partial<Task>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as Task["priority"], assignee: "", dueDate: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onAdd({ ...form, description: form.description || null, assignee: form.assignee || null, dueDate: form.dueDate || null });
    onCancel();
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
      <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Task title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus required />
      <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={2} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-3 gap-2">
        <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task["priority"] }))}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Assignee" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
        <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Due date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">Add Task</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
      </div>
    </form>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<Task["status"] | "all">("all");

  useEffect(() => {
    fetch("/api/tasks").then(r => r.json())
      .then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function addTask(data: Partial<Task>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks(prev => [t, ...prev]);
    }
  }

  async function updateTask(id: number, patch: Partial<Task>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
  }

  async function deleteTask(id: number) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  // Group by status for board view when showing all
  const columns = filter === "all"
    ? STATUS_COLS.map(col => ({ ...col, tasks: tasks.filter(t => t.status === col.key) }))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track work, thread discussions</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-6">
          <AddTaskForm onAdd={addTask} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {([["all", "All"], ["todo", "To Do"], ["in_progress", "In Progress"], ["done", "Done"], ["blocked", "Blocked"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}>
            {label}
            <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${filter === key ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">Loading...</div>
      ) : columns ? (
        /* Board view (all) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const meta = STATUS_META[col.key];
            const ColIcon = meta.icon;
            return (
              <div key={col.key}>
                <div className={`flex items-center gap-2 mb-3 px-1`}>
                  <ColIcon size={14} className={col.key === "todo" ? "text-gray-400" : col.key === "in_progress" ? "text-blue-500" : col.key === "done" ? "text-green-500" : "text-red-500"} />
                  <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  <span className="ml-auto text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{col.tasks.length}</span>
                </div>
                <div className="space-y-3">
                  {col.tasks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic px-1">Empty</p>
                  ) : col.tasks.map(t => (
                    <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view (filtered) */
        filtered.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No tasks here.</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {filtered.map(t => (
              <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
