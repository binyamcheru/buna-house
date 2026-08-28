/**
 * Telegram messaging utilities for order notifications
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

/**
 * Generate a Telegram deep link to message a customer by phone number.
 * Note: Telegram phone-number links don't support a pre-filled message like
 * WhatsApp's wa.me does, so the status message is copied to the clipboard
 * (see sendTelegramMessage) for the admin to paste into the chat.
 */
export function getTelegramLink(phone: string): string {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Add Ethiopia country code if not present
  const formattedPhone = cleanPhone.startsWith('+251')
    ? cleanPhone
    : cleanPhone.startsWith('251')
    ? '+' + cleanPhone
    : cleanPhone.startsWith('0')
    ? '+251' + cleanPhone.substring(1) // Replace leading 0 with +251
    : '+251' + cleanPhone;

  // Return Telegram link (opens a chat with the number, if discoverable)
  return `https://t.me/${formattedPhone}`;
}

/**
 * Get pre-filled message template based on order status
 */
export function getTelegramMessage(orderNumber: string, status: OrderStatus): string {
  const messages = {
    pending: `Selam!
Your order *${orderNumber}* has been received.
We'll confirm shortly. ☕

*Buna House*`,

    confirmed: `Selam!
Your order *${orderNumber}* has been confirmed! ✅

We're preparing your delicious coffee now.
Estimated time: 20-30 minutes ⏰

*Buna House*`,

    preparing: `Selam!
Your order *${orderNumber}* is being prepared! 👨‍🍳

Our baristas are crafting your coffee with care. ☕
Almost ready!

*Buna House*`,

    ready: `Selam!
Your order *${orderNumber}* is ready! ✅

Our delivery rider is on the way to you. 🚚
Please keep your phone nearby.

*Buna House*`,

    delivered: `Selam!
Thank you for ordering from Buna House! ❤️

We hope you enjoy your coffee! ☕
Order *${orderNumber}* has been delivered.

Rate us: [link to review]

*Buna House*`,

    cancelled: `Selam!
Your order *${orderNumber}* has been cancelled.

If you have any questions, please call us.
We apologize for the inconvenience.

*Buna House*`,
  };

  return messages[status] || messages.pending;
}

/**
 * Open Telegram in a new window/tab and copy the status message to the
 * clipboard so the admin can paste it into the chat.
 */
export function sendTelegramMessage(phone: string, orderNumber: string, status: OrderStatus): void {
  try {
    const link = getTelegramLink(phone);
    const message = getTelegramMessage(orderNumber, status);

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message).catch((err) => {
        console.warn('Failed to copy Telegram message to clipboard:', err);
      });
    }

    console.log('Opening Telegram link:', link);

    // Open in new window/tab
    const newWindow = window.open(link, '_blank', 'noopener,noreferrer');

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback: Try direct navigation
      console.warn('Popup blocked, trying direct navigation');
      window.location.href = link;
    }
  } catch (error) {
    console.error('Failed to open Telegram:', error);
    alert('Failed to open Telegram. Please check the phone number.');
  }
}
