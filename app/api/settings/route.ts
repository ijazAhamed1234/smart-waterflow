import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();

  try {
    const { data: initialSettings, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    let settings = initialSettings;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!settings) {
      const { data: newSettings } = await supabase
        .from("settings")
        .insert({
          pipeline_name: "SmartFlow Pipeline",
          leak_threshold: 1.0,
          refresh_interval: 5,
          notifications_enabled: true,
          theme: "dark",
        })
        .select()
        .single();
      settings = newSettings;
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return handleUpdateSettings(req);
}

export async function PUT(req: NextRequest) {
  return handleUpdateSettings(req);
}

async function handleUpdateSettings(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();

    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    let resultData;
    if (existing) {
      const { data, error } = await supabase
        .from("settings")
        .update(body)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      resultData = data;
    } else {
      const { data, error } = await supabase
        .from("settings")
        .insert(body)
        .select()
        .single();
      if (error) throw new Error(error.message);
      resultData = data;
    }

    // Sync leak_threshold to pipelines if provided
    if (typeof body.leak_threshold === "number") {
      await supabase
        .from("pipelines")
        .update({ leak_threshold: body.leak_threshold })
        .neq("pipeline_id", "");
    }

    return NextResponse.json({
      success: true,
      data: resultData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
