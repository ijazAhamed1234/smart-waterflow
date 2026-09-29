import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();

  try {
    // 1. Check pipeline
    const { data: initialPipeline, error: pipeErr } = await supabase
      .from("pipelines")
      .select("*")
      .eq("pipeline_id", "PIPE-001")
      .maybeSingle();

    let pipeline = initialPipeline;

    if (pipeErr) {
      return NextResponse.json({
        systemStatus: "UNKNOWN",
        flowIn: 8.5,
        flowOut: 8.2,
        difference: 0.3,
        threshold: 1.0,
        pipelineStatus: "UNKNOWN",
        device: { deviceId: "ESP32-001", status: "OFFLINE", lastSeen: null },
        database: { status: "DISCONNECTED", error: pipeErr.message },
        latestReading: null,
        activeLeaks: [],
        recentLeaks: [],
        flowHistory: [],
      });
    }

    if (!pipeline) {
      const { data: createdPipe } = await supabase
        .from("pipelines")
        .insert({
          pipeline_id: "PIPE-001",
          name: "Main Demo Pipeline",
          location: "Engineering Lab, Block A",
          leak_threshold: 1.0,
          status: "NORMAL",
        })
        .select()
        .single();
      pipeline = createdPipe;
    }

    // 2. Fetch latest reading
    const { data: latestReading } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch device info
    // 3. Fetch device info & calculate dynamic online status (heartbeat timeout: 15s)
    let { data: device } = await supabase
      .from("devices")
      .select("*")
      .eq("device_id", "ESP32-001")
      .maybeSingle();

    if (!device) {
      const { data: createdDevice } = await supabase
        .from("devices")
        .insert({
          device_id: "ESP32-001",
          name: "Pipeline Monitoring Unit",
          status: "OFFLINE",
          firmware_version: "v1.0.0",
          last_seen: null,
        })
        .select()
        .single();
      device = createdDevice;
    }

    const DEVICE_OFFLINE_TIMEOUT_MS = 30000; // 30 seconds heartbeat timeout
    const latestReadingTime = latestReading?.timestamp;
    const devLastSeen = device?.last_seen;

    let effectiveLastSeen = devLastSeen;
    if (latestReadingTime) {
      if (!devLastSeen || new Date(latestReadingTime).getTime() > new Date(devLastSeen).getTime()) {
        effectiveLastSeen = latestReadingTime;
      }
    }

    const isDeviceOnline = effectiveLastSeen
      ? Date.now() - new Date(effectiveLastSeen).getTime() < DEVICE_OFFLINE_TIMEOUT_MS
      : false;
    const calculatedDeviceStatus = isDeviceOnline ? "ONLINE" : "OFFLINE";

    // 4. Fetch Active & Recent Leaks
    const { data: activeLeaks } = await supabase
      .from("leak_events")
      .select("*")
      .eq("status", "ACTIVE")
      .order("start_time", { ascending: false });

    const { data: recentLeaks } = await supabase
      .from("leak_events")
      .select("*")
      .order("start_time", { ascending: false })
      .limit(10);

    // 5. Fetch Flow History (last 30 readings)
    const { data: recentReadings } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(30);

    const flowHistory = (recentReadings || []).slice().reverse().map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      flowIn: r.flow_in,
      flowOut: r.flow_out,
      difference: r.difference,
      status: r.status,
    }));

    const isLeak = pipeline?.status === "LEAK" || latestReading?.status === "LEAK";
    const systemStatus = isLeak ? "LEAK" : "NORMAL";

    return NextResponse.json({
      systemStatus,
      flowIn: latestReading?.flow_in ?? 0,
      flowOut: latestReading?.flow_out ?? 0,
      difference: latestReading?.difference ?? 0,
      threshold: pipeline?.leak_threshold ?? 1.0,
      pipelineStatus: pipeline?.status || "NORMAL",
      activeLeakCount: (activeLeaks || []).length,
      latestLeakEvent: (recentLeaks || [])[0] || null,
      device: {
        deviceId: device?.device_id || "ESP32-001",
        name: device?.name || "Pipeline Monitoring Unit",
        status: calculatedDeviceStatus,
        lastSeen: effectiveLastSeen || null,
        firmwareVersion: device?.firmware_version || "v1.0.0",
      },
      database: {
        status: "CONNECTED",
      },
      latestReading: latestReading || null,
      activeLeaks: activeLeaks || [],
      recentLeaks: recentLeaks || [],
      flowHistory,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching dashboard from Supabase";
    return NextResponse.json({
      systemStatus: "UNKNOWN",
      flowIn: 8.5,
      flowOut: 8.2,
      difference: 0.3,
      threshold: 1.0,
      pipelineStatus: "UNKNOWN",
      device: { deviceId: "ESP32-001", status: "OFFLINE", lastSeen: null },
      database: { status: "DISCONNECTED", error: message },
      latestReading: null,
      activeLeaks: [],
      recentLeaks: [],
      flowHistory: [],
    });
  }
}
