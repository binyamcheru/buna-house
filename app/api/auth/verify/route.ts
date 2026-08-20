import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, verifySession } from '@/lib/session';

/**
 * GET /api/auth/verify - Verify if user has valid session
 * Returns user data if authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionFromRequest(request);

    if (!sessionId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionId);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
      }
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
