"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { getSensors } from "@/lib/api";
import { mockSensor1Stats, mockSensor2Stats } from "@/lib/mock-data";
import type { SensorReading } from "@/types/database";
import { cn } from "@/lib/utils";
import { BarChart3, ArrowDownToLine, ArrowUpFromLine, Download, Calendar, Loader2, Database } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

function SensorStatCard({
  label,
  icon: Icon,
  current,
  min,
  max,
  average,
  isLeak,
}: {
  label: string;
  icon: React.ElementType;
  current: number;
  min: number;
  max: number;
  average: number;
  isLeak?: boolean;
}) {
  return (
    <div className={cn("card-glass p-5", isLeak && "border-red-300 dark:border-red-900 bg-red-50/20 dark:bg-red-950/20")}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <div className={cn("p-2.5 rounded-xl border shadow-2xs", isLeak ? "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400")}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">{label}</h3>
          <p className="text-[10px] font-semibold text-[var(--muted)]">YF-S201 Flow Sensor</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Current", value: current, highlight: true, color: isLeak ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400" },
          { label: "Average", value: average, highlight: false, color: "text-[var(--foreground)]" },
          { label: "Minimum", value: min, highlight: false, color: "text-[var(--foreground)]" },
          { label: "Maximum", value: max, highlight: false, color: "text-[var(--foreground)]" },
        ].map((stat) => (
          <div key={stat.label} className={cn("card-inner-area p-3", stat.highlight && (isLeak ? "bg-red-50/40 dark:bg-red-950/40 border-red-200 dark:border-red-900" : "bg-blue-50/40 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"))}>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--muted)] mb-1">{stat.label}</p>
            <p className={cn("text-lg font-bold font-mono", stat.color)}>
              {stat.value.toFixed(2)}
              <span className="text-xs font-normal text-[var(--muted)] ml-1">L/min</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SensorsPage() {
  const { currentReading, lastUpdated } = useSimulation();
  const isLeak = currentReading.status === "LEAK";
  const [filter, setFilter] = useState("All");
  const [dbReadings, setDbReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getSensors(100);
        setDbReadings(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load sensor readings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastUpdated]);

  const filteredRows = useMemo(() => {
    if (filter === "All") return dbReadings;
    return dbReadings.filter((r) => r.status.toUpperCase() === filter.toUpperCase());
  }, [dbReadings, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Sensor Data</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">YF-S201 flow sensor measurements</p>
        </div>
      </div>

      {/* Sensor stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SensorStatCard
          label="FLOW SENSOR 1 — INLET"
          icon={ArrowDownToLine}
          current={currentReading.flowIn}
          min={mockSensor1Stats.min}
          max={mockSensor1Stats.max}
          average={mockSensor1Stats.average}
        />
        <SensorStatCard
          label="FLOW SENSOR 2 — OUTLET"
          icon={ArrowUpFromLine}
          current={currentReading.flowOut}
          min={isLeak ? 4.8 : mockSensor2Stats.min}
          max={mockSensor2Stats.max}
          average={isLeak ? 6.8 : mockSensor2Stats.average}
          isLeak={isLeak}
        />
      </div>

      {/* Filters + export */}
      <div className="card-glass p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Supabase Sensor Readings</h3>
            <span className="text-xs font-semibold text-[var(--muted)]">({dbReadings.length} records)</span>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] font-semibold transition-all">
              <Calendar size={13} className="text-[var(--muted)]" />
              Today
            </button>
            <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
              {["All", "Normal", "Leak"].map((f) => (
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
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-600/40 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-2xs">
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table / States */}
        {loading ? (
          <div className="py-12 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Fetching Supabase sensor records...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 p-4">
            <p className="font-bold">Unable to retrieve sensor data: {error}</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2">
            <Database size={24} className="text-[var(--muted)]" />
            <span className="text-xs font-medium">No sensor readings available in Supabase.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  {["DEVICE", "TIMESTAMP", "FLOW IN (L/MIN)", "FLOW OUT (L/MIN)", "DIFFERENCE", "STATUS"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                    <td className="px-4 py-2.5 text-[11px] font-mono font-semibold text-[var(--muted)]">
                      {row.device_id || "ESP32-001"}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-[var(--muted)]">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {Number(row.flow_in).toFixed(2)} L/min
                    </td>
                    <td className={cn("px-4 py-2.5 text-xs font-mono font-bold", row.status === "LEAK" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                      {Number(row.flow_out).toFixed(2)} L/min
                    </td>
                    <td className={cn("px-4 py-2.5 text-xs font-mono font-bold", row.status === "LEAK" ? "text-red-600 dark:text-red-400" : "text-[var(--foreground)]")}>
                      {Number(row.difference).toFixed(2)} L/min
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs",
                        row.status === "LEAK" ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900" : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                      )}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
