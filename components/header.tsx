"use client";

import { CartIcon, CoffeeIcon, MenuIcon, PinIcon } from "./icons";
import { useCart } from "./cart-context";
import type { SavedLocation } from "./location-gate";

export function Header({
  savedLocation,
  onOpenCart,
  onOpenInfo,
  onOpenLocation,
}: {
  savedLocation: SavedLocation | null;
  onOpenCart: () => void;
  onOpenInfo: () => void;
  onOpenLocation: () => void;
}) {
  const { itemCount } = useCart();

  const label = savedLocation
    ? savedLocation.orderType === "pickup"
      ? `Pick-Up · ${savedLocation.location.name}`
      : `${savedLocation.location.name}, Addis Ababa`
    : "Select location";

  return (
    <header className="header">
      <div className="header-inner">
        <button className="header-logo" onClick={onOpenInfo} aria-label="Visit info">
          <span className="header-logo-badge" aria-hidden>
            <CoffeeIcon size={20} strokeWidth={2} />
          </span>
          <span className="header-wordmark">Buna House</span>
        </button>

        <div className="header-actions">
          <button
            className="location-chip"
            onClick={onOpenLocation}
            aria-label="Change location"
          >
            <PinIcon size={17} />
            <span className="location-text">{label}</span>
          </button>

          <button
            className="icon-btn"
            onClick={onOpenCart}
            aria-label={`Open cart, ${itemCount} items`}
          >
            <CartIcon size={21} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          <button className="icon-btn" onClick={onOpenInfo} aria-label="Open menu">
            <MenuIcon size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}