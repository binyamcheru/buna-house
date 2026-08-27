import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all hero images
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("hero_images")
      .select("*")
      .order("display_order");

    if (error) throw error;

    return NextResponse.json({ images: data || [] });
  } catch (error: any) {
    console.error("Error fetching hero images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}

// POST - Upload new hero image
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request); // Added request parameter
  if (authError) return authError;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const label = formData.get("label") as string;
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `hero-${timestamp}.${fileExt}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage (survives serverless/Vercel deploys, unlike local disk)
    const storagePath = `hero-images/${fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("images")
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(storagePath);

    // Get next display order
    const { data: maxOrder } = await supabaseAdmin
      .from("hero_images")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.display_order || 0) + 1;

    // Save to database
    const { data, error } = await supabaseAdmin
      .from("hero_images")
      .insert({
        label: label || null,
        title: title || null,
        subtitle: subtitle || null,
        image_url: urlData.publicUrl,
        display_order: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error: any) {
    console.error("Error uploading hero image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
