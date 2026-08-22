"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-context";
import { ProductArt } from "./art";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, changeQty, removeItem } =
    useCart();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Don't render if not open
  if (!open) {
    return null;
  }

  return (
    <aside
      className="drawer drawer-cart drawer-open"
      aria-hidden={false}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="drawer-cart-header">
        <h2 className="drawer-title">Your Cart</h2>
        <button
          className="drawer-close-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          type="button"
          aria-label="Close cart"
        >
          <CloseIcon size={20} strokeWidth={2.2} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty-icon">
            <CartIcon size={30} />
          </span>
          <p>Your cart is empty</p>
          <span className="cart-empty-sub">Add something delicious to begin.</span>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.key}>
                <div className="cart-item-art">
                  {item.image && item.image.trim() !== '' ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="64px"
                    />
                  ) : (
                    <ProductArt art={item.art} />
                  )}
                </div>
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-meta">
                    Br {item.price}
                    {item.size !== "Small" && ` · ${item.size}`}
                  </span>
                  <div className="cart-item-controls">
                    <button
                      className="qty-btn qty-btn-sm"
                      onClick={() => changeQty(item.key, -1)}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={15} />
                    </button>
                    <span className="qty-count-sm">{item.qty}</span>
                    <button
                      className="qty-btn qty-btn-sm"
                      onClick={() => changeQty(item.key, 1)}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={15} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <span className="cart-item-line">Br {item.price * item.qty}</span>
                  <button
                    className="cart-remove"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Br {subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "FREE" : `Br ${deliveryFee}`}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>Br {total}</span>
            </div>
            <button className="checkout-btn" onClick={() => {
              onClose();
              router.push("/checkout");
            }}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}