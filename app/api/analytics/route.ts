import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Fetch sensor readings
    const { data: readings, error: readingsErr } = await supabase
      .from("sensor_readings")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .order("timestamp", { ascending: true });

    if (readingsErr) {
      return NextResponse.json({ success: false, error: readingsErr.message }, { status: 500 });
    }

    // 2. Fetch leak events
    const { data: leaks, error: leaksErr } = await supabase
      .from("leak_events")
      .select("*")
      .gte("start_time", startDate.toISOString());

    if (leaksErr) {
      return NextResponse.json({ success: false, error: leaksErr.message }, { status: 500 });
    }

    const totalReadings = readings?.length || 0;
    const totalLeakEvents = leaks?.length || 0;

    let sumIn = 0;
    let sumOut = 0;
    let sumDiff = 0;

    readings?.forEach((r) => {
      sumIn += r.flow_in || 0;
      sumOut += r.flow_out || 0;
      sumDiff += r.difference || 0;
    });

    const avgFlowIn = totalReadings > 0 ? parseFloat((sumIn / totalReadings).toFixed(2)) : 0;
    const avgFlowOut = totalReadings > 0 ? parseFloat((sumOut / totalReadings).toFixed(2)) : 0;
    const avgDifference = totalReadings > 0 ? parseFloat((sumDiff / totalReadings).toFixed(2)) : 0;

    const estimatedWaterLoss = parseFloat(
      (leaks?.reduce((acc, l) => acc + (l.estimated_loss || 0), 0) || 0).toFixed(1)
    );

    // Group readings daily
    const dailyMap: Record<string, { count: number; sumIn: number; sumOut: number; sumDiff: number }> = {};

    readings?.forEach((r) => {
      const dateStr = new Date(r.timestamp).toISOString().split("T")[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { count: 0, sumIn: 0, sumOut: 0, sumDiff: 0 };
      }
      dailyMap[dateStr].count += 1;
      dailyMap[dateStr].sumIn += r.flow_in;
      dailyMap[dateStr].sumOut += r.flow_out;
      dailyMap[dateStr].sumDiff += r.difference;
    });

    const dailyAnalytics = Object.entries(dailyMap).map(([date, val]) => ({
      date,
      avgFlowIn: parseFloat((val.sumIn / val.count).toFixed(2)),
      avgFlowOut: parseFloat((val.sumOut / val.count).toFixed(2)),
      avgDifference: parseFloat((val.sumDiff / val.count).toFixed(2)),
    }));

    return NextResponse.json({
      success: true,
      data: {
        avgFlowIn,
        avgFlowOut,
        avgDifference,
        totalReadings,
        totalLeakEvents,
        estimatedWaterLoss,
        dailyAnalytics,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error building analytics from Supabase";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
