"use client";

import { useEffect, useState, useCallback } from "react";
import { AgentLog } from "@/lib/schema";
import { RefreshCw, Bot, CheckCircle2, AlertCircle, Info, XCircle, Trash2 } from "lucide-react";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  info:    { label: "Info",    color: "bg-blue-50 text-blue-700 border-blue-200",   icon: <Info size={12} /> },
  success: { label: "Success", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 size={12} /> },
  warning: { label: "Warning", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertCircle size={12} /> },
  error:   { label: "Error",   color: "bg-red-50 text-red-700 border-red-200",       icon: <XCircle size={12} /> },
};

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function groupByDay(logs: AgentLog[]): [string, AgentLog[]][] {
  const map = new Map<string, AgentLog[]>();
  for (const log of logs) {
    const key = new Date(log.createdAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  }
  return Array.from(map.entries());
}

function LogRow({ log }: { log: AgentLog }) {
  const meta = STATUS_META[log.status] ?? STATUS_META.info;
  const time = new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">{log.action}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-medium ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
          <span className="text-xs text-gray-400 font-mono ml-auto shrink-0">{time}</span>
        </div>
        {log.agent && log.agent !== "claude" && (
          <p className="text-xs text-gray-500 mt-0.5">Agent: {log.agent}</p>
        )}
        {log.details && (
          <p className="text-xs text-gray-500 mt-1 font-mono whitespace-pre-wrap break-all leading-relaxed bg-gray-50 rounded px-2 py-1.5">
            {log.details}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AgentLogsPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent-logs");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = statusFilter === "all" ? logs : logs.filter(l => l.status === statusFilter);
  const grouped = groupByDay(filtered);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Actions taken by Claude agents — last 5 days</p>
        </div>
        <button onClick={fetchLogs}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: logs.length, color: "text-gray-700" },
          { label: "Success", value: logs.filter(l => l.status === "success").length, color: "text-green-600" },
          { label: "Errors", value: logs.filter(l => l.status === "error").length, color: "text-red-600" },
          { label: "Warnings", value: logs.filter(l => l.status === "warning").length, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-3 shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "info", "success", "warning", "error"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400 text-sm">Loading logs...</div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <Trash2 size={24} className="opacity-40" />
          <p className="text-sm">No logs found in the last 5 days.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, dayLogs]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {dayLabel(dayLogs[0].createdAt.toString())}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{dayLogs.length}</span>
              </div>
              <div className="bg-white rounded-xl border shadow-sm px-4">
                {dayLogs.map(log => <LogRow key={log.id} log={log} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
