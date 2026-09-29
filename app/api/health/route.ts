import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();

  try {
    const { error } = await supabase.from("pipelines").select("pipeline_id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          api: "ONLINE",
          database: "DISCONNECTED",
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      api: "ONLINE",
      database: "CONNECTED",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Supabase health check failed";
    return NextResponse.json(
      {
        api: "ONLINE",
        database: "DISCONNECTED",
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 503 }
    );
  }
}
