"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/data";
import { ProductArt } from "./art";
import { CheckIcon, PlusIcon } from "./icons";
import { useCartActions } from "./cart-context";

export const ProductCard = memo(function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (product: Product) => void;
}) {
  // Actions context is reference-stable: these 40 cards do NOT re-render
  // when cart contents change. Only the cart value consumers re-render.
  const { addItem } = useCartActions();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(product.id);
    setAdded(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAdded(false), 900);
  }

  // Data attribute drives the "just added" + button color via CSS
  // (dash-to-check feedback without extra class toggling).
  const addBtnClass = added ? "card-add card-add-added" : "card-add";

  // Check if product has a real image
  const hasImage = product.image && product.image.trim() !== '';

  return (
    <article
      className="card"
      onClick={() => onOpen(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(product);
        }
      }}
    >
      <div className="card-image">
        {hasImage ? (
          <>
            <Image
              src={product.image || '/placeholder.png'}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </>
        ) : (
          <ProductArt art={product.art} />
        )}
        {product.badge && <span className="card-badge">{product.badge}</span>}
      </div>

      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <span className="card-price">Br {product.price}</span>
          <button
            className={addBtnClass}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? <CheckIcon size={18} strokeWidth={2.6} /> : <PlusIcon size={18} strokeWidth={2.4} />}
          </button>
        </div>
      </div>
    </article>
  );
});