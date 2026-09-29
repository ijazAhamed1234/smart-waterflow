"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useSimulation } from "@/contexts/SimulationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Activity } from "lucide-react";

interface TooltipItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#16253D] border border-slate-200 dark:border-[#263957] rounded-xl p-3 shadow-xl text-xs">
        <p className="text-slate-500 dark:text-slate-400 font-mono font-medium mb-1.5">{label}</p>
        {payload.map((p: TooltipItem) => (
          <div key={p.name} className="flex justify-between gap-4 mb-1">
            <span style={{ color: p.color }} className="font-bold">{p.name}</span>
            <span className="font-mono font-extrabold" style={{ color: p.color }}>
              {p.value.toFixed(2)} L/min
            </span>
          </div>
        ))}
        {payload.length >= 2 && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4 font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Difference</span>
            <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
              {Math.abs(payload[0].value - payload[1].value).toFixed(2)} L/min
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface FlowChartProps {
  title?: string;
  showThreshold?: boolean;
  height?: number;
}

export function FlowChart({ title = "Live Flow", showThreshold = true, height = 260 }: FlowChartProps) {
  const { flowHistory, currentReading } = useSimulation();
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const gridStroke = isDark ? "#263957" : "#d8e3f0";
  const textFill = isDark ? "#94a3b8" : "#64748b";

  // Show only last 20 points for readability
  const data = flowHistory.slice(-20);

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <div className="w-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded" />
            <span className="text-[var(--text-secondary)]">Flow In</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <div className="w-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded" />
            <span className="text-[var(--text-secondary)]">Flow Out</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase">Live</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.8} />
          <XAxis
            dataKey="time"
            tick={{ fill: textFill, fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: gridStroke }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: textFill, fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: gridStroke }}
            tickLine={false}
            domain={[3, 11]}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {showThreshold && (
            <ReferenceLine
              y={currentReading.leakThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.8}
              label={{
                value: `Threshold ${currentReading.leakThreshold}`,
                fill: "#ef4444",
                fontSize: 10,
                fontWeight: 600,
                position: "insideTopRight",
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="flowIn"
            name="Flow In"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#2563eb", stroke: "#1e3a8a", strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="flowOut"
            name="Flow Out"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#10b981", stroke: "#064e3b", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
