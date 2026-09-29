// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemStatus = "NORMAL" | "WARNING" | "LEAK";
export type LeakEventStatus = "ACTIVE" | "RESOLVED" | "WARNING";
export type DeviceConnectionStatus = "ONLINE" | "OFFLINE" | "CONNECTING";

export interface SensorReading {
  deviceId: string;
  pipelineId: string;
  flowIn: number;
  flowOut: number;
  difference: number;
  leakThreshold: number;
  status: SystemStatus;
  relayStatus: boolean;
  buzzerActive: boolean;
  wifiSignal: number; // dBm
  wifiSSID: string;
  timestamp: string;
  uptime: string;
  firmware: string;
}

export interface LeakEvent {
  id: string;
  startTime: string;
  endTime?: string;
  flowIn: number;
  flowOut: number;
  difference: number;
  estimatedLoss: number; // liters
  status: LeakEventStatus;
  duration?: string;
  location: string;
}

export interface FlowDataPoint {
  time: string;
  flowIn: number;
  flowOut: number;
  difference: number;
}

export interface DeviceStatus {
  deviceId: string;
  name: string;
  connectionStatus: DeviceConnectionStatus;
  wifiConnected: boolean;
  wifiSSID: string;
  wifiSignal: number;
  lastDataReceived: string;
  firmware: string;
  uptime: string;
  sensor1Connected: boolean;
  sensor2Connected: boolean;
  relayStatus: boolean;
  buzzerActive: boolean;
  ipAddress: string;
  macAddress: string;
}

export interface PipelineInfo {
  pipelineId: string;
  name: string;
  location: string;
  status: SystemStatus;
  leakThreshold: number;
  sensor1Location: string;
  sensor2Location: string;
  installDate: string;
  lastMaintenance: string;
}

// ─── Normal mock reading ──────────────────────────────────────────────────────

export const mockNormalReading: SensorReading = {
  deviceId: "ESP32-001",
  pipelineId: "PIPE-001",
  flowIn: 8.4,
  flowOut: 8.1,
  difference: 0.3,
  leakThreshold: 1.0,
  status: "NORMAL",
  relayStatus: true,
  buzzerActive: false,
  wifiSignal: -52,
  wifiSSID: "Lab-IoT-5G",
  timestamp: new Date().toISOString(),
  uptime: "2d 14h 32m",
  firmware: "v1.0.0",
};

// ─── Leak mock reading ───────────────────────────────────────────────────────

export const mockLeakReading: SensorReading = {
  deviceId: "ESP32-001",
  pipelineId: "PIPE-001",
  flowIn: 8.4,
  flowOut: 5.9,
  difference: 2.5,
  leakThreshold: 1.0,
  status: "LEAK",
  relayStatus: false,
  buzzerActive: true,
  wifiSignal: -52,
  wifiSSID: "Lab-IoT-5G",
  timestamp: new Date().toISOString(),
  uptime: "2d 14h 32m",
  firmware: "v1.0.0",
};

// ─── Device status ───────────────────────────────────────────────────────────

export const mockDeviceStatus: DeviceStatus = {
  deviceId: "ESP32-001",
  name: "ESP32 WROOM-32",
  connectionStatus: "ONLINE",
  wifiConnected: true,
  wifiSSID: "Lab-IoT-5G",
  wifiSignal: -52,
  lastDataReceived: "2 seconds ago",
  firmware: "v1.0.0",
  uptime: "2d 14h 32m",
  sensor1Connected: true,
  sensor2Connected: true,
  relayStatus: true,
  buzzerActive: false,
  ipAddress: "192.168.1.105",
  macAddress: "A4:CF:12:7B:31:E0",
};

// ─── Pipeline info ───────────────────────────────────────────────────────────

export const mockPipeline: PipelineInfo = {
  pipelineId: "PIPE-001",
  name: "Demo Pipeline",
  location: "Engineering Lab, Block A",
  status: "NORMAL",
  leakThreshold: 1.0,
  sensor1Location: "Inlet (Entry Point)",
  sensor2Location: "Outlet (Exit Point)",
  installDate: "2026-08-15",
  lastMaintenance: "2026-09-10",
};

// ─── Recent leak events ───────────────────────────────────────────────────────

