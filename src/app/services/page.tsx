"use client";

import { useEffect, useState } from "react";
import { Service } from "@/lib/schema";
import { Plus, Edit2, Save, X, Trash2, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_META = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle },
  evaluating: { label: "Evaluating", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

function ServiceCard({ service, onUpdate, onDelete }: {
  service: Service;
  onUpdate: (id: number, patch: Partial<Service>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: service.name,
    description: service.description ?? "",
    url: service.url ?? "",
    cost: service.cost ?? "",
    category: service.category ?? "",
    status: service.status,
  });

  async function save() {
    await onUpdate(service.id, {
      ...form,
      description: form.description || null,
      url: form.url || null,
      cost: form.cost || null,
      category: form.category || null,
    });
    setEditing(false);
  }

  const meta = STATUS_META[service.status];
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input className="w-full font-semibold border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          ) : (
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {editing ? (
              <select className="text-xs border rounded-full px-2 py-0.5"
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Service["status"] }))}>
                {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
              </select>
            ) : (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                <Icon size={10} /> {meta.label}
              </span>
            )}
            {service.category && !editing && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{service.category}</span>
            )}
            {service.cost && !editing && (
              <span className="text-xs text-gray-500">💰 {service.cost}</span>
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
              <button onClick={() => onDelete(service.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Cost/month" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            <input className="border rounded-lg px-3 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Category (e.g. Dev Tools, Communication)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
        </div>
      ) : (
        <>
          {service.description && <p className="mt-2 text-sm text-gray-500">{service.description}</p>}
          {service.url && (
            <a href={service.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
              <ExternalLink size={11} /> Visit
            </a>
          )}
        </>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", url: "", cost: "", category: "" });

  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  async function add() {
    if (!form.name.trim()) return;
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        url: form.url || null,
        cost: form.cost || null,
        category: form.category || null,
      }),
    });
    if (res.ok) {
      const s = await res.json();
      setServices(prev => [s, ...prev]);
      setForm({ name: "", description: "", url: "", cost: "", category: "" });
      setShowAdd(false);
    }
  }

  async function update(id: number, patch: Partial<Service>) {
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    }
  }

  async function remove(id: number) {
    if (!confirm("Remove this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
  }

  const grouped = services.reduce((acc, s) => {
    const cat = s.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tools and services we use</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-2"
              placeholder="Service name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Cost (e.g. $20/mo)" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <textarea className="border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 text-sm italic">No services yet.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(s => <ServiceCard key={s.id} service={s} onUpdate={update} onDelete={remove} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
