import crypto from 'crypto';

// Secret used to sign stateless CSRF tokens across serverless lambda instances
const CSRF_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXTAUTH_SECRET ||
  'roast-co-csrf-secret-key-salt-2026';

const CSRF_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a new stateless HMAC-signed CSRF token
 * Format: <randomHex>.<timestamp>.<hmacSignature>
 */
export function generateCSRFToken(): string {
  const randomHex = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${randomHex}.${timestamp}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
}

/**
 * Verify stateless HMAC-signed CSRF token
 */
export function verifyCSRFToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [randomHex, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return false;
  }

  // Check if token expired (valid for 30 minutes)
  const age = Date.now() - timestamp;
  if (age < 0 || age > CSRF_EXPIRY_MS) {
    return false;
  }

  const payload = `${randomHex}.${timestampStr}`;
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');

  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

