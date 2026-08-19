import { supabaseAdmin } from './supabase';

/**
 * Search products by name, description, or category
 * Uses database queries instead of frontend filtering
 * Much faster for 100+ products
 */
export async function searchProducts(query: string, limit: number = 20) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  if (!supabaseAdmin) {
    console.error('Supabase not configured');
    return [];
  }

  try {
    const searchTerm = `%${query.toLowerCase()}%`;

    // Use PostgreSQL ILIKE for case-insensitive search
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Search exception:', error);
    return [];
  }
}

/**
 * Filter products by category
 */
export async function filterByCategory(category: string) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('Category filter error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Category filter exception:', error);
    return [];
  }
}

/**
 * Filter products by price range
 */
export async function filterByPriceRange(minPrice: number, maxPrice: number) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('price', { ascending: true });

    if (error) {
      console.error('Price filter error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Price filter exception:', error);
    return [];
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 10) {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(limit);

    if (error) {
      console.error('Featured products error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Featured products exception:', error);
    return [];
  }
}
