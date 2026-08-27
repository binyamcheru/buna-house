import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";

// PUT - Update hero image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request); // Added request parameter
  if (authError) return authError;

  try {
    const { id } = await params;

    console.log("🔵 API PUT - Hero Image ID:", id);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("🔵 API PUT - Body:", body);

    const { title, subtitle, is_active, display_order } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    console.log("🔵 API PUT - Update Data:", updateData);

    const { data, error } = await supabaseAdmin
      .from("hero_images")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ API PUT - Supabase Error:", error);
      throw error;
    }

    console.log("✅ API PUT - Success:", data);

    return NextResponse.json({ image: data });
  } catch (error: any) {
    console.error("❌ Error updating hero image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update hero image" },
      { status: 500 }
    );
  }
}

// DELETE - Delete hero image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request); // Added request parameter
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get image details first
    const { data: image, error: fetchError } = await supabaseAdmin
      .from("hero_images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from("hero_images")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Try to delete the underlying file. Existing rows may still point to a
    // local /uploads path; new uploads live in Supabase Storage.
    if (image?.image_url) {
      if (image.image_url.startsWith("/uploads/")) {
        try {
          const filePath = join(process.cwd(), "public", image.image_url);
          await unlink(filePath);
        } catch (fileError) {
          // File might not exist, continue anyway
          console.warn("Could not delete local image file:", fileError);
        }
      } else {
        const marker = "/storage/v1/object/public/images/";
        const markerIndex = image.image_url.indexOf(marker);
        if (markerIndex !== -1) {
          const storagePath = image.image_url.slice(markerIndex + marker.length);
          const { error: storageError } = await supabaseAdmin.storage
            .from("images")
            .remove([storagePath]);
          if (storageError) {
            console.warn("Could not delete storage image file:", storageError);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting hero image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete hero image" },
      { status: 500 }
    );
  }
}
