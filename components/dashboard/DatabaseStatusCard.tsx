"use client";

import { Database, Server, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

export function DatabaseStatusCard() {
  const { dbStatus, dbLastChecked, dbError, refreshHealth } = useSimulation();

  const isConnected = dbStatus === "CONNECTED";
  const isConnecting = dbStatus === "CONNECTING";

  return (
    <div className="card-glass p-5 flex flex-col justify-between">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl border transition-colors shadow-2xs",
                isConnected
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : isConnecting
                  ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                  : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
              )}
            >
              <Database size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">DATABASE CONNECTION</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected
                      ? "bg-emerald-500 animate-pulse"
                      : isConnecting
                      ? "bg-amber-500 animate-ping"
                      : "bg-red-500"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-extrabold tracking-wide",
                    isConnected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isConnecting
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={refreshHealth}
            title="Refresh database connection status"
            className="card-inner-area p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:border-blue-400 transition-all shadow-2xs"
          >
            <RefreshCw size={14} className={cn(isConnecting && "animate-spin text-blue-600 dark:text-blue-400")} />
          </button>
        </div>

        {/* Database Content Body */}
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
                <Server size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Engine</span>
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Supabase (PostgreSQL)</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
                <Database size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Realtime Engine</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
                <ShieldCheck size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Last Checked</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[var(--foreground)]">
                {dbLastChecked ? dbLastChecked.toLocaleTimeString() : "Just now"}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-3">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400">
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-1">
                <AlertTriangle size={14} />
                <span>Supabase server unavailable.</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">{dbError || "Retrying connection..."}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--muted)] font-medium">
              <span>Auto Retrying in 10s</span>
              <button
                onClick={refreshHealth}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                Retry Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 size={12} className={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--muted)]"} />
          <span>Supabase Client</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)]">lib/supabase/client.ts</span>
      </div>
    </div>
  );
}
