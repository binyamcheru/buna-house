"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/lib/data";

export function CategoryNav({
  active,
  categories,
  onSelect,
}: {
  active: string;
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef(new Map<string, HTMLButtonElement | null>());

  // Keep the active pill centered in the horizontally scrollable track.
  useEffect(() => {
    const track = trackRef.current;
    const pill = pillRefs.current.get(active);
    if (!track || !pill) return;
    const left =
      pill.offsetLeft - track.clientWidth / 2 + pill.clientWidth / 2;
    track.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  function handleClick(id: string) {
    onSelect(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Show message if no categories
  if (categories.length === 0) {
    return (
      <nav className="catnav" aria-label="Menu categories">
        <div className="catnav-track">
          <div style={{ padding: "12px 20px", color: "var(--muted)", fontSize: "14px" }}>
            No categories available. Add products in admin dashboard.
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="catnav" aria-label="Menu categories">
      <div className="catnav-track" ref={trackRef}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={(el) => {
              pillRefs.current.set(cat.id, el);
            }}
            className={`catnav-pill ${active === cat.id ? "catnav-pill-active" : ""}`}
            onClick={() => handleClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}