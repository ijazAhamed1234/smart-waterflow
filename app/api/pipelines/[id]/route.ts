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
      .from("pipelines")
      .select("*")
      .or(`id.eq.${id},pipeline_id.eq.${id}`)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching pipeline";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

async function handleUpdate(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();

  try {
    const { id } = await context.params;
    const body = await req.json();

    const { data, error } = await supabase
      .from("pipelines")
      .update(body)
      .or(`id.eq.${id},pipeline_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating pipeline";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
