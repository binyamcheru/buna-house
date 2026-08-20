import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, verifySession } from '@/lib/session';

// Portfolio demo account: can log in and browse every admin view, but all
// mutating requests are blocked below so visitors can't alter or wipe real data.
export const DEMO_ADMIN_EMAIL = 'demo@bunahouse.et';

/**
 * Middleware to verify admin session from secure cookie
 * Used to protect admin endpoints
 * Returns NextResponse error or null if authenticated
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const sessionId = getSessionFromRequest(request);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized - session cookie missing' },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - session invalid or expired' },
        { status: 401 }
      );
    }

    // Read-only demo account — allow GET requests, block every mutation
    if (request.method !== 'GET' && session.email.toLowerCase() === DEMO_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Demo mode: changes are disabled on this portfolio preview account.' },
        { status: 403 }
      );
    }

    return null; // Success - no error
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to check auth in API routes
 * Usage in API route:
 *   const auth = await requireAuth(request);
 *   if ('error' in auth) return auth.error;
 *   const { session } = auth;
 */
export async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  const auth = await requireAuth(request);
  return auth === null; // null means success (no error response)
}

/**
 * Client-side auth check (for use in Client Components)
 * Calls API to verify session since httpOnly cookies can't be read by JS
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/auth/verify', {
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get current admin user from API
 * Returns user data if authenticated, null otherwise
 */
export async function getAdminUser(): Promise<{ id: string; email: string } | null> {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/auth/verify', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user || null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  return null;
}

/**
 * Logout - clear session cookie and all cached data
 * Safari iOS fix: Force clear all cookies client-side
 */
export async function logout(): Promise<void> {
  try {
    // Clear server-side session
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

    // Force clear all cookies client-side (Safari iOS fix)
    if (typeof window !== 'undefined') {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Clear for parent domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      });

      // Clear any cached storage
      localStorage.clear();
      sessionStorage.clear();

      console.log('✅ All cookies and cache cleared');

      // Redirect to login with cache-bust parameter
      window.location.href = `/admin/login?t=${Date.now()}`;
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even on error
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
}
