import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface AdminSession {
  id: string;
  email: string;
  createdAt: number;
}

/**
 * Create a new admin session (database-backed for serverless)
 */
export async function createSession(adminId: string, email: string): Promise<string> {
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  // Store session in database
  const { error } = await supabaseAdmin
    .from('admin_sessions')
    .insert({
      id: sessionId,
      admin_id: adminId,
      email: email,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }

  return sessionId;
}

/**
 * Verify session exists and is valid (database lookup)
 */
export async function verifySession(sessionId: string): Promise<AdminSession | null> {
  if (!sessionId || !supabaseAdmin) {
    return null;
  }

  // Get session from database
  const { data: session, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('id, admin_id, email, expires_at, last_accessed')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return null;
  }

  // Check if session expired
  const now = new Date();
  const expiresAt = new Date(session.expires_at);

  if (now > expiresAt) {
    // Delete expired session
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('id', sessionId);
    return null;
  }

  // Update last accessed time
  await supabaseAdmin
    .from('admin_sessions')
    .update({ last_accessed: now.toISOString() })
    .eq('id', sessionId);

  return {
    id: session.admin_id.toString(),
    email: session.email,
    createdAt: new Date(session.last_accessed).getTime(),
  };
}

/**
 * Destroy session (delete from database)
 */
export async function destroySession(sessionId: string): Promise<void> {
  if (!supabaseAdmin) {
    return;
  }

  await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .eq('id', sessionId);
}

/**
 * Set secure httpOnly cookie with session
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true, // NOT accessible from JavaScript
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/', // Available site-wide
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

/**
 * Get session ID from request cookies
 */
export function getSessionFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Cleanup expired sessions (call this periodically via cron or API route)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  if (!supabaseAdmin) {
    return 0;
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .lt('expires_at', now)
    .select();

  if (error) {
    console.error('Failed to cleanup sessions:', error);
    return 0;
  }

  return data?.length || 0;
}
