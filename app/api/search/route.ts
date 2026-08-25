import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { searchProducts } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query too short. Minimum 2 characters required.'
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: any[] = [];

    // 1. Search Products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, category, price, stock')
      .or(`name.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .limit(5);

    if (products && products.length > 0) {
      products.forEach((product) => {
        results.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `${product.category} • Br ${product.price} • Stock: ${product.stock}`,
          link: '/admin?view=products',
          icon: 'package'
        });
      });
    }

    // 2. Search Orders
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, customer_email, total, status')
      .or(`order_number.ilike.${searchTerm},customer_name.ilike.${searchTerm},customer_email.ilike.${searchTerm}`)
      .limit(5);

    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        results.push({
          id: order.id,
          type: 'order',
          title: order.order_number,
          subtitle: `${order.customer_name} • Br ${order.total} • ${order.status}`,
          link: '/admin?view=orders',
          icon: 'shopping-bag'
        });
      });
    }

    // 3. Search Customers
    const { data: customers } = await supabaseAdmin
      .from('customers')
      .select('id, name, email, phone, total_orders')
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .limit(5);

    if (customers && customers.length > 0) {
      customers.forEach((customer) => {
        results.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: `${customer.email} • ${customer.total_orders} orders`,
          link: '/admin?view=customers',
          icon: 'user'
        });
      });
    }

    return NextResponse.json({
      results,
      query,
      count: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
