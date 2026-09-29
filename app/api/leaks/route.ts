import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const pipeline = searchParams.get("pipeline") || searchParams.get("pipelineId");
  const device = searchParams.get("device") || searchParams.get("deviceId");

  try {
    let query = supabase.from("leak_events").select("*").order("start_time", { ascending: false });

    if (status) {
      query = query.eq("status", status.toUpperCase());
    }
    if (pipeline) {
      query = query.eq("pipeline_id", pipeline);
    }
    if (device) {
      query = query.eq("device_id", device);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching leak events";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
