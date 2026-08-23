"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-content">
          {/* Success Icon */}
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="confirmation-title">Order Placed Successfully!</h1>
          <p className="confirmation-subtitle">
            Thank you for your order. We'll start preparing it right away!
          </p>

          {/* Order Number */}
          <div className="order-number-card">
            <span className="order-number-label">Order Number</span>
            <span className="order-number-value">#{orderNumber}</span>
          </div>

          {/* Simple Message */}
          <div className="confirmation-message">
            <p>✅ Your order has been received</p>
            <p>📞 We'll call you shortly to confirm</p>
            <p>🚚 Delivery within 30-45 minutes</p>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <Link href="/" className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Continue Shopping
            </Link>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary"
            >
              Back to Home ({countdown}s)
            </button>
          </div>

          {/* Contact Support */}
          <p className="confirmation-footer">
            Need help? Call us at{" "}
            <a href="tel:+251912345678">+251 91 234 5678</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
