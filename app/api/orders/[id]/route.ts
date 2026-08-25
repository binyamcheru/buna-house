import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidStatusTransition, OrderStatus } from '@/lib/order-state-machine';
import { requireAuth } from '@/lib/auth';
import { clearAllDashboardCache } from '@/lib/dashboard-cache';

/**
 * PATCH /api/orders/[id] - Update order status with state machine validation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError; // authError is already NextResponse

    const { id } = await params;
    const { status: newStatus } = await request.json();

    if (!id || !newStatus) {
      return NextResponse.json(
        { error: 'Order ID and new status are required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get current order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate state transition
    const currentStatus = order.status as OrderStatus;
    const targetStatus = newStatus as OrderStatus;

    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${targetStatus}` },
        { status: 400 }
      );
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Clear dashboard cache so revenue updates immediately
    clearAllDashboardCache();

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id] - Delete order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError; // authError is already NextResponse

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch the order first so we can roll back the linked customer's stats
    const { data: orderToDelete } = await supabaseAdmin
      .from('orders')
      .select('customer_id, total')
      .eq('id', id)
      .single();

    // Delete order
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting order:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      );
    }

    // Roll back the customer's total_orders/total_spent so deleted orders
    // don't leave their stats permanently inflated
    if (orderToDelete?.customer_id) {
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', orderToDelete.customer_id)
        .single();

      if (customer) {
        await supabaseAdmin
          .from('customers')
          .update({
            total_orders: Math.max(0, (customer.total_orders || 0) - 1),
            total_spent: Math.max(0, parseFloat(customer.total_spent) - parseFloat(orderToDelete.total)),
          })
          .eq('id', orderToDelete.customer_id);
      }
    }

    // Deleted order changes revenue/order-count stats — clear stale cache
    clearAllDashboardCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
