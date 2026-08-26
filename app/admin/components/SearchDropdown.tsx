"use client";

import { useState, useEffect, useRef } from "react";

type SearchResult = {
  id: string;
  type: 'product' | 'order' | 'customer';
  title: string;
  subtitle: string;
  link: string;
  icon: string;
};

type SearchDropdownProps = {
  searchQuery: string;
  onClose: () => void;
};

export function SearchDropdown({ searchQuery, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchData(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (searchQuery) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchQuery, onClose]);

  const searchData = async (query: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'package':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        );
      case 'shopping-bag':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
      case 'user':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return '#c08552';
      case 'order': return '#3b6ea5';
      case 'customer': return '#4c7a4a';
      default: return '#6b5548';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'product': return 'Product';
      case 'order': return 'Order';
      case 'customer': return 'Customer';
      default: return type;
    }
  };

  if (!searchQuery || searchQuery.length < 2) return null;

  return (
    <div ref={dropdownRef} className="search-dropdown">
      {loading ? (
        <div className="search-loading">
          <div className="spinner" />
          <p>Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p>No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="search-results">
          <div className="search-results-header">
            Found {results.length} result{results.length > 1 ? 's' : ''}
          </div>
          {results.map((result) => (
            <a
              key={result.id}
              href={result.link}
              className="search-result-item"
              onClick={onClose}
            >
              <div
                className="search-result-icon"
                style={{ background: `${getTypeColor(result.type)}15`, color: getTypeColor(result.type) }}
              >
                {getIcon(result.icon)}
              </div>
              <div className="search-result-content">
                <div className="search-result-title">{result.title}</div>
                <div className="search-result-subtitle">{result.subtitle}</div>
              </div>
              <span
                className="search-result-badge"
                style={{ background: `${getTypeColor(result.type)}15`, color: getTypeColor(result.type) }}
              >
                {getTypeBadge(result.type)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
