export type SystemStatus = "NORMAL" | "WARNING" | "LEAK";
export type LeakEventStatus = "ACTIVE" | "RESOLVED";
export type DeviceConnectionStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface Pipeline {
  id?: string;
  pipeline_id: string;
  name: string;
  location?: string;
  leak_threshold: number;
  status: SystemStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  id?: string;
  device_id: string;
  name: string;
  status: DeviceConnectionStatus;
  last_seen?: string | null;
  firmware_version?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SensorReading {
  id?: string;
  device_id: string;
  pipeline_id: string;
  flow_in: number;
  flow_out: number;
  difference: number;
  status: SystemStatus;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeakEvent {
  id?: string;
  event_id: string;
  device_id: string;
  pipeline_id: string;
  start_time: string;
  end_time?: string | null;
  flow_in: number;
  flow_out: number;
  difference: number;
  estimated_loss: number;
  status: LeakEventStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id?: string;
  pipeline_name: string;
  leak_threshold: number;
  refresh_interval: number;
  notifications_enabled: boolean;
  theme: string;
  updated_at?: string;
}

export interface HealthStatus {
  api: "ONLINE" | "OFFLINE";
  database: "CONNECTED" | "DISCONNECTED";
  timestamp: string;
  error?: string;
}

export interface DashboardData {
  systemStatus: SystemStatus;
  flowIn: number;
  flowOut: number;
  difference: number;
  threshold: number;
  pipelineStatus: SystemStatus;
  device: {
    deviceId: string;
    name?: string;
    status: DeviceConnectionStatus;
    lastSeen?: string | null;
    firmwareVersion?: string;
  };
  database: {
    status: "CONNECTED" | "DISCONNECTED";
    error?: string;
  };
  latestReading: SensorReading | null;
  activeLeaks: LeakEvent[];
  recentLeaks: LeakEvent[];
  flowHistory: Array<{
    time: string;
    flowIn: number;
    flowOut: number;
    difference: number;
    status: SystemStatus;
  }>;
}

export interface AnalyticsData {
  avgFlowIn: number;
  avgFlowOut: number;
  avgDifference: number;
  totalReadings: number;
  totalLeakEvents: number;
  estimatedWaterLoss: number;
  dailyAnalytics: Array<{
    date: string;
    avgFlowIn: number;
    avgFlowOut: number;
    avgDifference: number;
    leakEventsCount?: number;
    estimatedLoss?: number;
  }>;
}
