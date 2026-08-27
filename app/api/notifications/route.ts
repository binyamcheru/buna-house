import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const notifications: any[] = [];

    // 1. Check for new pending orders
    const { data: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pendingOrders && pendingOrders.length > 0) {
      pendingOrders.forEach((order) => {
        const minutesAgo = Math.floor(
          (Date.now() - new Date(order.created_at).getTime()) / 60000
        );

        notifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order',
          message: `Order ${order.order_number} from ${order.customer_name}`,
          time: minutesAgo < 60
            ? `${minutesAgo}m ago`
            : `${Math.floor(minutesAgo / 60)}h ago`,
          timestamp: order.created_at,
          link: `/admin?view=orders&id=${order.id}`,
          read: false,
        });
      });
    }

    // 2. Check for low stock products
    const { data: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, stock')
      .lt('stock', 10)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(3);

    if (lowStockProducts && lowStockProducts.length > 0) {
      lowStockProducts.forEach((product) => {
        notifications.push({
          id: `stock-${product.id}`,
          type: 'stock',
          title: 'Low Stock Alert',
          message: `${product.name} - Only ${product.stock} left`,
          time: 'Now',
          timestamp: new Date().toISOString(),
          link: `/admin?view=products&id=${product.id}`,
          read: false,
        });
      });
    }

    // 3. Check for new newsletter subscribers (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: newSubscribers, count: subscriberCount } = await supabaseAdmin
      .from('newsletter_leads')
      .select('*', { count: 'exact' })
      .gte('subscribed_at', yesterday.toISOString());

    if (subscriberCount && subscriberCount > 0) {
      notifications.push({
        id: `subscribers-${Date.now()}`,
        type: 'subscriber',
        title: 'New Subscribers',
        message: `${subscriberCount} new newsletter subscriber${subscriberCount > 1 ? 's' : ''}`,
        time: 'Today',
        timestamp: new Date().toISOString(),
        link: '/admin?view=leads',
        read: false,
      });
    }

    // 4. Check for new contact form submissions (last 24 hours)
    const { data: newContacts, count: contactCount } = await supabaseAdmin
      .from('contact_leads')
      .select('*', { count: 'exact' })
      .eq('status', 'new')
      .gte('created_at', yesterday.toISOString());

    if (contactCount && contactCount > 0) {
      notifications.push({
        id: `contacts-${Date.now()}`,
        type: 'contact',
        title: 'New Contact Messages',
        message: `${contactCount} unread message${contactCount > 1 ? 's' : ''}`,
        time: 'Today',
        timestamp: new Date().toISOString(),
        link: '/admin?view=leads',
        read: false,
      });
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
