"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

export function LeakDetectionCard() {
  const { currentReading } = useSimulation();
  const { difference, leakThreshold } = currentReading;

  const maxScale = leakThreshold * 3;
  const pct = Math.min((difference / maxScale) * 100, 100);
  const thresholdPct = (leakThreshold / maxScale) * 100;
  const warningPct = (leakThreshold * 0.7 / maxScale) * 100;

  const isLeak = difference >= leakThreshold;
  const isWarning = !isLeak && difference >= leakThreshold * 0.7;

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">Leak Detection</h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs",
            isLeak
              ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
              : isWarning
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
          )}
        >
          {isLeak ? (
            <AlertTriangle size={12} className="animate-pulse text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
          )}
          {isLeak ? "LEAK" : isWarning ? "WARNING" : "NORMAL"}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card-inner-area p-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] mb-1">Current Difference</p>
          <p className={cn("text-xl font-bold font-mono", isLeak ? "text-red-600 dark:text-red-400" : isWarning ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
            {difference.toFixed(2)}
            <span className="text-xs font-normal text-[var(--muted)] ml-1">L/min</span>
          </p>
        </div>
        <div className="card-inner-area p-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] mb-1">Threshold</p>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {leakThreshold.toFixed(1)}
            <span className="text-xs font-normal text-[var(--muted)] ml-1">L/min</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="relative h-4 rounded-full bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
          {/* Warning zone */}
          <div
            className="absolute top-0 h-full bg-amber-100/70 dark:bg-amber-900/30 border-r border-amber-300 dark:border-amber-800"
            style={{ left: `${warningPct}%`, width: `${thresholdPct - warningPct}%` }}
          />
          {/* Critical zone */}
          <div
            className="absolute top-0 h-full bg-red-100/70 dark:bg-red-900/30"
            style={{ left: `${thresholdPct}%`, width: `${100 - thresholdPct}%` }}
          />

          {/* Fill */}
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isLeak
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : isWarning
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-blue-500 to-emerald-500"
            )}
            style={{ width: `${pct}%` }}
          />

          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400"
            style={{ left: `${thresholdPct}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono font-medium">
          <span>0</span>
          <span className="text-amber-600 dark:text-amber-400">{(leakThreshold * 0.7).toFixed(1)}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">▲ {leakThreshold.toFixed(1)}</span>
          <span>{maxScale.toFixed(1)}</span>
        </div>

        <div className="flex gap-4 mt-2">
          {[
            { color: "bg-emerald-500", label: "Normal", range: `< ${(leakThreshold * 0.7).toFixed(1)}` },
            { color: "bg-amber-500", label: "Warning", range: `${(leakThreshold * 0.7).toFixed(1)}–${leakThreshold.toFixed(1)}` },
            { color: "bg-red-500", label: "Leak", range: `≥ ${leakThreshold.toFixed(1)}` },
          ].map((zone) => (
            <div key={zone.label} className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-medium">
              <div className={cn("w-2 h-2 rounded-full", zone.color)} />
              <span>{zone.label}</span>
              <span className="text-[var(--muted)] font-mono">{zone.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leak details */}
      {isLeak && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 animate-slide-up">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">⚠ Estimated Leakage Rate</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono">
            {difference.toFixed(2)}
            <span className="text-sm ml-1 font-semibold text-red-500 dark:text-red-400">L/min</span>
          </p>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 font-medium">
            {(difference * 60).toFixed(1)} liters lost per hour at current rate
          </p>
        </div>
      )}
    </div>
  );
}
