import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  return seedSupabase();
}

export async function GET() {
  return seedSupabase();
}

async function seedSupabase() {
  const supabase = createServerClient();

  try {
    // 1. Truncate / delete existing rows
    await supabase.from("sensor_readings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("leak_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("pipelines").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("devices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Insert Pipeline
    const { data: pipe } = await supabase
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

    // 3. Insert Device (Initial state: OFFLINE until first sensor reading is received)
    const { data: dev } = await supabase
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

    // 4. Insert Settings
    await supabase.from("settings").insert({
      pipeline_name: "Main Demo Pipeline",
      leak_threshold: 1.0,
      refresh_interval: 5,
      notifications_enabled: true,
      theme: "dark",
    });

    // 5. Insert Sensor Readings
    const readings = [];
    const now = Date.now();
    const minute = 60 * 1000;

    for (let i = 25; i >= 1; i--) {
      const flowIn = parseFloat((8.5 + (Math.random() * 0.4 - 0.2)).toFixed(2));
      const flowOut = parseFloat((8.2 + (Math.random() * 0.4 - 0.2)).toFixed(2));
      const diff = Math.max(0, parseFloat((flowIn - flowOut).toFixed(2)));
      readings.push({
        device_id: "ESP32-001",
        pipeline_id: "PIPE-001",
        flow_in: flowIn,
        flow_out: flowOut,
        difference: diff,
        status: diff >= 1.0 ? "LEAK" : "NORMAL",
        timestamp: new Date(now - i * 2 * minute).toISOString(),
      });
    }

    await supabase.from("sensor_readings").insert(readings);

    // 6. Insert Leak Events
    await supabase.from("leak_events").insert([
      {
        event_id: "EVT-001",
        device_id: "ESP32-001",
        pipeline_id: "PIPE-001",
        start_time: new Date(now - 120 * minute).toISOString(),
        end_time: new Date(now - 105 * minute).toISOString(),
        flow_in: 8.5,
        flow_out: 5.8,
        difference: 2.7,
        estimated_loss: 40.5,
        status: "RESOLVED",
      },
      {
        event_id: "EVT-002",
        device_id: "ESP32-001",
        pipeline_id: "PIPE-001",
        start_time: new Date(now - 15 * minute).toISOString(),
        end_time: new Date(now - 5 * minute).toISOString(),
        flow_in: 8.6,
        flow_out: 5.4,
        difference: 3.2,
        estimated_loss: 32.0,
        status: "RESOLVED",
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Supabase PostgreSQL seeded successfully",
      pipeline: pipe?.pipeline_id,
      device: dev?.device_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Seeding Supabase failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
