import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, clearSessionCookie, destroySession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionFromRequest(request);

    if (sessionId) {
      // Destroy session server-side
      await destroySession(sessionId);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear secure cookie
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
