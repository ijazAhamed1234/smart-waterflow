"use client";

import { FlowChart } from "@/components/charts/FlowChart";
import { useSimulation } from "@/contexts/SimulationContext";
import { MetricCardsRow } from "@/components/dashboard/MetricCard";
import { LeakDetectionCard } from "@/components/dashboard/LeakDetectionCard";
import { Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function MonitoringPage() {
  const { currentReading } = useSimulation();
  const isLeak = currentReading.status === "LEAK";
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Live Pipeline Monitoring</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">
            Real-time sensor telemetry from ESP32-001 · Polling every 5 seconds
          </p>
        </div>
      </div>

      {/* Live Monitoring Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1D4ED8] dark:to-[#2563EB] p-6 text-white shadow-md border border-blue-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-400/30 backdrop-blur-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                LIVE WATER PIPELINE MONITORING
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Real-time Hardware & Sensor Telemetry
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-1 font-medium">
              <span>Device: <strong className="text-white font-mono">{currentReading.deviceId || "ESP32-001"}</strong></span>
              <span>•</span>
              <span>Pipeline: <strong className="text-white font-mono">{currentReading.pipelineId || "PIPE-001"}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-blue-200">
                <Clock size={12} />
                <span suppressHydrationWarning>{now.toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className={cn(
              "px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border shadow-md inline-block",
              isLeak
                ? "bg-red-600 text-white border-red-400 animate-bounce"
                : "bg-emerald-600 text-white border-emerald-400"
            )}>
              {isLeak ? "● LEAK DETECTED" : "● SYSTEM NORMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <MetricCardsRow
        flowIn={currentReading.flowIn}
        flowOut={currentReading.flowOut}
        difference={currentReading.difference}
        status={currentReading.status}
        threshold={currentReading.leakThreshold}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FlowChart title="Live Flow In vs Flow Out" height={300} />
        <LeakDetectionCard />
      </div>

      {/* Alert timeline */}
      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <Activity size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">Alert Timeline</h3>
        </div>
        <div className="space-y-2.5">
          {[
            { time: "10:42 AM", msg: "System normal – all sensors nominal", type: "normal" },
            { time: "10:38 AM", msg: "Leak resolved – flow difference returned to 0.3 L/min", type: "resolved" },
            { time: "10:35 AM", msg: "⚠ Leak detected – flow difference: 2.5 L/min", type: "leak" },
            { time: "10:20 AM", msg: "System normal – all sensors nominal", type: "normal" },
            { time: "09:22 AM", msg: "Leak resolved – flow difference returned to 0.4 L/min", type: "resolved" },
            { time: "09:15 AM", msg: "⚠ Leak detected – flow difference: 2.9 L/min", type: "leak" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--surface)] transition-colors">
              <div className={cn(
                "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                item.type === "leak" ? "bg-red-500" : item.type === "resolved" ? "bg-emerald-500" : "bg-slate-400"
              )} />
              <div className="flex-1 flex items-start justify-between gap-4">
                <p className={cn(
                  "text-xs font-semibold",
                  item.type === "leak" ? "text-red-600 dark:text-red-400" : item.type === "resolved" ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--foreground)]"
                )}>
                  {item.msg}
                </p>
                <span className="text-[11px] text-[var(--muted)] font-mono font-medium whitespace-nowrap">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