export const mockLeakEvents: LeakEvent[] = [
  {
    id: "EVT-009",
    startTime: "2026-09-20T10:42:00",
    flowIn: 8.5,
    flowOut: 8.2,
    difference: 0.3,
    estimatedLoss: 0,
    status: "RESOLVED",
    location: "PIPE-001",
  },
  {
    id: "EVT-008",
    startTime: "2026-09-20T10:35:00",
    endTime: "2026-09-20T10:38:00",
    flowIn: 8.6,
    flowOut: 6.1,
    difference: 2.5,
    estimatedLoss: 27.3,
    status: "RESOLVED",
    duration: "3 min",
    location: "PIPE-001",
  },
  {
    id: "EVT-007",
    startTime: "2026-09-20T10:20:00",
    flowIn: 8.2,
    flowOut: 8.0,
    difference: 0.2,
    estimatedLoss: 0,
    status: "RESOLVED",
    location: "PIPE-001",
  },
  {
    id: "EVT-006",
    startTime: "2026-09-20T09:15:00",
    endTime: "2026-09-20T09:22:00",
    flowIn: 8.7,
    flowOut: 5.8,
    difference: 2.9,
    estimatedLoss: 48.3,
    status: "RESOLVED",
    duration: "7 min",
    location: "PIPE-001",
  },
  {
    id: "EVT-005",
    startTime: "2026-09-19T22:11:00",
    endTime: "2026-09-19T22:14:00",
    flowIn: 8.3,
    flowOut: 7.1,
    difference: 1.2,
    estimatedLoss: 10.8,
    status: "RESOLVED",
    duration: "3 min",
    location: "PIPE-001",
  },
  {
    id: "EVT-004",
    startTime: "2026-09-19T17:44:00",
    flowIn: 8.4,
    flowOut: 8.3,
    difference: 0.1,
    estimatedLoss: 0,
    status: "RESOLVED",
    location: "PIPE-001",
  },
  {
    id: "EVT-003",
    startTime: "2026-09-19T14:02:00",
    endTime: "2026-09-19T14:08:00",
    flowIn: 8.5,
    flowOut: 6.4,
    difference: 2.1,
    estimatedLoss: 37.8,
    status: "RESOLVED",
    duration: "6 min",
    location: "PIPE-001",
  },
  {
    id: "EVT-002",
    startTime: "2026-09-18T08:30:00",
    endTime: "2026-09-18T08:32:00",
    flowIn: 8.1,
    flowOut: 7.0,
    difference: 1.1,
    estimatedLoss: 7.2,
    status: "RESOLVED",
    duration: "2 min",
    location: "PIPE-001",
  },
  {
    id: "EVT-001",
    startTime: "2026-09-17T11:15:00",
    endTime: "2026-09-17T11:20:00",
    flowIn: 8.9,
    flowOut: 5.5,
    difference: 3.4,
    estimatedLoss: 102.0,
    status: "RESOLVED",
    duration: "5 min",
    location: "PIPE-001",
  },
];

// ─── Generate 30-minute chart history ────────────────────────────────────────

export function generateFlowHistory(isLeak: boolean = false): FlowDataPoint[] {
  const points: FlowDataPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const label = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const baseIn = 8.0 + Math.random() * 0.8;
    let baseOut: number;

    // Simulate leak for the last 5 minutes if leak mode
    if (isLeak && i < 5) {
      baseOut = 5.5 + Math.random() * 0.5;
    } else {
      baseOut = baseIn - 0.1 - Math.random() * 0.3;
    }

    const flowIn = parseFloat(baseIn.toFixed(2));
    const flowOut = parseFloat(baseOut.toFixed(2));

    points.push({
      time: label,
      flowIn,
      flowOut,
      difference: parseFloat((flowIn - flowOut).toFixed(2)),
    });
  }

  return points;
}

// ─── Analytics mock data ──────────────────────────────────────────────────────

export interface DailyAnalytic {
  date: string;
  avgFlowIn: number;
  avgFlowOut: number;
  leakEvents: number;
  estimatedLoss: number;
  healthScore: number;
}

export function generateDailyAnalytics(days: number): DailyAnalytic[] {
  const data: DailyAnalytic[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const leakEvents = Math.floor(Math.random() * 3);
    data.push({
      date: label,
      avgFlowIn: parseFloat((8.0 + Math.random() * 0.8).toFixed(2)),
      avgFlowOut: parseFloat((7.7 + Math.random() * 0.8).toFixed(2)),
      leakEvents,
      estimatedLoss: parseFloat((leakEvents * (5 + Math.random() * 20)).toFixed(1)),
      healthScore: parseFloat((95 - leakEvents * 5 + Math.random() * 3).toFixed(1)),
    });
  }

  return data;
}

// ─── Sensor stats ─────────────────────────────────────────────────────────────

export interface SensorStats {
  sensorId: string;
  name: string;
  current: number;
  min: number;
  max: number;
  average: number;
  unit: string;
}

export const mockSensor1Stats: SensorStats = {
  sensorId: "YF-S201-01",
  name: "Flow Sensor 1 (Inlet)",
  current: 8.4,
  min: 7.8,
  max: 9.1,
  average: 8.3,
  unit: "L/min",
};

export const mockSensor2Stats: SensorStats = {
  sensorId: "YF-S201-02",
  name: "Flow Sensor 2 (Outlet)",
  current: 8.1,
  min: 7.5,
  max: 8.9,
  average: 8.0,
  unit: "L/min",
};

// ─── Sensor readings table ───────────────────────────────────────────────────

export interface SensorTableRow {
  id: string;
  timestamp: string;
  flowIn: number;
  flowOut: number;
  difference: number;
  status: SystemStatus;
}

export function generateSensorTableRows(count: number = 20): SensorTableRow[] {
  const rows: SensorTableRow[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const t = new Date(now.getTime() - i * 30 * 1000);
    const flowIn = parseFloat((8.0 + Math.random() * 0.9).toFixed(2));
    const flowOut = parseFloat((7.6 + Math.random() * 0.9).toFixed(2));
    const diff = parseFloat((flowIn - flowOut).toFixed(2));
    rows.push({
      id: `RDG-${String(count - i).padStart(3, "0")}`,
      timestamp: t.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      flowIn,
      flowOut,
      difference: diff,
      status: diff > 1.5 ? "LEAK" : diff > 1.0 ? "WARNING" : "NORMAL",
    });
  }

  return rows;
}
