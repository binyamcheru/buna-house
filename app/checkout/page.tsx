"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import Image from "next/image";
import Link from "next/link";

type PaymentMethod = "cash" | "card" | "online";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate totals - always delivery
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 200; // Fixed delivery fee
  const discount = 0; // Can implement coupon logic later
  const total = subtotal + deliveryFee - discount;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    // Email is now optional - only validate format if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (formData.phone.length < 10) newErrors.phone = "Invalid phone number";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_city: formData.city,
        items: items.map(item => ({
          id: item.id, // Added missing id field
          name: item.name,
          quantity: item.qty,
          price: item.price,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod === "cash" ? "Cash on Delivery" : paymentMethod === "card" ? "Card" : "Online Payment",
        notes: formData.notes || null,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.order) {
        clearCart();
        router.push(`/order-confirmation?order=${data.order.order_number}`);
      } else {
        alert(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some items to your cart before checking out.</p>
        <Link href="/" className="empty-btn">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <header className="checkout-header">
        <div className="checkout-container">
          <Link href="/" className="checkout-logo">
            <span className="logo-text">Buna House</span>
          </Link>
          <div className="checkout-steps">
            <div className="step active">
              <span className="step-num">1</span>
              <span className="step-label">Checkout</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <span className="step-num">2</span>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="checkout-main">
        <div className="checkout-container">
          <div className="checkout-grid">
            {/* Left Column - Form */}
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit}>
                {/* Customer Details */}
                <div className="checkout-card">
                  <h2 className="checkout-card-title">Contact Information</h2>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.name ? "error" : ""}`}
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Abebe Bekele"
                      />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+251 91 234 5678"
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>

                    <div className="form-field full-width">
                      <label className="form-label">Email Address (Optional)</label>
                      <input
                        type="email"
                        className={`form-input ${errors.email ? "error" : ""}`}
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="abebe@example.com"
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="checkout-card">
                  <h2 className="checkout-card-title">Delivery Address</h2>
                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.address ? "error" : ""}`}
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Kebele 05, House No. 123, Bole"
                      />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.city ? "error" : ""}`}
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Addis Ababa"
                      />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="checkout-card">
                  <h2 className="checkout-card-title">Payment Method</h2>
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      />
                      <div className="payment-info">
                        <span className="payment-name">Cash on Delivery</span>
                        <span className="payment-desc">Pay when you receive</span>
                      </div>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      />
                      <div className="payment-info">
                        <span className="payment-name">Credit/Debit Card</span>
                        <span className="payment-desc">Visa, MasterCard</span>
                      </div>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      />
                      <div className="payment-info">
                        <span className="payment-name">Online Payment</span>
                        <span className="payment-desc">JazzCash, EasyPaisa</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="checkout-card">
                  <h2 className="checkout-card-title">Special Instructions (Optional)</h2>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any special requests or notes for your order..."
                    rows={4}
                  />
                </div>

                {/* Mobile Submit Button */}
                <button
                  type="submit"
                  className="checkout-submit-btn mobile-only"
                  disabled={loading || items.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order · Br {total}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <aside className="checkout-summary-section">
              <div className="checkout-summary-sticky">
                <div className="checkout-card">
                  <h2 className="checkout-card-title">Order Summary</h2>

                  {/* Items */}
                  <div className="summary-items">
                    {items.map((item) => (
                      <div key={item.key} className="summary-item">
                        <div className="summary-item-image">
                          <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: '8px',
                            background: 'var(--panel)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '24px'
                          }}>
                            ☕
                          </div>
                        </div>
                        <div className="summary-item-info">
                          <h4 className="summary-item-name">{item.name}</h4>
                          <p className="summary-item-variant">{item.size}</p>
                          <p className="summary-item-qty">Qty: {item.qty}</p>
                        </div>
                        <div className="summary-item-price">
                          Br {item.price * item.qty}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>Br {subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span>Br {deliveryFee}</span>
                    </div>
                    {discount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount</span>
                        <span>-Br {discount}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>Br {total}</span>
                    </div>
                  </div>

                  {/* Desktop Submit Button */}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="checkout-submit-btn desktop-only"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order · Br {total}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="checkout-secure">
                    🔒 Secure checkout · Your data is protected
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
