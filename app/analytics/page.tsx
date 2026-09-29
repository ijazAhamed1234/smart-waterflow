"use client";

import { useState, useEffect } from "react";
import { getAnalytics } from "@/lib/api";
import { generateDailyAnalytics } from "@/lib/mock-data";
import type { AnalyticsData } from "@/types/database";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { LineChart as LineChartIcon, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Range = "Today" | "7 Days" | "30 Days";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
        <LineChartIcon size={18} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7 Days");
  const days = range === "Today" ? 1 : range === "7 Days" ? 7 : 30;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const gridStroke = isDark ? "#263957" : "#d8e3f0";
  const textFill = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await getAnalytics(days);
        setAnalyticsData(res);
      } catch {
        // Fallback to generated if DB is disconnected
        const fallbackDaily = generateDailyAnalytics(days);
        setAnalyticsData({
          avgFlowIn: 8.4,
          avgFlowOut: 8.1,
          avgDifference: 0.3,
          totalReadings: days * 24,
          totalLeakEvents: 2,
          estimatedWaterLoss: 87.0,
          dailyAnalytics: fallbackDaily.map((d) => ({
            date: d.date,
            avgFlowIn: d.avgFlowIn,
            avgFlowOut: d.avgFlowOut,
            avgDifference: parseFloat((d.avgFlowIn - d.avgFlowOut).toFixed(2)),
          })),
        });
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [days]);

  const chartData = analyticsData?.dailyAnalytics || [];

  const tooltipStyle = {
    contentStyle: {
      background: isDark ? "#14233A" : "#ffffff",
      border: `1px solid ${isDark ? "#263957" : "#d8e3f0"}`,
      borderRadius: "12px",
      fontSize: "11px",
      color: isDark ? "#f8fafc" : "#0f172a",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Analytics</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">Water flow and leakage analysis</p>
        </div>
        {/* Date range controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xs">
          <Calendar size={13} className="text-[var(--muted)] ml-2" />
          {(["Today", "7 Days", "30 Days"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                range === r
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass card-glass-interactive p-4 border border-blue-200 dark:border-blue-900/60" onClick={() => document.getElementById('chart-flow-rate')?.scrollIntoView({ behavior: 'smooth' })}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">AVERAGE FLOW IN</p>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {analyticsData ? analyticsData.avgFlowIn.toFixed(2) : "—"} <span className="text-xs text-[var(--muted)] font-normal">L/min</span>
          </p>
        </div>

        <div className="card-glass card-glass-interactive p-4 border border-emerald-200 dark:border-emerald-900/60" onClick={() => document.getElementById('chart-flow-comparison')?.scrollIntoView({ behavior: 'smooth' })}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">AVERAGE FLOW OUT</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {analyticsData ? analyticsData.avgFlowOut.toFixed(2) : "—"} <span className="text-xs text-[var(--muted)] font-normal">L/min</span>
          </p>
        </div>

        <a href="/leaks" className="block">
          <div className="card-glass card-glass-interactive p-4 border border-amber-200 dark:border-amber-900/60 h-full">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">TOTAL LEAK EVENTS</p>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {analyticsData ? analyticsData.totalLeakEvents : 0}
            </p>
          </div>
        </a>

        <div className="card-glass card-glass-interactive p-4 border border-red-200 dark:border-red-900/60" onClick={() => document.getElementById('chart-diff-trend')?.scrollIntoView({ behavior: 'smooth' })}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">ESTIMATED WATER LOSS</p>
          <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
            {analyticsData ? analyticsData.estimatedWaterLoss.toFixed(1) : "0.0"} <span className="text-xs text-[var(--muted)] font-normal">L</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium">Calculating Supabase analytics...</span>
        </div>
      ) : (
        /* Charts grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Average Flow Over Time */}
          <div id="chart-flow-rate">
            <ChartCard title="Average Flow Rate Over Time">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flowInGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="flowOutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.8} />
                  <XAxis dataKey="date" tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="avgFlowIn" name="Avg Flow In" stroke="#2563eb" fill="url(#flowInGrad)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="avgFlowOut" name="Avg Flow Out" stroke="#10b981" fill="url(#flowOutGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* 2. Flow In vs Out comparison */}
          <div id="chart-flow-comparison">
            <ChartCard title="Flow In vs Flow Out (Daily)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.8} />
                  <XAxis dataKey="date" tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: textFill }} />
                  <Bar dataKey="avgFlowIn" name="Flow In" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="avgFlowOut" name="Flow Out" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* 3. Flow Difference Trend */}
          <div id="chart-diff-trend">
            <ChartCard title="Flow Difference Trend (L/min)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.8} />
                  <XAxis dataKey="date" tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="avgDifference" name="Difference" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* 4. Overall Trend Line */}
          <ChartCard title="Pipeline Flow Difference History">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.8} />
                <XAxis dataKey="date" tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: textFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="avgDifference"
                  name="Difference (L/min)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: "#2563eb", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
