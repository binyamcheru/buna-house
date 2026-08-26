"use client";

import { useState, useEffect } from "react";
import { SearchIcon, BellIcon, MenuIcon } from "./icons";
import { logout, getAdminUser } from "@/lib/auth";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { SearchDropdown } from "./SearchDropdown";
import { applyReadState } from "@/lib/notification-read-state";

type TopbarProps = {
  title: string;
  onMenuToggle: () => void;
};

export function Topbar({ title, onMenuToggle }: TopbarProps) {
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch admin user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAdminUser();
      setAdminUser(user);
    };
    fetchUser();
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (response.ok) {
        const withReadState = applyReadState<{ id: string; read: boolean }>(data.notifications || []);
        setUnreadCount(withReadState.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow clicking on results
    setTimeout(() => {
      if (!searchQuery) {
        setSearchFocused(false);
      }
    }, 200);
  };

  const closeSearch = () => {
    setSearchQuery("");
    setSearchFocused(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <MenuIcon size={20} strokeWidth={2.2} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="search-box-wrapper">
          <div className="search-box">
            <SearchIcon size={18} strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={closeSearch}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {searchFocused && searchQuery && (
            <SearchDropdown searchQuery={searchQuery} onClose={closeSearch} />
          )}
        </div>

        <div className="notifications-wrapper">
          <button
            className="icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <BellIcon size={20} strokeWidth={2.2} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>
          <NotificationsDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onReadStateChange={fetchUnreadCount}
          />
        </div>

        <div className="admin-profile">
          <span className="admin-name">{adminUser?.name || 'Admin'}</span>
          <button className="logout-btn" onClick={logout} aria-label="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
