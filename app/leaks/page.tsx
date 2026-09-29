"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { getLeakEvents } from "@/lib/api";
import type { LeakEvent } from "@/types/database";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Droplets, Filter, Loader2, Database, X, ShieldAlert } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA");
}

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function calcDuration(start: string, end?: string | null) {
  if (!end) return "Ongoing";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  return `${mins} min${mins > 1 ? "s" : ""}`;
}

function EventDetailModal({ event, onClose }: { event: LeakEvent; onClose: () => void }) {
  const isActive = event.status === "ACTIVE";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-slide-down">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-lg"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={20} className={isActive ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"} />
          <h3 className="text-base font-bold text-[var(--foreground)]">Leak Event Details</h3>
        </div>
        <div className="space-y-3 font-mono text-xs">
          {[
            { label: "Event ID", value: event.event_id },
            { label: "Pipeline ID", value: event.pipeline_id || "PIPE-001" },
            { label: "Device ID", value: event.device_id || "ESP32-001" },
            { label: "Start Time", value: new Date(event.start_time).toLocaleString() },
            { label: "End Time", value: event.end_time ? new Date(event.end_time).toLocaleString() : "Active Leak" },
            { label: "Duration", value: calcDuration(event.start_time, event.end_time) },
            { label: "Flow Difference", value: `${Number(event.difference).toFixed(2)} L/min` },
            { label: "Estimated Loss", value: `${Number(event.estimated_loss || 0).toFixed(1)} Liters` },
            { label: "Status", value: isActive ? "ACTIVE LEAK" : "RESOLVED" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--muted)] font-sans font-medium">{item.label}</span>
              <span className={cn("font-bold", item.label === "Status" && (isActive ? "text-red-600 dark:text-red-400 animate-pulse" : "text-emerald-600 dark:text-emerald-400"))}>{item.value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Close Incident View
        </button>
      </div>
    </div>
  );
}

type FilterType = "All" | "Active" | "Resolved";

export default function LeaksPage() {
  const { lastUpdated } = useSimulation();
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedEvent, setSelectedEvent] = useState<LeakEvent | null>(null);
  const [dbEvents, setDbEvents] = useState<LeakEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getLeakEvents();
        setDbEvents(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load leak events");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastUpdated]);

  const stats = useMemo(() => {
    return {
      total: dbEvents.length,
      active: dbEvents.filter((e) => e.status === "ACTIVE").length,
      resolved: dbEvents.filter((e) => e.status === "RESOLVED").length,
      totalLoss: dbEvents.reduce((sum, e) => sum + (Number(e.estimated_loss) || 0), 0),
    };
  }, [dbEvents]);

  const filtered = useMemo(() => {
    return dbEvents.filter((e) => {
      if (filter === "All") return true;
      if (filter === "Active") return e.status === "ACTIVE";
      if (filter === "Resolved") return e.status === "RESOLVED";
      return true;
    });
  }, [dbEvents, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Leak Events</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">Pipeline leakage history and detected events</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL EVENTS", value: stats.total, icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900" },
          { label: "ACTIVE LEAKS", value: stats.active, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50/50 dark:bg-red-950/40 border-red-200 dark:border-red-900" },
          { label: "RESOLVED LEAKS", value: stats.resolved, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900" },
          { label: "ESTIMATED WATER LOSS", value: `${stats.totalLoss.toFixed(1)} L`, icon: Droplets, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900" },
        ].map((s) => (
          <div key={s.label} className={cn("card-glass p-4 border shadow-xs", s.bg)}>
            <div className="flex items-center gap-1.5 mb-2">
              <s.icon size={15} className={s.color} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">{s.label}</span>
            </div>
            <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-glass overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Supabase Event Log</h3>
            <span className="text-xs font-semibold text-[var(--muted)]">({dbEvents.length} records)</span>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
            {(["All", "Active", "Resolved"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filter === f
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Fetching Supabase leak events...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 p-4">
            <p className="font-bold">Unable to retrieve leak events: {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  {["EVENT ID", "DATE", "START TIME", "END TIME", "DIFFERENCE", "ESTIMATED LOSS", "STATUS"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => {
                  const isActive = event.status === "ACTIVE";
                  return (
                    <tr
                      key={event.id || event.event_id}
                      onClick={() => setSelectedEvent(event)}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-[11px] font-mono font-bold text-[var(--muted)]">{event.event_id}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] font-mono font-medium">{fmtDate(event.start_time)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[var(--foreground)] font-medium">{fmtTime(event.start_time)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[var(--muted)]">
                        {event.end_time ? fmtTime(event.end_time) : "—"}
                      </td>
                      <td className={cn("px-4 py-3 text-xs font-mono font-bold", isActive ? "text-red-600 dark:text-red-400 animate-pulse" : "text-amber-600 dark:text-amber-400")}>
                        {Number(event.difference).toFixed(2)} L/min
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-[var(--foreground)]">
                        {Number(event.estimated_loss) > 0 ? `${Number(event.estimated_loss).toFixed(1)} L` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs",
                          isActive
                            ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                        )}>
                          {isActive ? <AlertTriangle size={11} className="animate-pulse text-red-600 dark:text-red-400" /> : <CheckCircle size={11} className="text-emerald-600 dark:text-emerald-400" />}
                          {isActive ? "ACTIVE LEAK" : "RESOLVED"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                      <div className="flex flex-col items-center gap-2">
                        <Database size={22} className="text-[var(--muted)]" />
                        <span className="text-xs font-semibold">No leak events recorded in Supabase.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
