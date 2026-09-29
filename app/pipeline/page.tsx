"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { PipelineVisualization } from "@/components/pipeline/PipelineVisualization";
import { FlowChart } from "@/components/charts/FlowChart";
import { cn } from "@/lib/utils";
import { GitBranch, MapPin, Calendar, Wrench, ShieldCheck, Gauge } from "lucide-react";
import { mockPipeline } from "@/lib/mock-data";

function InfoBlock({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="card-inner-area p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className="text-blue-600 dark:text-blue-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{label}</span>
      </div>
      <p className="text-sm font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function PipelinePage() {
  const { currentReading } = useSimulation();
  const isLeak = currentReading.status === "LEAK";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Pipeline</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">Pipeline configuration and monitoring</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#1d4ed8] dark:from-[#172554] dark:via-[#1D4ED8] dark:to-[#2563EB] p-6 text-white shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
              PIPELINE CONFIGURATION & TELEMETRY
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">PIPE-001 · Demo Pipeline</h2>
            <div className="flex items-center gap-1.5 text-xs text-blue-100 mt-1">
              <MapPin size={13} className="text-blue-300" />
              <span>Engineering Lab, Block A</span>
            </div>
          </div>
          <div>
            <span className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-xs inline-block",
              isLeak ? "bg-red-600 text-white border-red-400" : "bg-emerald-600 text-white border-emerald-400"
            )}>
              {isLeak ? "● LEAK DETECTED" : "● SYSTEM NORMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline info cards */}
      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <GitBranch size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--foreground)]">Pipeline Information</h3>
          <div className={cn(
            "ml-auto px-3 py-1 rounded-full text-[10px] font-bold border shadow-2xs",
            isLeak
              ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
          )}>
            {isLeak ? "⚠ LEAK DETECTED" : "● NORMAL"}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <InfoBlock label="Pipeline ID" value={mockPipeline.pipelineId} icon={GitBranch} />
          <InfoBlock label="Name" value={mockPipeline.name} icon={GitBranch} />
          <InfoBlock label="Location" value={mockPipeline.location} icon={MapPin} />
          <InfoBlock label="Leak Threshold" value={`${currentReading.leakThreshold.toFixed(1)} L/min`} icon={Gauge} />
          <InfoBlock label="Sensor 1 Location" value={mockPipeline.sensor1Location} icon={ShieldCheck} />
          <InfoBlock label="Sensor 2 Location" value={mockPipeline.sensor2Location} icon={ShieldCheck} />
          <InfoBlock label="Install Date" value={new Date(mockPipeline.installDate).toLocaleDateString()} icon={Calendar} />
          <InfoBlock label="Last Maintenance" value={new Date(mockPipeline.lastMaintenance).toLocaleDateString()} icon={Wrench} />
        </div>
      </div>

      {/* Live visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PipelineVisualization />
        </div>
        <div className="lg:col-span-2">
          <FlowChart title="Pipeline Flow History" height={340} />
        </div>
      </div>
    </div>
  );
}
