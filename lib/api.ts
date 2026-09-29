import type {
  HealthStatus,
  DashboardData,
  SensorReading,
  LeakEvent,
  Pipeline,
  Device,
  Settings,
  AnalyticsData,
} from "@/types/database";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getHealth(): Promise<HealthStatus> {
  try {
    return await fetchJson<HealthStatus>("/api/health");
  } catch (err: unknown) {
    return {
      api: "ONLINE",
      database: "DISCONNECTED",
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : "Health check request failed",
    };
  }
}

export async function getDashboard(): Promise<DashboardData> {
  return fetchJson<DashboardData>("/api/dashboard");
}

export async function getSensors(limit: number = 100, pipelineId?: string): Promise<SensorReading[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (pipelineId) params.append("pipelineId", pipelineId);
  const res = await fetchJson<{ success: boolean; data: SensorReading[] }>(`/api/sensors?${params.toString()}`);
  return res.data || [];
}

export async function getLatestSensor(): Promise<SensorReading | null> {
  const res = await fetchJson<{ success: boolean; data: SensorReading | null }>("/api/sensors/latest");
  return res.data;
}

export async function createSensorReading(payload: {
  deviceId?: string;
  pipelineId?: string;
  flowIn: number;
  flowOut: number;
}): Promise<{ success: boolean; data: SensorReading; pipelineStatus: string; leakThreshold: number }> {
  return fetchJson("/api/sensors", {
    method: "POST",
    body: JSON.stringify({
      deviceId: payload.deviceId || "ESP32-001",
      pipelineId: payload.pipelineId || "PIPE-001",
      flowIn: payload.flowIn,
      flowOut: payload.flowOut,
    }),
  });
}

export async function getLeakEvents(status?: string): Promise<LeakEvent[]> {
  const url = status ? `/api/leaks?status=${status}` : "/api/leaks";
  const res = await fetchJson<{ success: boolean; data: LeakEvent[] }>(url);
  return res.data || [];
}

export async function getPipelines(): Promise<Pipeline[]> {
  const res = await fetchJson<{ success: boolean; data: Pipeline[] }>("/api/pipelines");
  return res.data || [];
}

export async function updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
  const res = await fetchJson<{ success: boolean; data: Pipeline }>(`/api/pipelines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getDevices(): Promise<Device[]> {
  const res = await fetchJson<{ success: boolean; data: Device[] }>("/api/devices");
  return res.data || [];
}

export async function getSettings(): Promise<Settings> {
  const res = await fetchJson<{ success: boolean; data: Settings }>("/api/settings");
  return res.data;
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const res = await fetchJson<{ success: boolean; data: Settings }>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getAnalytics(days: number = 7): Promise<AnalyticsData> {
  const res = await fetchJson<{ success: boolean; data: AnalyticsData }>(`/api/analytics?days=${days}`);
  return res.data;
}

export async function triggerSeed(): Promise<{ success: boolean; message: string }> {
  return fetchJson("/api/seed", { method: "POST" });
}
