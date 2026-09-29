import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase.from("pipelines").select("*");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching pipelines";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();

    const { data, error } = await supabase.from("pipelines").insert(body).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating pipeline";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
