"use client";

import { useCart } from "./cart-context";

export function MobileOrderBar({ onViewCart }: { onViewCart: () => void }) {
  const { itemCount, total } = useCart();
  if (itemCount === 0) return null;

  return (
    <div className="order-bar">
      <div className="order-bar-total">
        <span className="order-bar-count">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <span className="order-bar-price">Br {total}</span>
      </div>
      <button className="order-bar-cta" onClick={onViewCart}>
        View Cart
      </button>
    </div>
  );
}