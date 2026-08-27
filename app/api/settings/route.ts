import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all settings
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("setting_key");

    if (error) throw error;

    // Transform to object format and parse JSON strings
    const settings: { [key: string]: any } = {};
    data?.forEach((row) => {
      try {
        // Try to parse as JSON if it's a string
        settings[row.setting_key] = typeof row.setting_value === 'string'
          ? JSON.parse(row.setting_value)
          : row.setting_value;
      } catch {
        // If parsing fails, use the value as-is
        settings[row.setting_key] = row.setting_value;
      }
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { setting_key, setting_value } = body;

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: "setting_key and setting_value are required" },
        { status: 400 }
      );
    }

    // Use UPSERT - insert if not exists, update if exists
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert({
        setting_key,
        setting_value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ setting: data });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
