"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { DeviceStatusCard } from "@/components/dashboard/DeviceStatusCard";
import { cn, getSignalBars } from "@/lib/utils";
import { Cpu, Wifi, Server } from "lucide-react";

export default function DevicesPage() {
  const { currentReading, deviceInfo } = useSimulation();
  const isOnline = deviceInfo.status === "ONLINE";

  const bars = getSignalBars(currentReading.wifiSignal);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Devices</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">Connected SmartFlow monitoring hardware</p>
      </div>

      {/* Device banner */}
      <div className="card-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
            <Cpu size={26} className="text-blue-600 dark:text-blue-400" />
            <div className={cn("absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#101C30]", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--foreground)]">{deviceInfo.deviceId || "ESP32-001"}</h3>
              <span className={cn("px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border", isOnline ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900")}>
                ● {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">Pipeline Monitoring Unit</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--muted)] font-medium">
              <span>Firmware: <strong className="font-semibold text-[var(--foreground)]">{deviceInfo.firmwareVersion || currentReading.firmware}</strong></span>
              <span>•</span>
              <span>Last Data: <strong className="font-semibold text-[var(--foreground)]">{deviceInfo.lastSeen ? new Date(deviceInfo.lastSeen).toLocaleTimeString() : "Never"}</strong></span>
            </div>
          </div>
        </div>

        {/* Signal bars */}
        <div className="flex items-center gap-3 card-inner-area px-3 py-2 flex-shrink-0">
          <div className="flex items-end gap-1 h-6">
            {[1, 2, 3, 4, 5].map((b) => (
              <div
                key={b}
                className={cn(
                  "w-1.5 rounded-t transition-all",
                  b <= bars ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-700"
                )}
                style={{ height: `${b * 20}%` }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-[var(--foreground)] font-mono">
            {currentReading.wifiSignal} dBm
          </span>
        </div>
      </div>

      {/* Device details + status card */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DeviceStatusCard />

        {/* Device Information */}
        <div className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
            <Wifi size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Device Information</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Wi-Fi Status", value: isOnline ? "Connected" : "Disconnected" },
              { label: "Signal Strength", value: `${currentReading.wifiSignal} dBm` },
              { label: "Wi-Fi SSID", value: currentReading.wifiSSID },
              { label: "Last Data", value: deviceInfo.lastSeen ? new Date(deviceInfo.lastSeen).toLocaleTimeString() : "Never" },
              { label: "Firmware Version", value: deviceInfo.firmwareVersion || currentReading.firmware },
              { label: "Assigned Pipeline", value: currentReading.pipelineId },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--muted)]">{item.label}</span>
                <span className="text-xs font-mono font-medium text-[var(--foreground)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Hardware */}
        <div className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
            <Server size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Connected Hardware</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Flow Sensor 1", value: "Connected (Inlet YF-S201)" },
              { label: "Flow Sensor 2", value: "Connected (Outlet YF-S201)" },
              { label: "Solenoid Relay", value: isOnline ? "Ready (Active Control)" : "Standby" },
              { label: "Buzzer Alarm", value: isOnline ? "Armed" : "Disabled" },
              { label: "Microcontroller", value: "ESP32 WROOM-32" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--muted)]">{item.label}</span>
                <span className="text-xs font-mono font-medium text-[var(--foreground)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
