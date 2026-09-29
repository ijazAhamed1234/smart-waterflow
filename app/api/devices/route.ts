import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();

  try {
    const { data: devices, error: devErr } = await supabase.from("devices").select("*");

    if (devErr) {
      return NextResponse.json({ success: false, error: devErr.message }, { status: 500 });
    }

    // Fetch latest reading for each device to handle direct Supabase REST insertions
    const { data: latestReadings } = await supabase
      .from("sensor_readings")
      .select("device_id, timestamp")
      .order("timestamp", { ascending: false })
      .limit(50);

    const latestTimestampByDevice: Record<string, string> = {};
    (latestReadings || []).forEach((r) => {
      if (r.device_id && !latestTimestampByDevice[r.device_id]) {
        latestTimestampByDevice[r.device_id] = r.timestamp;
      }
    });

    const DEVICE_OFFLINE_TIMEOUT_MS = 30000;
    const formattedDevices = (devices || []).map((dev) => {
      const devLastSeen = dev.last_seen;
      const readingLastSeen = latestTimestampByDevice[dev.device_id];

      // Pick the most recent timestamp between devices.last_seen and latest sensor_readings
      let effectiveLastSeen = devLastSeen;
      if (readingLastSeen) {
        if (!devLastSeen || new Date(readingLastSeen).getTime() > new Date(devLastSeen).getTime()) {
          effectiveLastSeen = readingLastSeen;
        }
      }

      const isOnline = effectiveLastSeen
        ? Date.now() - new Date(effectiveLastSeen).getTime() < DEVICE_OFFLINE_TIMEOUT_MS
        : false;

      return {
        ...dev,
        last_seen: effectiveLastSeen,
        status: isOnline ? "ONLINE" : "OFFLINE",
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedDevices.length,
      data: formattedDevices,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching devices";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("devices")
      .upsert(body, { onConflict: "device_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error upserting device";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
