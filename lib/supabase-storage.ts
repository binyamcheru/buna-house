import { supabase } from './supabase';

// Upload image to Supabase Storage
export async function uploadImage(file: File, folder: 'products' | 'hero-images'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images') // Bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

// Delete image from Supabase Storage
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const path = url.split('/storage/v1/object/public/images/')[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
