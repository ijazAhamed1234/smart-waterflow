"use client";

import { ShieldCheck, AlertTriangle, Zap, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

export function HeroStatus() {
  const { currentReading, deviceInfo } = useSimulation();
  const isLeak = currentReading.status === "LEAK";
  const isWarning = currentReading.status === "WARNING";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#1d4ed8] p-6 md:p-8 text-white shadow-md border border-blue-900">
      {/* Background subtle decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-16 right-1/3 w-80 h-80 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/5" />
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-400/30 backdrop-blur-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
              SMART WATER PIPELINE MONITORING
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            SmartFlow Water Monitoring System
          </h2>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-blue-100 mt-2 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-300">Pipeline:</span>
              <strong className="text-white font-semibold">{currentReading.pipelineId || "PIPE-001"}</strong>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-blue-300" />
              <span>Engineering Lab, Block A</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-300">Device:</span>
              <strong className="text-white font-mono">{deviceInfo.deviceId || "ESP32-001"}</strong>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {isLeak ? (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-600/95 border border-red-400 text-white shadow-lg backdrop-blur-xs">
              <AlertTriangle size={24} className="text-white animate-bounce" />
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-red-200">
                  SYSTEM STATUS
                </p>
                <p className="text-base font-extrabold text-white leading-tight">
                  LEAK DETECTED
                </p>
              </div>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/95 border border-amber-300 text-slate-950 shadow-lg backdrop-blur-xs">
              <Zap size={24} className="text-slate-950" />
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-900">
                  SYSTEM STATUS
                </p>
                <p className="text-base font-extrabold text-slate-950 leading-tight">
                  WARNING STATE
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-600/90 border border-emerald-400 text-white shadow-lg backdrop-blur-xs">
              <ShieldCheck size={24} className="text-white" />
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-200">
                  SYSTEM STATUS
                </p>
                <p className="text-base font-extrabold text-white leading-tight">
                  SYSTEM NORMAL
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


