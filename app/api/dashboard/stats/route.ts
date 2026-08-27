import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDashboardCache, setDashboardCache, CACHE_KEYS, CACHE_TTL } from '@/lib/dashboard-cache';

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedStats = getDashboardCache(CACHE_KEYS.STATS);
    if (cachedStats) {
      console.log('📊 Dashboard stats from cache (faster!)');
      return NextResponse.json(cachedStats);
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get total revenue (sum of all delivered orders)
    const { data: revenueData } = await supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'delivered');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

    // Get total orders count
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get pending orders count
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total customers count
    const { count: totalCustomers } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get recent orders for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group orders by day for chart
    const salesByDay: { [key: string]: number } = {};
    recentOrders?.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      salesByDay[date] = (salesByDay[date] || 0) + parseFloat(order.total);
    });

    const chartData = Object.entries(salesByDay).map(([date, total]) => ({
      date,
      total,
    }));

    // Get popular products (from order items)
    const { data: allOrders } = await supabaseAdmin
      .from('orders')
      .select('items');

    const productCounts: { [key: string]: { name: string; count: number } } = {};

    allOrders?.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const key = item.name || item.id;
          if (productCounts[key]) {
            productCounts[key].count += item.quantity || 1;
          } else {
            productCounts[key] = { name: item.name, count: item.quantity || 1 };
          }
        });
      }
    });

    const popularProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent orders (last 10 orders)
    const { data: latestOrders } = await supabaseAdmin
      .from('orders')
      .select('id, customer_name, items, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Format recent orders with time ago
    const recentOrdersList = latestOrders?.map((order) => {
      const itemCount = Array.isArray(order.items) ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0;
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      let timeAgo = '';
      if (diffMins < 1) {
        timeAgo = 'Just now';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffMins / 1440);
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      }

      return {
        id: `#${order.id}`,
        customer: order.customer_name || 'Guest',
        items: itemCount,
        total: parseFloat(order.total),
        status: order.status,
        time: timeAgo,
      };
    }) || [];

    const statsResponse = {
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
      },
      chartData,
      popularProducts,
      recentOrders: recentOrdersList,
    };

    // Cache the results (5 minute TTL)
    setDashboardCache(CACHE_KEYS.STATS, statsResponse, CACHE_TTL.STATS);

    return NextResponse.json(statsResponse);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
