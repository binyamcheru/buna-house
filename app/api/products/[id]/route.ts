import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

// Remove a product image file, whether it lives on local disk (legacy) or in
// the Supabase Storage "products" bucket. Safe to call with null/undefined.
async function deleteProductImage(imageUrl: string | null | undefined) {
  if (!imageUrl || !supabaseAdmin) return;

  if (imageUrl.startsWith('/uploads/')) {
    try {
      await unlink(join(process.cwd(), 'public', imageUrl));
    } catch (fileError) {
      console.warn('Could not delete local product image:', fileError);
    }
    return;
  }

  const marker = '/storage/v1/object/public/products/';
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const storagePath = imageUrl.slice(markerIndex + marker.length);
  const { error } = await supabaseAdmin.storage.from('products').remove([storagePath]);
  if (error) {
    console.warn('Could not delete storage product image:', error);
  }
}

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, image, stock, featured } = body;

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        image: image || null,
        stock: parseInt(stock) || 0,
        featured: featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    // Clean up the old image if it was replaced with a different one
    if (existingProduct?.image && existingProduct.image !== product.image) {
      await deleteProductImage(existingProduct.image);
    }

    // Return success with cache invalidation flag
    return NextResponse.json({
      product,
      cacheInvalidated: true // Signal to clear client cache
    });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    await deleteProductImage(existingProduct?.image);

    // Return success with cache invalidation flag
    return NextResponse.json({
      message: 'Product deleted successfully',
      cacheInvalidated: true // Signal to clear client cache
    });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
