"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  getHealth,
  getDashboard,
  createSensorReading,
  triggerSeed,
} from "@/lib/api";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  mockNormalReading,
  type SensorReading as MockSensorReading,
  type FlowDataPoint,
  type LeakEvent as MockLeakEvent,
} from "@/lib/mock-data";
import type { DashboardData, HealthStatus } from "@/types/database";

export interface ToastMessage {
  id: string;
  type: "LEAK" | "RESOLVED" | "DISCONNECT" | "RECONNECT" | "WARNING";
  title: string;
  message: string;
  details?: Record<string, string>;
  timestamp: Date;
}

export type DatabaseConnectionStatus = "CONNECTED" | "DISCONNECTED" | "CONNECTING";
export type ApiStatus = "ONLINE" | "OFFLINE";

export interface DeviceInfoState {
  deviceId: string;
  name: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  lastSeen: string | null;
  firmwareVersion: string;
}

interface SimulationContextType {
  isLeakSimulated: boolean;
  setLeakSimulated: (v: boolean) => void;
  currentReading: MockSensorReading;
  deviceInfo: DeviceInfoState;
  flowHistory: FlowDataPoint[];
  leakEvents: MockLeakEvent[];
  lastUpdated: Date;
  refreshInterval: number;
  setRefreshInterval: (v: number) => void;
  leakThreshold: number;
  setLeakThreshold: (v: number) => void;
  toastMessages: ToastMessage[];
  dismissToast: (id: string) => void;

