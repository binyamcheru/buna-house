"use client";

import { useEffect } from "react";
import {
  ClockIcon,
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapIcon,
  PhoneIcon,
  PinIcon,
  TelegramIcon,
} from "./icons";

type InfoDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="drawer-section">
      <h3 className="drawer-section-title">{title}</h3>
      {children}
    </div>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="drawer-row">
      <span className="drawer-row-icon">{icon}</span>
      <span className="drawer-row-content">{children}</span>
    </div>
  );
}

export function InfoDrawer({ open, onClose }: InfoDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Don't render if not open (performance optimization)
  if (!open) {
    return null;
  }

  return (
    <aside
      className="drawer drawer-info drawer-open"
      aria-hidden={false}
      onClick={(e) => {
        // Prevent clicks inside drawer from closing it
        e.stopPropagation();
      }}
    >
      <button
        className="drawer-close-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        type="button"
        aria-label="Close menu"
      >
        <CloseIcon size={20} strokeWidth={2.2} />
      </button>

      <h2 className="drawer-title">Good to know</h2>

      <DrawerSection title="Address">
        <Row icon={<PinIcon size={19} />}>
          <span>
            <strong>Buna House</strong>
            <br />
            Bole Road, near Dembel City Center,
            <br />
            Bole, Addis Ababa
          </span>
        </Row>
      </DrawerSection>

      <DrawerSection title="Opening Hours">
        <Row icon={<ClockIcon size={19} />}>
          <span>
            Monday – Friday: 8:00am – 11:00pm
            <br />
            Saturday – Sunday: 9:00am – 12:00am
          </span>
        </Row>
      </DrawerSection>

      <DrawerSection title="Contact">
        <Row icon={<PhoneIcon size={19} />}>
          <a href="tel:+251116623348">+251 11 662 3348</a>
        </Row>
        <Row icon={<MailIcon size={19} />}>
          <a href="mailto:hello@bunahouse.et">hello@bunahouse.et</a>
        </Row>
        <Row icon={<TelegramIcon size={19} />}>
          <a className="drawer-telegram" href="https://t.me/BunaHouseAddis">
            Chat with us on Telegram
          </a>
        </Row>
      </DrawerSection>

      <DrawerSection title="Delivery">
        <p className="drawer-paragraph">
          Free delivery on orders above Br 1,500. Orders arrive in 30–45 minutes
          across Bole, CMC and Megenagna.
        </p>
      </DrawerSection>

      <div className="drawer-socials">
        <button className="social-btn" aria-label="Instagram">
          <InstagramIcon size={18} />
        </button>
        <button className="social-btn" aria-label="Facebook">
          <FacebookIcon size={18} />
        </button>
        <button className="social-btn" aria-label="View on Maps">
          <MapIcon size={18} />
        </button>
      </div>
    </aside>
  );
}