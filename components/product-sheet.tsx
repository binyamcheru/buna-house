"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CUSTOMIZATIONS,
  DEFAULT_SIZE,
  SIZE_OPTIONS,
} from "@/lib/data";
import type { Product } from "@/lib/data";
import { ProductArt } from "./art";
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from "./icons";
import { useCartActions } from "./cart-context";

export function ProductSheet({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addItem } = useCartActions();
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cardSettings, setCardSettings] = useState<any>(null);

  const open = product !== null;

  // Fetch product card settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (response.ok && data.settings?.product_card) {
          setCardSettings(data.settings.product_card);
        }
      } catch (error) {
        console.error('Error fetching card settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Reset choices whenever a new product opens.
  useEffect(() => {
    if (product) {
      setSize(DEFAULT_SIZE);
      setCustomizations([]);
      setSpecialInstructions("");
      setQty(1);
      setJustAdded(false);
    }
  }, [product]);

  // (Body scroll is locked by the shop page when any overlay is open.)

  const sizeDelta = SIZE_OPTIONS.find((s) => s.id === size)?.delta ?? 0;
  const customDelta = customizations.reduce((sum, id) => {
    const opt = CUSTOMIZATIONS.find((c) => c.id === id);
    return sum + (opt?.delta ?? 0);
  }, 0);

  const unitPrice = product ? product.price + sizeDelta + customDelta : 0;
  const linePrice = unitPrice * qty;

  if (!product) return null;

  function toggleCustomization(id: string) {
    setCustomizations((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const handleAdd = () => {
    addItem(product.id, { size, customizations, qty });
    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 450);
  };

  return (
    <>
      <div
        className={`sheet-backdrop ${open ? "backdrop-show" : ""}`}
        onClick={onClose}
      />
      <section
        className={`sheet ${open ? "sheet-open" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-label={product.name}
      >
        <div className="sheet-handle" aria-hidden />

        <button className="sheet-close" onClick={onClose} aria-label="Close product">
          <CloseIcon size={20} strokeWidth={2.2} />
        </button>

        <div className="sheet-scroll">
          <div className="sheet-image">
            {product.image && product.image.trim() !== '' ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <ProductArt art={product.art} />
            )}
          </div>

          <div className="sheet-content">
            <h2 className="sheet-name">{product.name}</h2>
            <p className="sheet-desc">{product.description}</p>

            <div className="sheet-group">
              <span className="sheet-label">Size</span>
              <div className="sheet-options">
                {(cardSettings?.sizes || SIZE_OPTIONS.map(s => s.label)).map((sizeLabel: string, idx: number) => {
                  const sizeId = sizeLabel.toLowerCase();
                  const sizeOpt = SIZE_OPTIONS.find(s => s.label === sizeLabel) || SIZE_OPTIONS[idx];
                  const isActive = size === (sizeOpt?.id || sizeId);
                  return (
                    <button
                      key={sizeId}
                      className={`sheet-pill ${isActive ? "sheet-pill-active" : ""}`}
                      onClick={() => setSize(sizeOpt?.id || sizeId)}
                    >
                      <span>{sizeLabel}</span>
                      <span className="sheet-pill-delta">
                        {(sizeOpt?.delta || 0) === 0 ? "Included" : `+ Br ${sizeOpt?.delta || 0}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {cardSettings?.type === "customize" && (
              <div className="sheet-group">
                <span className="sheet-label">{cardSettings?.customize_label || "Customize"}</span>
                <div className="sheet-options sheet-options-custom">
                  {CUSTOMIZATIONS.map((opt) => {
                    const active = customizations.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        className={`sheet-pill ${active ? "sheet-pill-active" : ""}`}
                        onClick={() => toggleCustomization(opt.id)}
                      >
                        <span className="sheet-custom-row">
                          <span
                            className={`sheet-check ${active ? "sheet-check-on" : ""}`}
                          >
                            {active && <CheckIcon size={12} strokeWidth={3} />}
                          </span>
                          {opt.label}
                        </span>
                        <span className="sheet-pill-delta">+ Br {opt.delta}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cardSettings?.type === "instructions" && (
              <div className="sheet-group">
                <span className="sheet-label">{cardSettings?.instructions_label || "Special Instructions"}</span>
                <textarea
                  className="form-textarea"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={cardSettings?.instructions_placeholder || "Any special requests? (e.g., less sugar, extra hot)"}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            <div className="sheet-group">
              <span className="sheet-label">Quantity</span>
              <div className="sheet-qty">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <MinusIcon size={18} />
                </button>
                <span className="qty-count">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          <button className="sheet-add" onClick={handleAdd}>
            {justAdded ? (
              <>
                <CheckIcon size={19} strokeWidth={2.6} /> Added!
              </>
            ) : (
              `Add to Cart — Br ${linePrice}`
            )}
          </button>
        </div>
      </section>
    </>
  );
}