"use client";

import { ArrowDownToLine, ArrowUpFromLine, GitCompare, ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  status?: "normal" | "warning" | "leak" | "neutral";
  trend?: number; // positive = up, negative = down
  subtitle?: string;
  highlight?: boolean;
  href?: string;
}

const statusStyles = {
  normal: {
    icon: "bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#047857]",
    value: "text-[#059669] dark:text-[#34D399]",
  },
  warning: {
    icon: "bg-[#FFFBEB] dark:bg-[#451A03] text-[#D97706] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#B45309]",
    value: "text-[#D97706] dark:text-[#FBBF24]",
  },
  leak: {
    icon: "bg-[#FEF2F2] dark:bg-[#450A0A] text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-[#991B1B]",
    value: "text-[#DC2626] dark:text-[#F87171]",
  },
  neutral: {
    icon: "bg-[#EFF6FF] dark:bg-[#102A4A] text-[#2563EB] dark:text-[#60A5FA] border-[#BFDBFE] dark:border-[#1D4ED8]",
    value: "text-[#2563EB] dark:text-[#60A5FA]",
  },
};

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status = "neutral",
  trend,
  subtitle,
  highlight = false,
  href,
}: MetricCardProps) {
  const styles = statusStyles[status];

  const content = (
    <div
      className={cn(
        "card-kpi card-glass-interactive p-5 h-full flex flex-col justify-between group",
        highlight && status === "leak" && "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30",
        highlight && status === "normal" && "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20"
      )}
    >
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div className={cn("p-2.5 rounded-xl border shadow-2xs group-hover:scale-105 transition-transform", styles.icon)}>
            <Icon size={20} />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border",
                trend > 0 ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" : trend < 0 ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              )}
            >
              {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              <span>{Math.abs(trend).toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{title}</p>
        <div className="flex items-end gap-1.5">
          <span className={cn("metric-value font-mono font-bold text-3xl", styles.value)}>{value}</span>
          {unit && <span className="text-sm text-[var(--text-muted)] mb-1 font-semibold">{unit}</span>}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium flex items-center justify-between">
          <span>{subtitle}</span>
          {href && <span className="text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

interface MetricCardsRowProps {
  flowIn: number;
  flowOut: number;
  difference: number;
  status: string;
  threshold: number;
}

export function MetricCardsRow({ flowIn, flowOut, difference, status, threshold }: MetricCardsRowProps) {
  const getStatus = (): "normal" | "warning" | "leak" => {
    if (status === "LEAK") return "leak";
    if (status === "WARNING") return "warning";
    return "normal";
  };

  const diffStatus = difference > threshold ? "leak" : difference > threshold * 0.7 ? "warning" : "normal";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="FLOW IN"
        value={flowIn.toFixed(1)}
        unit="L/min"
        icon={ArrowDownToLine}
        status="neutral"
        subtitle="Inlet Sensor"
        href="/sensors"
      />
      <MetricCard
        title="FLOW OUT"
        value={flowOut.toFixed(1)}
        unit="L/min"
        icon={ArrowUpFromLine}
        status={getStatus()}
        subtitle="Outlet Sensor"
        href="/sensors"
      />
      <MetricCard
        title="FLOW DIFFERENCE"
        value={difference.toFixed(2)}
        unit="L/min"
        icon={GitCompare}
        status={diffStatus}
        subtitle={`Leak threshold: ${threshold.toFixed(1)} L/min`}
        highlight={diffStatus === "leak"}
        href="/monitoring"
      />
      <MetricCard
        title="PIPELINE STATUS"
        value={status === "LEAK" ? "LEAK" : status === "WARNING" ? "WARN" : "NORMAL"}
        icon={ShieldCheck}
        status={getStatus()}
        subtitle={
          status === "LEAK"
            ? "Leak detected – check pipeline"
            : status === "WARNING"
            ? "Approaching threshold"
            : "All sensors nominal"
        }
        highlight
        href="/pipeline"
      />
    </div>
  );
}


