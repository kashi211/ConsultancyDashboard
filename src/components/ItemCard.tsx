"use client";

import { useState } from "react";
import { Item } from "@/lib/schema";
import { CheckCircle, XCircle, Edit2, Trash2, ExternalLink, Save, X } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  pitch: "Pitch",
  mvp_link: "MVP Link",
  pdf_pitch: "PDF Pitch",
  job_suggestion: "Job Suggestion",
  freelance: "Freelance",
  coworker_suggestion: "Coworker Suggestion",
};

const CATEGORY_COLORS: Record<string, string> = {
  pitch: "bg-purple-100 text-purple-700",
  mvp_link: "bg-blue-100 text-blue-700",
  pdf_pitch: "bg-orange-100 text-orange-700",
  job_suggestion: "bg-green-100 text-green-700",
  freelance: "bg-teal-100 text-teal-700",
  coworker_suggestion: "bg-pink-100 text-pink-700",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "border-l-yellow-400",
  approved: "border-l-green-500",
  needs_edit: "border-l-red-400",
};

interface Props {
  item: Item;
  onUpdate: (id: number, patch: Partial<Item>) => void;
  onDelete: (id: number) => void;
}

export default function ItemCard({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: item.title, description: item.description, url: item.url ?? "", author: item.author });
  const [suggestion, setSuggestion] = useState(item.editSuggestion ?? "");
  const [showSuggest, setShowSuggest] = useState(false);

  function handleSave() {
    onUpdate(item.id, editData);
    setEditing(false);
  }

  function handleSaveSuggestion() {
    onUpdate(item.id, { editSuggestion: suggestion, status: "needs_edit" });
    setShowSuggest(false);
  }

  return (
    <div className={`bg-white rounded-xl border-l-4 ${STATUS_STYLES[item.status]} shadow-sm hover:shadow-md transition-shadow p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              className="w-full text-lg font-semibold border rounded px-2 py-1 mb-2"
              value={editData.title}
              onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              item.status === "approved" ? "bg-green-100 text-green-700" :
              item.status === "needs_edit" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {item.status === "needs_edit" ? "Needs Edit" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
            <span className="text-xs text-gray-400">by {item.author}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {!editing && (
            <>
              <button onClick={() => onUpdate(item.id, { status: "approved" })} title="Approve"
                className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                <CheckCircle size={18} />
              </button>
              <button onClick={() => setShowSuggest(s => !s)} title="Suggest edit"
                className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => setEditing(true)} title="Edit"
                className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                <Edit2 size={18} className="rotate-45" />
              </button>
              <button onClick={() => onDelete(item.id)} title="Delete"
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </>
          )}
          {editing && (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><Save size={18} /></button>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full border rounded px-2 py-1 text-sm resize-none"
            rows={3}
            value={editData.description}
            onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
          />
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="URL (optional)"
            value={editData.url}
            onChange={e => setEditData(d => ({ ...d, url: e.target.value }))}
          />
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Author"
            value={editData.author}
            onChange={e => setEditData(d => ({ ...d, author: e.target.value }))}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.description}</p>
      )}

      {item.url && !editing && (
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
          <ExternalLink size={12} /> View link
        </a>
      )}

      {item.editSuggestion && !showSuggest && (
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs font-medium text-yellow-700 mb-1">Edit suggestion:</p>
          <p className="text-sm text-yellow-800">{item.editSuggestion}</p>
        </div>
      )}

      {showSuggest && (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={3}
            placeholder="Describe the changes needed..."
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSaveSuggestion}
              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition-colors">
              Submit suggestion
            </button>
            <button onClick={() => setShowSuggest(false)}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
