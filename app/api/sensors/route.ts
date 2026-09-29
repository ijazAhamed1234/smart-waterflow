import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const pipelineId = searchParams.get("pipelineId");
  const deviceId = searchParams.get("deviceId");

  try {
    let query = supabase.from("sensor_readings").select("*").order("timestamp", { ascending: false }).limit(limit);

    if (pipelineId) {
      query = query.eq("pipeline_id", pipelineId);
    }
    if (deviceId) {
      query = query.eq("device_id", deviceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching sensor readings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("[SUPABASE] URL configured:", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.log("[SUPABASE] Secret key configured:", Boolean(process.env.SUPABASE_SECRET_KEY));
  console.log("[API /api/sensors] POST request received");

  const supabase = createServerClient();

  try {
    console.log("[API /api/sensors] Parsing request body");
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid sensor payload" }, { status: 400 });
    }

    console.log("[API /api/sensors] Payload:", body);

    const { deviceId, pipelineId, flowIn, flowOut } = body || {};

    // Validate required fields (allowing flowIn/flowOut = 0)
    if (
      !deviceId ||
      typeof deviceId !== "string" ||
      !pipelineId ||
      typeof pipelineId !== "string" ||
      typeof flowIn !== "number" ||
      isNaN(flowIn) ||
      typeof flowOut !== "number" ||
      isNaN(flowOut)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid sensor payload" },
        { status: 400 }
      );
    }

    // Find pipeline by pipeline_id
    const { data: pipeline, error: pipeErr } = await supabase
      .from("pipelines")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .maybeSingle();

    if (pipeErr) {
      console.error("[SUPABASE ERROR]", pipeErr);
      return NextResponse.json({ success: false, error: pipeErr.message }, { status: 500 });
    }

    if (!pipeline) {
      return NextResponse.json(
        { success: false, error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const leakThreshold = Number(pipeline.leak_threshold ?? 1.0);

    // Calculate difference = max(flowIn - flowOut, 0)
    const difference = Math.max(Number(flowIn) - Number(flowOut), 0);

    // Calculate status authoritatively using database pipeline threshold
    const status = difference >= leakThreshold ? "LEAK" : "NORMAL";
    const timestamp = new Date().toISOString();

    // Insert into sensor_readings
    console.log("[API /api/sensors] Inserting sensor reading...");
    const { data: newReading, error: readingErr } = await supabase
      .from("sensor_readings")
      .insert({
        device_id: deviceId,
        pipeline_id: pipelineId,
        flow_in: Number(flowIn),
        flow_out: Number(flowOut),
        difference: difference,
        status: status,
        timestamp: timestamp,
      })
      .select()
      .single();

    if (readingErr) {
      console.error("[API /api/sensors] Sensor insert error:", readingErr);
      console.error("[SUPABASE ERROR]", readingErr);
      return NextResponse.json({ success: false, error: readingErr.message }, { status: 500 });
    }

    console.log("[API /api/sensors] Sensor reading inserted");

    // Update device heartbeat and status
    console.log("[API /api/sensors] Updating device heartbeat...");
    const { error: deviceErr } = await supabase.from("devices").upsert(
      {
        device_id: deviceId,
        name: "Pipeline Monitoring Unit",
        status: "ONLINE",
        last_seen: timestamp,
        updated_at: timestamp,
        firmware_version: "v1.0.0",
      },
      { onConflict: "device_id" }
    );

    if (deviceErr) {
      console.error("[SUPABASE ERROR]", deviceErr);
    } else {
      console.log("[API /api/sensors] Device heartbeat updated");
    }

    // Update pipeline status
    const { error: pipeUpdateErr } = await supabase
      .from("pipelines")
      .update({ status: status, updated_at: timestamp })
      .eq("pipeline_id", pipelineId);

    if (pipeUpdateErr) {
      console.error("[SUPABASE ERROR]", pipeUpdateErr);
    }

    // Manage leak events
    if (status === "LEAK") {
      const { data: activeEvent, error: activeErr } = await supabase
        .from("leak_events")
        .select("*")
        .eq("device_id", deviceId)
        .eq("pipeline_id", pipelineId)
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (activeErr) {
        console.error("[SUPABASE ERROR]", activeErr);
      }

      if (!activeEvent) {
        const eventId = `EVT-${Date.now().toString().slice(-6)}`;
        const { error: insertEvtErr } = await supabase.from("leak_events").insert({
          event_id: eventId,
          device_id: deviceId,
          pipeline_id: pipelineId,
          start_time: timestamp,
          flow_in: Number(flowIn),
          flow_out: Number(flowOut),
          difference: difference,
          estimated_loss: 0,
          status: "ACTIVE",
        });
        if (insertEvtErr) {
          console.error("[SUPABASE ERROR]", insertEvtErr);
        }
      } else {
        const { error: updateEvtErr } = await supabase
          .from("leak_events")
          .update({
            flow_in: Number(flowIn),
            flow_out: Number(flowOut),
            difference: Math.max(activeEvent.difference || 0, difference),
          })
          .eq("id", activeEvent.id);
        if (updateEvtErr) {
          console.error("[SUPABASE ERROR]", updateEvtErr);
        }
      }
    } else {
      // status === "NORMAL" -> resolve active leak event if present
      const { data: activeEvent, error: activeErr } = await supabase
        .from("leak_events")
        .select("*")
        .eq("device_id", deviceId)
        .eq("pipeline_id", pipelineId)
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (activeErr) {
        console.error("[SUPABASE ERROR]", activeErr);
      }

      if (activeEvent) {
        const endTime = new Date();
        const startTime = new Date(activeEvent.start_time);
        const durationMinutes = Math.max(1, (endTime.getTime() - startTime.getTime()) / (1000 * 60));
        const estimatedLoss = parseFloat((durationMinutes * (activeEvent.difference || difference)).toFixed(2));

        const { error: resolveEvtErr } = await supabase
          .from("leak_events")
          .update({
            end_time: endTime.toISOString(),
            status: "RESOLVED",
            estimated_loss: Math.max(0.1, estimatedLoss),
          })
          .eq("id", activeEvent.id);
        if (resolveEvtErr) {
          console.error("[SUPABASE ERROR]", resolveEvtErr);
        }
      }
    }

    console.log("[API /api/sensors] Request completed successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Sensor reading stored successfully",
        data: {
          deviceId: deviceId,
          pipelineId: pipelineId,
          flowIn: Number(flowIn),
          flowOut: Number(flowOut),
          difference: difference,
          status: status,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing sensor reading";
    console.error("[API /api/sensors] Server error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


