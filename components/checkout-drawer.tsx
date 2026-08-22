"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

type CheckoutDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
};

type OrderType = "delivery" | "pickup";
type PaymentMethod = "cash" | "card" | "online";

export function CheckoutDrawer({ open, onClose, onSuccess }: CheckoutDrawerProps) {
  const { items, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const deliveryFee = orderType === "delivery" ? 150 : 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + deliveryFee;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (formData.phone.length < 10) newErrors.phone = "Invalid phone number";

    if (orderType === "delivery") {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 Checkout form submitted");

    console.log("🔵 Validating form...");
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }
    console.log("✅ Form validation passed");

    if (items.length === 0) {
      console.log("❌ Cart is empty");
      alert("Your cart is empty!");
      return;
    }
    console.log("✅ Cart has items:", items.length);

    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: orderType === "delivery" ? formData.address : "Pickup from store",
        customer_city: orderType === "delivery" ? formData.city : "Addis Ababa",
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

      console.log("🔵 Sending order to API:", orderData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log("🔵 API Response status:", response.status);

      const data = await response.json();
      console.log("🔵 API Response data:", data);

      if (response.ok && data.order) {
        console.log("✅ Order placed successfully:", data.order.order_number);
        clearCart();
        onSuccess(data.order.order_number);
        onClose();
      } else {
        console.log("❌ Order failed:", data.error);
        alert(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("❌ Order placement error:", error);
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

  console.log("🟡 CheckoutDrawer render - open:", open, "items:", items.length);

  if (!open) {
    console.log("❌ CheckoutDrawer closed - returning null");
    return null;
  }

  console.log("✅ CheckoutDrawer is OPEN - rendering form");

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className={`drawer checkout-drawer ${open ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Checkout</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="drawer-body">
          <form onSubmit={handleSubmit}>
            {/* Order Type Selection */}
            <div className="form-section">
              <label className="form-label">Order Type</label>
              <div className="order-type-buttons">
                <button
                  type="button"
                  className={`order-type-btn ${orderType === "delivery" ? "active" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Delivery
                </button>
                <button
                  type="button"
                  className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                  onClick={() => setOrderType("pickup")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Pickup
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="form-section">
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

            <div className="form-section">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="abebe@example.com"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-section">
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

            {orderType === "delivery" && (
              <>
                <div className="form-section">
                  <label className="form-label">Delivery Address *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.address ? "error" : ""}`}
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Kebele 05, House No. 123, Bole"
                  />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>

                <div className="form-section">
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
              </>
            )}

            {/* Payment Method */}
            <div className="form-section">
              <label className="form-label">Payment Method</label>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Online Payment</span>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="form-section">
              <label className="form-label">Special Instructions (Optional)</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="checkout-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>Br {subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee > 0 ? `Br ${deliveryFee}` : "Free"}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Br {total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order (Br {total})
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
