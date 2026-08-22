"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/data";

/**
 * Scroll-spy driven by scroll position: the active category is the one
 * whose section top is closest to (but above) the sticky header/search bar.
 * Distance-based selection — works regardless of section heights.
 */
export function useScrollSpy(categories: Category[]) {
  const [active, setActive] = useState(categories.length > 0 ? categories[0].id : "");
  const ticking = useRef(false);

  useEffect(() => {
    if (categories.length === 0) return;

    // Height of the sticky header + search/category bar, measured at runtime.
    const getOffset = () => {
      const bar = document.querySelector<HTMLElement>(".sticky-bar");
      const header = document.querySelector<HTMLElement>(".header");
      const barBottom = bar?.getBoundingClientRect().bottom ?? 0;
      const headerH = header?.offsetHeight ?? 64;
      // If the sticky bar is fixed in place its bottom edge is constant.
      return barBottom > 0 ? barBottom : headerH;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const offset = getOffset();
        let current = categories[0].id;
        // Pick the last section whose top has passed the sticky bar bottom.
        for (const cat of categories) {
          const el = document.getElementById(cat.id);
          if (!el) break;
          if (el.getBoundingClientRect().top <= offset) {
            current = cat.id;
          } else {
            break; // sections are ordered top→bottom, first miss means done
          }
        }
        setActive(current);
        ticking.current = false;
      });
    };

    // Run once on mount so the initial pill matches the viewport.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories]);

  return [active, setActive] as const;
}