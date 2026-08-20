import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { generateCSRFToken, verifyCSRFToken } from '@/lib/csrf';
import { createSession, setSessionCookie } from '@/lib/session';

// GET - Generate CSRF token for login form (always fresh, never cached)
export async function GET(request: NextRequest) {
  try {
    const csrfToken = generateCSRFToken();

    // Create response with no-cache headers (Safari iOS fix)
    const response = NextResponse.json({ csrfToken });

    // Prevent caching - force fresh token every time
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Login with CSRF and session
export async function POST(request: NextRequest) {
  try {
    const { email, password, csrfToken } = await request.json();

    // Validate input
    if (!email || !password || !csrfToken) {
      return NextResponse.json(
        { error: 'Email, password, and CSRF token are required' },
        { status: 400 }
      );
    }

    // Verify CSRF token
    if (!verifyCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid or expired CSRF token' },
        { status: 403 }
      );
    }

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query admin user from database (case-insensitive)
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .ilike('email', normalizedEmail)
      .single();

    if (error || !adminUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await verifyPassword(password, adminUser.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = await createSession(adminUser.id, adminUser.email);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
      },
      message: 'Login successful'
    });

    // Set secure httpOnly cookie with session
    setSessionCookie(response, sessionId);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
