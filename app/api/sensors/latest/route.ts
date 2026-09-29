import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  const pipelineId = searchParams.get("pipelineId");

  try {
    let query = supabase
      .from("sensor_readings")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (deviceId) {
      query = query.eq("device_id", deviceId);
    }
    if (pipelineId) {
      query = query.eq("pipeline_id", pipelineId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No sensor readings available in Supabase.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        deviceId: data.device_id,
        pipelineId: data.pipeline_id,
        flowIn: data.flow_in,
        flowOut: data.flow_out,
        difference: data.difference,
        status: data.status,
        timestamp: data.timestamp,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching latest sensor reading";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

