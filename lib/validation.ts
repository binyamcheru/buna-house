/**
 * Input validation and sanitization utilities
 * Prevents invalid data and malicious input
 */

// Email validation - RFC 5322 simplified
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

// Phone validation - accepts common formats
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,}$/;

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s/g, '');
  return PHONE_REGEX.test(cleaned) && cleaned.length >= 10;
}

// Price validation - must be positive number
export function validatePrice(price: any): boolean {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0 && num < 1000000; // Max 1 million
}

// Stock validation - must be non-negative integer
export function validateStock(stock: any): boolean {
  const num = parseInt(stock);
  return !isNaN(num) && num >= 0 && num < 1000000;
}

// Name/text validation - prevent very long strings
export function validateName(name: string, maxLength: number = 200): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength;
}

// Sanitize string - remove potentially dangerous characters
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 1000); // Limit length
}

// Sanitize address - allow basic punctuation
export function sanitizeAddress(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 500);
}

// Validate quantity - must be positive integer
export function validateQuantity(qty: any): boolean {
  const num = parseInt(qty);
  return !isNaN(num) && num > 0 && num < 10000;
}

// Validate array of items (for orders)
export function validateOrderItems(items: any): boolean {
  console.log('🔵 Validating order items:', JSON.stringify(items, null, 2));

  if (!Array.isArray(items)) {
    console.log('❌ Items is not an array:', typeof items);
    return false;
  }

  if (items.length === 0) {
    console.log('❌ Items array is empty');
    return false;
  }

  const isValid = items.every((item, index) => {
    console.log(`🔵 Validating item ${index}:`, item);

    if (!item.id) {
      console.log(`❌ Item ${index} missing id:`, item.id);
      return false;
    }

    if (!item.name) {
      console.log(`❌ Item ${index} missing name:`, item.name);
      return false;
    }

    if (typeof item.quantity !== 'number') {
      console.log(`❌ Item ${index} quantity is not a number:`, typeof item.quantity, item.quantity);
      return false;
    }

    if (item.quantity <= 0) {
      console.log(`❌ Item ${index} quantity is not positive:`, item.quantity);
      return false;
    }

    console.log(`✅ Item ${index} is valid`);
    return true;
  });

  console.log('🔵 Overall validation result:', isValid);
  return isValid;
}
