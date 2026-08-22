"use client";

import { useEffect, useState } from "react";
import type { LocationOption, OrderType } from "@/lib/data";
import { LOCATIONS } from "@/lib/data";
import { CoffeeIcon, MapPinIcon, PinIcon, CloseIcon, BikeIcon, StoreIcon, ChevronDownIcon } from "./icons";

const STORAGE_KEY = "roast-location";

export type SavedLocation = {
  orderType: OrderType;
  location: LocationOption;
};

/**
 * Location gate shown on first visit. User picks Delivery / Pick-Up and a
 * location (auto via browser geolocation, or from the service-area list).
 * Saved to localStorage so returning visitors skip the gate entirely.
 */
export function LocationGate({
  open,
  onConfirm,
}: {
  open: boolean;
  onConfirm: (saved: SavedLocation) => void;
}) {
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [locating, setLocating] = useState(true);
  const [selected, setSelected] = useState<LocationOption | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Fade the card in when opened (smooth entrance). When closed, the whole
  // gate is hidden via CSS (opacity 0 + pointer-events none) so the
  // component stays mounted — keeping hooks order stable.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Try auto-detecting the area once.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      setError("Location not available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // We don't reverse-geocode here; default to the nearest area so the
        // user still confirms. (A geocoding service can be wired in later.)
        setSelected(LOCATIONS[0]);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Location access denied. Please select manually.");
      },
      { timeout: 6000 }
    );
  }, []);

  function confirm() {
    if (!selected) {
      setError("Please select your location.");
      return;
    }
    const saved: SavedLocation = { orderType, location: selected };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* storage blocked — ignore */
    }
    onConfirm(saved);
  }

  return (
    <div
      className={`location-gate ${open ? "" : "location-gate-hidden"} ${
        visible ? "location-gate-visible" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Select your order type and location"
    >
      <div className="location-gate-card">
        <div className="location-gate-brand">
          <span className="location-gate-badge" aria-hidden>
            <CoffeeIcon size={26} strokeWidth={2} />
          </span>
          <span className="location-gate-name">Buna House</span>
          <span className="location-gate-tag">Crafting moments, one cup at a time.</span>
        </div>

        <h2 className="location-gate-title">Select Your Order Type</h2>

        {/* Order type toggle */}
        <div className="location-type-row">
          <button
            className={`location-type ${orderType === "delivery" ? "location-type-active" : ""}`}
            onClick={() => setOrderType("delivery")}
            aria-pressed={orderType === "delivery"}
          >
            <span className="location-type-icon">
              <BikeIcon size={22} />
            </span>
            <span className="location-type-text">
              <strong>Delivery</strong>
              <small>Get it to your door</small>
            </span>
          </button>
          <button
            className={`location-type ${orderType === "pickup" ? "location-type-active" : ""}`}
            onClick={() => setOrderType("pickup")}
            aria-pressed={orderType === "pickup"}
          >
            <span className="location-type-icon">
              <StoreIcon size={22} />
            </span>
            <span className="location-type-text">
              <strong>Pick-Up</strong>
              <small>Grab it in store</small>
            </span>
          </button>
        </div>

        {/* Location selection */}
        <div className="location-pick">
          <span className="location-pick-label">Please select your location</span>

          {locating ? (
            <div className="location-locating">
              <span className="location-spinner" aria-hidden />
              <span>Getting Location...</span>
            </div>
          ) : (
            <button
              className="location-select"
              onClick={() => setListOpen((o) => !o)}
              aria-expanded={listOpen}
            >
              <span className="location-select-icon">
                <MapPinIcon size={18} />
              </span>
              <span className="location-select-text">
                {selected ? (
                  <>
                    <strong>{selected.name}</strong>
                    <small>{selected.area}</small>
                  </>
                ) : (
                  <>
                    <strong>Select your area</strong>
                    <small>Choose from our delivery zones</small>
                  </>
                )}
              </span>
              <span className="location-select-chevron">
                <ChevronDownIcon size={18} />
              </span>
            </button>
          )}

          {listOpen && !locating && (
            <ul className="location-list">
              {LOCATIONS.map((loc) => (
                <li key={loc.id}>
                  <button
                    className={`location-option ${
                      selected?.id === loc.id ? "location-option-active" : ""
                    }`}
                    onClick={() => {
                      setSelected(loc);
                      setListOpen(false);
                      setError(null);
                    }}
                  >
                    <span className="location-option-pin">
                      <PinIcon size={16} />
                    </span>
                    <span>
                      <strong>{loc.name}</strong>
                      <small>{loc.area}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <span className="location-error">{error}</span>}
        </div>

        <button className="location-confirm" onClick={confirm} disabled={locating}>
          {locating ? "Locating…" : "Confirm Location"}
        </button>

        <button
          className="location-skip"
          onClick={() =>
            onConfirm({
              orderType,
              location: selected ?? LOCATIONS[0],
            })
          }
        >
          Skip — browse without delivery
        </button>
      </div>
    </div>
  );
}

export { STORAGE_KEY as LOCATION_STORAGE_KEY };

export function readSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLocation;
    if (!parsed.orderType || !parsed.location?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}