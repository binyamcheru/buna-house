"use client";

import { useState, useEffect, useRef } from "react";
import { applyReadState, markAllNotificationsRead, markNotificationRead } from "@/lib/notification-read-state";

type Notification = {
  id: string;
  type: 'order' | 'stock' | 'subscriber' | 'contact';
  title: string;
  message: string;
  time: string;
  timestamp: string;
  link: string;
  read: boolean;
};

type NotificationsDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onReadStateChange?: () => void;
};

export function NotificationsDropdown({ isOpen, onClose, onReadStateChange }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();

      if (response.ok) {
        const withReadState = applyReadState<Notification>(data.notifications || []);
        setNotifications(withReadState);
        setUnreadCount(withReadState.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    onReadStateChange?.();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(notifications.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    onReadStateChange?.();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
      case 'stock':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        );
      case 'subscriber':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        );
      case 'contact':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return '#3b6ea5';
      case 'stock': return '#b4791f';
      case 'subscriber': return '#4c7a4a';
      case 'contact': return '#c08552';
      default: return '#6b5548';
    }
  };

  if (!isOpen) return null;

  // Detect mobile for Safari iOS fix
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  return (
    <div
      ref={dropdownRef}
      className="notifications-dropdown"
      style={isMobile ? {
        position: 'fixed',
        top: 'auto',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        maxWidth: '100vw',
        maxHeight: '85vh',
        zIndex: 10000,
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface)',
      } : undefined}
    >
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="notifications-count"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={handleMarkAllRead}
          >
            {unreadCount} new · Mark all read
          </button>
        ) : null}
      </div>

      <div className="notifications-body">
        {loading ? (
          <div className="notifications-loading">
            <div className="spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <a
                key={notification.id}
                href={notification.link}
                className="notification-item"
                onClick={() => {
                  handleNotificationClick(notification.id);
                  onClose();
                }}
              >
                <div
                  className="notification-icon"
                  style={{ background: `${getTypeColor(notification.type)}15`, color: getTypeColor(notification.type) }}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{notification.time}</div>
                </div>
                {!notification.read && <div className="notification-unread-dot" />}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
