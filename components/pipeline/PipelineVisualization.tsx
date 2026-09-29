"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { cn } from "@/lib/utils";
import { Droplets, AlertTriangle, Info } from "lucide-react";

function FlowDot({ delay, color, active }: { delay: number; color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div
      className={cn("absolute w-2 h-2 rounded-full opacity-90 transition-opacity motion-reduce:hidden", color)}
      style={{
        animation: `flow-down 1.6s linear ${delay}s infinite`,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    />
  );
}

function PipeSegment({ leak, active }: { leak: boolean; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {/* Pipe body */}
      <div
        className={cn(
          "relative w-6 h-24 rounded border border-slate-300 dark:border-slate-700 shadow-xs",
          leak ? "pipe-leak" : "pipe-normal"
        )}
      >
        {!leak && active && (
          <>
            <FlowDot delay={0} color="bg-blue-100" active={active} />
            <FlowDot delay={0.4} color="bg-white" active={active} />
            <FlowDot delay={0.8} color="bg-blue-100" active={active} />
            <FlowDot delay={1.2} color="bg-white" active={active} />
          </>
        )}
        {leak && (
          <>
            <FlowDot delay={0} color="bg-amber-100" active={active} />
            <FlowDot delay={0.6} color="bg-white" active={active} />
            {/* Leak drip */}
            <div
              className="absolute -right-3 top-1/2 w-1.5 h-1.5 rounded-full bg-red-600 shadow-xs motion-reduce:hidden"
              style={{ animation: "drip 1.8s ease-in infinite" }}
            />
            <div
              className="absolute -right-3 top-1/2 w-1.5 h-1.5 rounded-full bg-red-600 shadow-xs motion-reduce:hidden"
              style={{ animation: "drip 1.8s ease-in 0.9s infinite" }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function PipelineVisualization() {
  const { currentReading } = useSimulation();
  const isLeak = currentReading.status === "LEAK";
  const isFlowing = currentReading.flowIn > 0 || currentReading.flowOut > 0;

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Pipeline Flow</h3>
        </div>
        <div className={cn(
          "text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs",
          isLeak
            ? "text-red-700 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 animate-pulse"
            : "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50"
        )}>
          {isLeak ? "⚠ LEAK DETECTED" : "● NORMAL"}
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="flex flex-col items-center py-3 gap-0">

        {/* Water Tank */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-16 rounded-t-xl bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/80 border-2 border-blue-400 dark:border-blue-700 flex items-center justify-center overflow-hidden shadow-xs">
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-blue-500/20 animate-pulse" />
            <div className="relative flex flex-col items-center">
              <Droplets size={16} className="text-blue-700 dark:text-blue-300 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-800 dark:text-blue-200">WATER TANK</span>
            </div>
          </div>
          <div className="w-6 h-3 bg-blue-600 border-x-2 border-blue-700" />
        </div>

        {/* Sensor 1 (Inlet) */}
        <div className="relative flex flex-col items-center group cursor-pointer">
          <div className="w-24 h-12 rounded-xl bg-blue-600 border-2 border-blue-700 flex flex-col items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <p className="text-[8px] font-extrabold uppercase tracking-wider text-blue-100">SENSOR 1 (INLET)</p>
            <p className="text-xs font-bold font-mono text-white">{currentReading.flowIn.toFixed(1)} L/min</p>
          </div>

          {/* Interactive Hover Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
            <div className="bg-slate-900 text-white text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-700">
              <p className="font-bold text-blue-400">YF-S201 Flow Sensor</p>
              <p>Pin: GPIO 34 (Inlet)</p>
              <p>Flow: {currentReading.flowIn.toFixed(2)} L/min</p>
            </div>
            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
          </div>

          <div className="w-6 h-3 bg-blue-600 border-x-2 border-blue-700" />
        </div>

        {/* Pipeline segment */}
        <div className="relative flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "text-center mb-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs",
              isLeak
                ? "text-red-700 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50"
                : "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50"
            )}>
              {isLeak ? "⚠ LEAK ZONE" : "PIPELINE PIPE-001"}
            </div>
            <PipeSegment leak={isLeak} active={isFlowing} />
            {isLeak && (
              <div className="flex flex-col items-center mt-1 animate-slide-up">
                <AlertTriangle size={15} className="text-red-600 dark:text-red-400 animate-pulse mb-0.5" />
                <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400">LEAK</span>
              </div>
            )}
          </div>
        </div>

        {/* Sensor 2 (Outlet) */}
        <div className="relative flex flex-col items-center group cursor-pointer">
          <div className="w-6 h-3 bg-blue-600 border-x-2 border-blue-700" />
          <div className={cn(
            "w-24 h-12 rounded-xl border-2 flex flex-col items-center justify-center shadow-xs group-hover:scale-105 transition-transform",
            isLeak
              ? "bg-red-600 border-red-700"
              : "bg-blue-600 border-blue-700"
          )}>
            <p className="text-[8px] font-extrabold uppercase tracking-wider text-white">SENSOR 2 (OUTLET)</p>
            <p className="text-xs font-bold font-mono text-white">
              {currentReading.flowOut.toFixed(1)} L/min
            </p>
          </div>

          {/* Interactive Hover Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-14 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
            <div className="bg-slate-900 text-white text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-700">
              <p className="font-bold text-blue-400">YF-S201 Flow Sensor</p>
              <p>Pin: GPIO 35 (Outlet)</p>
              <p>Flow: {currentReading.flowOut.toFixed(2)} L/min</p>
            </div>
            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
          </div>

          <div className={cn(
            "w-6 h-3 border-x-2",
            isLeak ? "bg-red-600 border-red-700" : "bg-blue-600 border-blue-700"
          )} />
        </div>

        {/* Outlet */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-24 h-10 rounded-b-xl border-2 flex items-center justify-center shadow-xs",
            isLeak
              ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800"
          )}>
            <span className={cn("text-[10px] font-extrabold tracking-wider", isLeak ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-400")}>
              WATER OUTLET
            </span>
          </div>
        </div>

        {/* Diff indicator below */}
        {isLeak && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center animate-slide-up shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Flow Difference (Leak Rate)</p>
            <p className="text-lg font-extrabold text-red-600 dark:text-red-400 font-mono">
              {currentReading.difference.toFixed(2)} L/min
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


