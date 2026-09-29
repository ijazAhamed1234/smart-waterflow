"use client";

import { Clock, AlertTriangle, CheckCircle, X, ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";
import type { LeakEvent } from "@/lib/mock-data";
import { useState } from "react";

function DetailModal({ event, onClose }: { event: LeakEvent; onClose: () => void }) {
  const isLeak = event.status === "ACTIVE" || event.difference > 1.0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-slide-down">
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-[var(--text-primary)] p-1 rounded-lg"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={20} className="text-blue-600" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Sensor Reading Detail</h3>
        </div>
        <div className="space-y-3 font-mono text-xs">
          {[
            { label: "Device ID", value: "ESP32-001" },
            { label: "Pipeline ID", value: event.location || "PIPE-001" },
            { label: "Timestamp", value: new Date(event.startTime).toLocaleString() },
            { label: "Flow In", value: `${event.flowIn.toFixed(2)} L/min` },
            { label: "Flow Out", value: `${event.flowOut.toFixed(2)} L/min` },
            { label: "Difference", value: `${event.difference.toFixed(2)} L/min` },
            { label: "Status", value: isLeak ? "LEAK DETECTED" : "NORMAL" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-[var(--border-card)] last:border-0">
              <span className="text-[var(--text-muted)] font-sans font-medium">{item.label}</span>
              <span className={cn("font-bold", item.label === "Status" && (isLeak ? "text-red-600" : "text-emerald-600"))}>{item.value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Close Detail View
        </button>
      </div>
    </div>
  );
}

export function RecentEventsTable() {
  const { leakEvents } = useSimulation();
  const [selectedEvent, setSelectedEvent] = useState<LeakEvent | null>(null);
  const recent = leakEvents.slice(0, 6);

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Sensor Readings</h3>
          </div>
          <a href="/sensors" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors">
            View all →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-[var(--border-card)] bg-[var(--bg-inner)]">
                {["TIME", "FLOW IN", "FLOW OUT", "DIFFERENCE", "STATUS"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((event) => {
                const isLeak = event.status === "ACTIVE" || event.difference > 1.0;
                const isWarning = !isLeak && event.difference > 0.7;
                const time = new Date(event.startTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="border-b border-[var(--border-card)] hover:bg-[var(--bg-inner)] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[var(--text-muted)]" />
                        {time}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {event.flowIn.toFixed(1)} L/min
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold whitespace-nowrap">
                      <span className={cn(isLeak ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400")}>
                        {event.flowOut.toFixed(1)} L/min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                      <span className={cn(
                        "font-bold",
                        isLeak ? "text-red-600 dark:text-red-400" : isWarning ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {event.difference.toFixed(1)} L/min
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs",
                        isLeak
                          ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                          : isWarning
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                      )}>
                        {isLeak ? (
                          <AlertTriangle size={11} className="animate-pulse text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle size={11} className="text-emerald-600 dark:text-emerald-400" />
                        )}
                        {isLeak ? "LEAK" : isWarning ? "WARNING" : "NORMAL"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <DetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}


