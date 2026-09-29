import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();

  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("leak_events")
      .select("*")
      .or(`id.eq.${id},event_id.eq.${id}`)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Leak event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching leak event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
