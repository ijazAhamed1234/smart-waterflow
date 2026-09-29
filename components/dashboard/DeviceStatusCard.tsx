"use client";

import { Cpu, Wifi, Gauge, Clock, Zap, CheckCircle, XCircle, Radio } from "lucide-react";
import { cn, getSignalStrength } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
        <Icon size={13} className="text-[var(--muted)]" />
        {label}
      </div>
      <span className={cn("text-xs font-semibold", valueClass ?? "text-[var(--foreground)]")}>
        {value}
      </span>
    </div>
  );
}

export function DeviceStatusCard() {
  const { currentReading, deviceInfo } = useSimulation();
  const isOnline = deviceInfo.status === "ONLINE";
  const signalStrength = getSignalStrength(currentReading.wifiSignal);

  return (
    <div className="card-glass p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900">
          <Cpu size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--foreground)]">{deviceInfo.deviceId}</h3>
            <div className="flex items-center gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
              <span className={cn("text-[10px] font-extrabold tracking-wide", isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">{deviceInfo.name || "ESP32 WROOM-32"}</p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-0">
        <InfoRow icon={Wifi} label="Wi-Fi" value={isOnline ? "Connected" : "Disconnected"} valueClass={isOnline ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"} />
        <InfoRow icon={Radio} label="SSID" value={currentReading.wifiSSID} />
        <InfoRow icon={Gauge} label="Signal" value={`${signalStrength} (${currentReading.wifiSignal} dBm)`} />
        <InfoRow
          icon={Clock}
          label="Last Data"
          value={deviceInfo.lastSeen ? new Date(deviceInfo.lastSeen).toLocaleTimeString() : "Never"}
          valueClass="text-blue-600 dark:text-blue-400 font-bold font-mono"
        />
        <InfoRow icon={Cpu} label="Firmware" value={deviceInfo.firmwareVersion || currentReading.firmware} />
      </div>

      {/* Sensors */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Sensors</p>
        {[
          { label: "Flow Sensor 1 (YF-S201)", ok: true },
          { label: "Flow Sensor 2 (YF-S201)", ok: true },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">{s.label}</span>
            <div className="flex items-center gap-1 text-xs font-bold">
              {s.ok ? (
                <><CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400" /><span className="text-emerald-600 dark:text-emerald-400">Connected</span></>
              ) : (
                <><XCircle size={13} className="text-red-600 dark:text-red-400" /><span className="text-red-600 dark:text-red-400">Disconnected</span></>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Relay & Buzzer */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3">
        <div className={cn(
          "text-center p-2.5 rounded-xl border text-xs font-bold shadow-2xs",
          currentReading.relayStatus
            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
            : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
        )}>
          <Zap size={14} className="mx-auto mb-1" />
          Relay {currentReading.relayStatus ? "ON" : "OFF"}
        </div>
        <div className={cn(
          "text-center p-2.5 rounded-xl border text-xs font-bold shadow-2xs",
          currentReading.buzzerActive
            ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 animate-pulse"
            : "card-inner-area text-[var(--muted)]"
        )}>
          <Radio size={14} className="mx-auto mb-1" />
          Buzzer {currentReading.buzzerActive ? "ACTIVE" : "IDLE"}
        </div>
      </div>
    </div>
  );
}