  // Supabase & API Connectivity Status
  dbStatus: DatabaseConnectionStatus;
  apiStatus: ApiStatus;
  dbLastChecked: Date | null;
  dbError?: string;
  refreshHealth: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [isLeakSimulated, setIsLeakSimulatedState] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [leakThreshold, setLeakThreshold] = useState(1.0);
  const [currentReading, setCurrentReading] = useState<MockSensorReading>({
    ...mockNormalReading,
    leakThreshold: 1.0,
  });
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoState>({
    deviceId: "ESP32-001",
    name: "Pipeline Monitoring Unit",
    status: "OFFLINE",
    lastSeen: null,
    firmwareVersion: "v1.0.0",
  });
  const [flowHistory, setFlowHistory] = useState<FlowDataPoint[]>([]);
  const [leakEvents, setLeakEvents] = useState<MockLeakEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);

  // Connectivity state
  const [dbStatus, setDbStatus] = useState<DatabaseConnectionStatus>("CONNECTING");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("ONLINE");
  const [dbLastChecked, setDbLastChecked] = useState<Date | null>(null);
  const [dbError, setDbError] = useState<string | undefined>(undefined);

  const prevLeakRef = useRef(false);
  const isInitialMount = useRef(true);

  const addToast = useCallback((toast: Omit<ToastMessage, "id" | "timestamp">) => {
    const id = Math.random().toString(36).slice(2);
    setToastMessages((prev) => [{ ...toast, id, timestamp: new Date() }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToastMessages((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastMessages((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Health check polling against /api/health
  const refreshHealth = useCallback(async () => {
    try {
      const health: HealthStatus = await getHealth();
      setApiStatus(health.api);
      if (health.database === "CONNECTED") {
        setDbStatus("CONNECTED");
        setDbError(undefined);
      } else {
        setDbStatus("DISCONNECTED");
        setDbError(health.error || "Supabase PostgreSQL server unavailable");
      }
      setDbLastChecked(new Date());
    } catch (err: unknown) {
      setDbStatus("DISCONNECTED");
      setApiStatus("ONLINE");
      setDbError(err instanceof Error ? err.message : "Health check request failed");
      setDbLastChecked(new Date());
    }
  }, []);

  // Dashboard refresh function
  const refreshDashboard = useCallback(async () => {
    try {
      const data: DashboardData = await getDashboard();
      setApiStatus("ONLINE");
      if (data.database.status === "CONNECTED") {
        setDbStatus("CONNECTED");
        setDbError(undefined);
      } else {
        setDbStatus("DISCONNECTED");
        setDbError(data.database.error || "Supabase unavailable");
      }

      setLastUpdated(new Date());

      if (typeof data.threshold === "number") {
        setLeakThreshold(data.threshold);
      }

      if (data.device) {
        setDeviceInfo({
          deviceId: data.device.deviceId || "ESP32-001",
          name: data.device.name || "Pipeline Monitoring Unit",
          status: data.device.status === "ONLINE" ? "ONLINE" : "OFFLINE",
          lastSeen: data.device.lastSeen || null,
          firmwareVersion: data.device.firmwareVersion || "v1.0.0",
        });
      }

      const isLeak = data.systemStatus === "LEAK" || data.pipelineStatus === "LEAK";
      setIsLeakSimulatedState(isLeak);

      if (data.latestReading) {
        setCurrentReading((prev) => ({
          ...prev,
          deviceId: data.latestReading?.device_id || "ESP32-001",
          pipelineId: data.latestReading?.pipeline_id || "PIPE-001",
          flowIn: data.latestReading?.flow_in ?? 0,
          flowOut: data.latestReading?.flow_out ?? 0,
          difference: data.latestReading?.difference ?? 0,
          leakThreshold: data.threshold ?? 1.0,
          status: data.latestReading?.status === "LEAK" ? "LEAK" : "NORMAL",
          timestamp: data.latestReading?.timestamp || new Date().toISOString(),
        }));
      }

      if (data.flowHistory && data.flowHistory.length > 0) {
        setFlowHistory(data.flowHistory);
      }

      if (data.recentLeaks) {
        const formattedEvents: MockLeakEvent[] = data.recentLeaks.map((evt) => ({
          id: evt.event_id,
          startTime: evt.start_time,
          endTime: evt.end_time || undefined,
          flowIn: evt.flow_in,
          flowOut: evt.flow_out,
          difference: evt.difference,
          estimatedLoss: evt.estimated_loss || 0,
          status: evt.status === "ACTIVE" ? "ACTIVE" : "RESOLVED",
          location: evt.pipeline_id || "PIPE-001",
        }));
        setLeakEvents(formattedEvents);
      }
    } catch (err: unknown) {
      setDbStatus("DISCONNECTED");
      setDbError(err instanceof Error ? err.message : "Dashboard API request failed");
    }
  }, []);

  // Simulate leak/normal action -> writes directly to Supabase via POST /api/sensors
  const setLeakSimulated = useCallback(
    async (simulateLeak: boolean) => {
      setIsLeakSimulatedState(simulateLeak);
      const flowIn = 8.5;
      const flowOut = simulateLeak ? 5.5 : 8.2;

      try {
        await createSensorReading({
          deviceId: "ESP32-001",
          pipelineId: "PIPE-001",
          flowIn,
          flowOut,
        });

        if (simulateLeak && !prevLeakRef.current) {
          addToast({
            type: "LEAK",
            title: "🔴 LEAK DETECTED",
            message: "Flow anomaly written to Supabase PostgreSQL.",
            details: {
              "Flow In": `${flowIn} L/min`,
              "Flow Out": `${flowOut} L/min`,
              Difference: `${(flowIn - flowOut).toFixed(1)} L/min`,
            },
          });
        } else if (!simulateLeak && prevLeakRef.current) {
          addToast({
            type: "RESOLVED",
            title: "✅ LEAK RESOLVED",
            message: "Flow difference returned to normal range in Supabase.",
            details: {
              "Flow In": `${flowIn} L/min`,
              "Flow Out": `${flowOut} L/min`,
              Difference: `${(flowIn - flowOut).toFixed(1)} L/min`,
            },
          });
        }
        prevLeakRef.current = simulateLeak;

        // Refresh dashboard data
        await refreshDashboard();
      } catch (err: unknown) {
        addToast({
          type: "WARNING",
          title: "⚠️ API ERROR",
          message: err instanceof Error ? err.message : "Failed to insert reading into Supabase",
        });
      }
    },
    [addToast, refreshDashboard]
  );

  // Initial setup & auto-seed if needed
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const init = async () => {
      await refreshHealth();
      try {
        const dashboard = await getDashboard();
        if (dashboard.database.status === "CONNECTED") {
          if (!dashboard.latestReading || dashboard.flowHistory.length === 0) {
            await triggerSeed();
          }
          await refreshDashboard();
        }
      } catch {
        // Fallback handled cleanly by health check
      }
    };

    init();
  }, [refreshHealth, refreshDashboard]);

  // Supabase Realtime Subscription for sensor_readings
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("realtime-sensor-readings")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "sensor_readings" },
          (payload) => {
            const newReading = payload.new;
            if (newReading) {
              setLastUpdated(new Date());
              const timeLabel = new Date(newReading.timestamp || Date.now()).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              setCurrentReading((prev) => ({
                ...prev,
                deviceId: newReading.device_id || prev.deviceId,
                pipelineId: newReading.pipeline_id || prev.pipelineId,
                flowIn: newReading.flow_in,
                flowOut: newReading.flow_out,
                difference: newReading.difference,
                status: newReading.status === "LEAK" ? "LEAK" : "NORMAL",
                timestamp: newReading.timestamp || new Date().toISOString(),
              }));

              setFlowHistory((prev) => [
                ...prev.slice(-29),
                {
                  time: timeLabel,
                  flowIn: newReading.flow_in,
                  flowOut: newReading.flow_out,
                  difference: newReading.difference,
                  status: newReading.status,
                },
              ]);
            }
          }
        )
        .subscribe();
    } catch {
      // Realtime gracefully falls back to periodic polling
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Health check polling interval (every 10 seconds)
  useEffect(() => {
    const healthInterval = setInterval(() => {
      refreshHealth();
    }, 10000);
    return () => clearInterval(healthInterval);
  }, [refreshHealth]);

  // Dashboard refresh fallback polling interval
  useEffect(() => {
    const dashboardInterval = setInterval(() => {
      refreshDashboard();
    }, refreshInterval);
    return () => clearInterval(dashboardInterval);
  }, [refreshDashboard, refreshInterval]);

  return (
    <SimulationContext.Provider
      value={{
        isLeakSimulated,
        setLeakSimulated,
        currentReading,
        deviceInfo,
        flowHistory,
        leakEvents,
        lastUpdated,
        refreshInterval,
        setRefreshInterval,
        leakThreshold,
        setLeakThreshold,
        toastMessages,
        dismissToast,
        dbStatus,
        apiStatus,
        dbLastChecked,
        dbError,
        refreshHealth,
        refreshDashboard,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used inside SimulationProvider");
  return ctx;
}
