import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateName, validatePrice, validateStock, sanitizeString } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

// GET all products
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Version': Date.now().toString(),
        }
      }
    );
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    console.log("🔵 API POST /api/products - Request received");

    if (!supabaseAdmin) {
      console.error("❌ Supabase not configured");
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("🔵 API POST - Body received:", body);

    const { name, description, price, category, image, stock, featured } = body;

    // Validate required fields
    if (!name || !price || !category) {
      console.error("❌ Validation failed - missing required fields");
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // Validate name format
    if (!validateName(name, 100)) {
      return NextResponse.json(
        { error: 'Product name must be between 1-100 characters' },
        { status: 400 }
      );
    }

    // Validate price is positive
    if (!validatePrice(price)) {
      return NextResponse.json(
        { error: 'Price must be a positive number less than 1,000,000' },
        { status: 400 }
      );
    }

    // Validate stock is non-negative
    if (!validateStock(stock)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate category
    if (!validateName(category, 50)) {
      return NextResponse.json(
        { error: 'Category must be between 1-50 characters' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = sanitizeString(description || '');
    const sanitizedCategory = sanitizeString(category);

    const insertData = {
      name: sanitizedName,
      description: sanitizedDescription || null,
      price: parseFloat(price),
      category: sanitizedCategory,
      image: image || null,
      stock: parseInt(stock) || 0,
      featured: featured || false,
    };

    console.log("🔵 API POST - Inserting to database:", insertData);

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    console.log("✅ Product created successfully:", product);
    return NextResponse.json({
      product,
      cacheInvalidated: true // Signal to clear client cache
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Products POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
