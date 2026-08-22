"use client";

import { useEffect, useState } from "react";

type OrderConfirmationProps = {
  open: boolean;
  orderNumber: string;
  onClose: () => void;
};

export function OrderConfirmation({ open, orderNumber, onClose }: OrderConfirmationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
    }
  }, [open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!open) return null;

  return (
    <>
      <div className="confirmation-overlay" onClick={handleClose} />
      <div className={`confirmation-modal ${show ? "show" : ""}`}>
        <div className="confirmation-content">
          {/* Success Icon */}
          <div className="confirmation-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="confirmation-title">Order Placed Successfully! 🎉</h2>
          <p className="confirmation-subtitle">
            Thank you for your order. We've received it and will start preparing it shortly.
          </p>

          {/* Order Number */}
          <div className="confirmation-order-box">
            <span className="confirmation-label">Order Number</span>
            <span className="confirmation-order-number">{orderNumber}</span>
          </div>

          {/* Info Cards */}
          <div className="confirmation-info-grid">
            <div className="confirmation-info-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <div className="info-card-label">Estimated Time</div>
                <div className="info-card-value">30-45 minutes</div>
              </div>
            </div>

            <div className="confirmation-info-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <div className="info-card-label">Email Sent</div>
                <div className="info-card-value">Order confirmation</div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="confirmation-next">
            <h3>What's Next?</h3>
            <ul>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                We'll prepare your order with care
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                You'll receive updates via email
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Track your order status anytime
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <button className="confirmation-btn secondary" onClick={handleClose}>
              Continue Shopping
            </button>
            <button className="confirmation-btn primary" onClick={handleClose}>
              View Order Details
            </button>
          </div>

          {/* Close Button */}
          <button className="confirmation-close" onClick={handleClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
