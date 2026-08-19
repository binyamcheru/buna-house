import { rateLimit } from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// Store for tracking requests (in-memory, use Redis in production)
const requestCounts: { [key: string]: { count: number; resetTime: number } } = {};

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Rate limiter: 100 requests per minute per IP
 * Used for /api/orders endpoint
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; retryAfter: number } {
  const clientIP = getClientIP(request);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  // Initialize or get existing counter
  if (!requestCounts[clientIP]) {
    requestCounts[clientIP] = { count: 0, resetTime: now + windowMs };
  }

  const counter = requestCounts[clientIP];

  // Reset if window has passed
  if (now > counter.resetTime) {
    counter.count = 0;
    counter.resetTime = now + windowMs;
  }

  // Increment counter
  counter.count++;

  // Check if limit exceeded
  const allowed = counter.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - counter.count);
  const retryAfter = Math.ceil((counter.resetTime - now) / 1000);

  return { allowed, remaining, retryAfter };
}

/**
 * Cleanup old entries every 5 minutes to prevent memory leak
 */
setInterval(() => {
  const now = Date.now();
  for (const ip in requestCounts) {
    if (now > requestCounts[ip].resetTime + 5 * 60 * 1000) {
      delete requestCounts[ip];
    }
  }
}, 5 * 60 * 1000);
