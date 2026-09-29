import {
  getDashboard,
  getSensors,
  getLeakEvents as fetchLeakEvents,
  getDevices,
  getPipelines,
  getAnalytics,
} from "./api";
import {
  mockSensor1Stats,
  mockSensor2Stats,
  generateSensorTableRows,
  type SensorReading,
  type DeviceStatus,
  type PipelineInfo,
  type LeakEvent,
  type FlowDataPoint,
  type SensorStats,
  type SensorTableRow,
  type DailyAnalytic,
} from "./mock-data";

export async function getDashboardData(): Promise<SensorReading> {
  const dash = await getDashboard();
  const isLeak = dash.systemStatus === "LEAK";
  return {
    deviceId: dash.device.deviceId,
    pipelineId: "PIPE-001",
    flowIn: dash.flowIn,
    flowOut: dash.flowOut,
    difference: dash.difference,
    leakThreshold: dash.threshold,
    status: isLeak ? "LEAK" : "NORMAL",
    relayStatus: !isLeak,
    buzzerActive: isLeak,
    wifiSignal: -52,
    wifiSSID: "Lab-IoT-5G",
    timestamp: new Date().toISOString(),
    uptime: "Live DB",
    firmware: dash.device.firmwareVersion || "v1.0.0",
  };
}

export async function getSensorReadings(): Promise<{
  sensor1: SensorStats;
  sensor2: SensorStats;
  tableRows: SensorTableRow[];
}> {
  const readings = await getSensors(50);
  const latest = readings[0];
  const s1Current = latest ? latest.flow_in : 8.4;
  const s2Current = latest ? latest.flow_out : 8.1;

  const rows: SensorTableRow[] = readings.map((r, idx) => ({
    id: r.id || `RDG-${idx + 1}`,
    timestamp: new Date(r.timestamp).toLocaleTimeString(),
    flowIn: r.flow_in,
    flowOut: r.flow_out,
    difference: r.difference,
    status: r.status === "LEAK" ? "LEAK" : "NORMAL",
  }));

  return {
    sensor1: { ...mockSensor1Stats, current: s1Current },
    sensor2: { ...mockSensor2Stats, current: s2Current },
    tableRows: rows.length > 0 ? rows : generateSensorTableRows(20),
  };
}

export async function getLeakEvents(): Promise<LeakEvent[]> {
  const events = await fetchLeakEvents();
  return events.map((e) => ({
    id: e.event_id,
    startTime: e.start_time,
    endTime: e.end_time || undefined,
    flowIn: e.flow_in,
    flowOut: e.flow_out,
    difference: e.difference,
    estimatedLoss: e.estimated_loss,
    status: e.status === "ACTIVE" ? "ACTIVE" : "RESOLVED",
    location: e.pipeline_id || "PIPE-001",
  }));
}

export async function getDeviceStatus(): Promise<DeviceStatus> {
  const devices = await getDevices();
  const dev = devices[0];
  return {
    deviceId: dev?.device_id || "ESP32-001",
    name: dev?.name || "ESP32 WROOM-32",
    connectionStatus: dev?.status === "ONLINE" ? "ONLINE" : "OFFLINE",
    wifiConnected: dev?.status === "ONLINE",
    wifiSSID: "Lab-IoT-5G",
    wifiSignal: -52,
    lastDataReceived: dev?.last_seen ? new Date(dev.last_seen).toLocaleTimeString() : "Never",
    firmware: dev?.firmware_version || "v1.0.0",
    uptime: "2d 14h 32m",
    sensor1Connected: true,
    sensor2Connected: true,
    relayStatus: true,
    buzzerActive: false,
    ipAddress: "192.168.137.1",
    macAddress: "A4:CF:12:7B:31:E0",
  };
}

export async function getPipelineInfo(): Promise<PipelineInfo> {
  const pipelines = await getPipelines();
  const pipe = pipelines[0];
  return {
    pipelineId: pipe?.pipeline_id || "PIPE-001",
    name: pipe?.name || "Demo Pipeline",
    location: pipe?.location || "Engineering Lab, Block A",
    status: pipe?.status === "LEAK" ? "LEAK" : "NORMAL",
    leakThreshold: pipe?.leak_threshold || 1.0,
    sensor1Location: "Inlet (Entry Point)",
    sensor2Location: "Outlet (Exit Point)",
    installDate: "2026-08-15",
    lastMaintenance: "2026-09-10",
  };
}

export async function getFlowHistory(): Promise<FlowDataPoint[]> {
  const dash = await getDashboard();
  return dash.flowHistory || [];
}

export async function getAnalyticsData(days: number = 7): Promise<DailyAnalytic[]> {
  const analytics = await getAnalytics(days);
  return (analytics.dailyAnalytics || []).map((d) => ({
    date: d.date,
    avgFlowIn: d.avgFlowIn,
    avgFlowOut: d.avgFlowOut,
    leakEvents: d.leakEventsCount || 0,
    estimatedLoss: d.estimatedLoss || 0,
    healthScore: Math.max(70, 100 - (d.leakEventsCount || 0) * 10),
  }));
}


