import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateEmail, validatePhone, validateOrderItems, sanitizeString, sanitizeAddress } from '@/lib/validation';
import { clearAllDashboardCache } from '@/lib/dashboard-cache';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    // Check rate limit: 100 requests/min per IP
    const { allowed, remaining, retryAfter } = checkRateLimit(request);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          }
        }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    // Check rate limit: 100 requests/min per IP
    const { allowed, remaining, retryAfter } = checkRateLimit(request);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          }
        }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
      items,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      notes,
    } = body;

    // Validate required fields (email is now optional)
    if (!customer_name || !customer_phone || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format only if provided
    if (customer_email && !validateEmail(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!validatePhone(customer_phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate order items
    if (!validateOrderItems(items)) {
      return NextResponse.json(
        { error: 'Invalid order items' },
        { status: 400 }
      );
    }

    // Validate total is positive
    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const sanitizedName = sanitizeString(customer_name);
    const sanitizedAddress = sanitizeAddress(customer_address || '');

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Normalize email once; guest checkouts may omit it entirely
    const normalizedEmail = customer_email ? String(customer_email).toLowerCase().trim() : '';

    // Check if customer exists, create if not (skip entirely for guests with no
    // email — matching on an empty string would merge unrelated guests into
    // the same customer record and corrupt their order/spend totals)
    let customerId = null;
    if (normalizedEmail) {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id, total_orders, total_spent')
        .eq('email', normalizedEmail)
        .single();

    if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update customer stats
        await supabaseAdmin
          .from('customers')
          .update({
            total_orders: existingCustomer.total_orders + 1,
            total_spent: parseFloat(existingCustomer.total_spent) + parseFloat(total),
          })
          .eq('id', customerId);
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabaseAdmin
          .from('customers')
          .insert([
            {
              name: customer_name,
              email: normalizedEmail,
              phone: customer_phone,
              address: customer_address || null,
              city: customer_city || null,
              total_orders: 1,
              total_spent: parseFloat(total),
            },
          ])
          .select()
          .single();

        if (customerError) {
          console.error('Error creating customer record:', customerError);
        }
        customerId = newCustomer?.id;
      }
    }

    // Create order with sanitized values
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          customer_id: customerId,
          customer_name: sanitizedName,
          customer_email: normalizedEmail,
          customer_phone: customer_phone.trim(),
          customer_address: sanitizedAddress || null,
          customer_city: sanitizeString(customer_city || ''),
          items,
          subtotal: parseFloat(subtotal),
          delivery_fee: parseFloat(delivery_fee) || 0,
          total: totalNum,
          status: 'pending',
          payment_method: payment_method || null,
          notes: sanitizeString(notes || ''),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // New order changes revenue/order-count stats — don't let the dashboard show stale numbers
    clearAllDashboardCache();

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
