"use client";

import { HeroStatus } from "@/components/dashboard/HeroStatus";
import { MetricCardsRow } from "@/components/dashboard/MetricCard";
import { PipelineVisualization } from "@/components/pipeline/PipelineVisualization";
import { FlowChart } from "@/components/charts/FlowChart";
import { LeakDetectionCard } from "@/components/dashboard/LeakDetectionCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { DeviceStatusCard } from "@/components/dashboard/DeviceStatusCard";
import { DatabaseStatusCard } from "@/components/dashboard/DatabaseStatusCard";
import { SimulateLeakToggle } from "@/components/dashboard/SimulateLeakToggle";
import { useSimulation } from "@/contexts/SimulationContext";

export default function DashboardPage() {
  const { currentReading } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">System Overview</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">Pipeline: PIPE-001 · Device: {currentReading.deviceId || "ESP32-001"}</p>
        </div>
      </div>

      {/* Hero status card */}
      <HeroStatus />

      {/* Key metric cards */}
      <MetricCardsRow
        flowIn={currentReading.flowIn}
        flowOut={currentReading.flowOut}
        difference={currentReading.difference}
        status={currentReading.status}
        threshold={currentReading.leakThreshold}
      />

      {/* Pipeline viz + Leak Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PipelineVisualization />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <FlowChart />
          <LeakDetectionCard />
        </div>
      </div>

      {/* Recent events + Device status + Database status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentEventsTable />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <DeviceStatusCard />
          <DatabaseStatusCard />
        </div>
      </div>
    </div>
  );
}

