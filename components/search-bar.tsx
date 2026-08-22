"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/data";
import { ProductArt } from "./art";
import { CloseIcon, SearchIcon } from "./icons";

export function SearchBar({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Search only the products currently shown on the page (live data)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (products || [])
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, products]);

  // Reset highlighted index whenever results change.
  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Escape closes; arrows + enter navigate results.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[highlighted];
      if (target) {
        onSelect(target);
        setOpen(false);
        setQuery("");
      }
    }
  }

  function pick(p: Product) {
    onSelect(p);
    setOpen(false);
    setQuery("");
  }

  const show = open && query.trim().length > 0;

  return (
    <div className="searchbar" ref={boxRef}>
      <div className="searchbar-field">
        <span className="searchbar-icon">
          <SearchIcon size={17} strokeWidth={2.4} />
        </span>
        <input
          ref={inputRef}
          className="searchbar-input"
          type="text"
          placeholder="Search coffee, shakes, desserts…"
          aria-label="Search menu"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={show}
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        {query && (
          <button
            className="searchbar-clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {show && (
        <ul className="searchbar-results" id="search-results" role="listbox">
          {results.length === 0 ? (
            <li className="searchbar-empty">
              No results for “{query}”
            </li>
          ) : (
            results.map((p, i) => (
              <li key={p.id}>
                <button
                  className={`searchbar-result ${
                    i === highlighted ? "searchbar-result-active" : ""
                  }`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => pick(p)}
                  role="option"
                  aria-selected={i === highlighted}
                >
                  <span className="searchbar-result-art">
                    {p.image && p.image.trim() !== '' ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="48px"
                      />
                    ) : (
                      <ProductArt art={p.art} />
                    )}
                  </span>
                  <span className="searchbar-result-info">
                    <span className="searchbar-result-name">{p.name}</span>
                    <span className="searchbar-result-cat">{p.description}</span>
                  </span>
                  <span className="searchbar-result-price">Br {p.price}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}