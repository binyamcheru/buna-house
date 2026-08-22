"use client";

import { useState, useEffect } from "react";
import { CoffeeIcon } from "./icons";

const exploreLinks = ["Menu", "About", "Contact", "Locations"];
const FOOTER_YEAR = 2026;

type Settings = {
  address?: { name: string; street: string; area: string };
  hours?: { weekdays: string; weekends: string };
  contact?: { phone: string; email: string; telegram: string };
  delivery?: { minimum: string; time: string; areas: string };
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<Settings>({
    address: { name: "Buna House", street: "Bole Road, near Dembel City Center,", area: "Bole, Addis Ababa" },
    hours: { weekdays: "Monday – Friday: 8:00am – 11:00pm", weekends: "Saturday – Sunday: 9:00am – 12:00am" },
    contact: { phone: "+251 11 662 3348", email: "hello@bunahouse.et", telegram: "BunaHouseAddis" },
    delivery: { minimum: "1,500", time: "30–45 minutes", areas: "Bole, CMC and Megenagna" },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Keep default values if fetch fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/leads/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("🎉 Successfully subscribed!");
        setEmail("");
      } else if (response.status === 409) {
        setMessage("Already subscribed!");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage("Failed to subscribe. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-logo">
            <span className="footer-logo-badge" aria-hidden>
              <CoffeeIcon size={20} strokeWidth={2} />
            </span>
            <span className="footer-wordmark">{settings.address?.name || "Buna House"}</span>
          </span>
          <p className="footer-tagline">Crafting moments, one cup at a time.</p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Explore</h4>
          <ul className="footer-links">
            {exploreLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Good to know</h4>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(251, 245, 234, 0.9)' }}>Address</h5>
            <p className="footer-visit">
              {settings.address?.name}
              <br />
              {settings.address?.street}
              <br />
              {settings.address?.area}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(251, 245, 234, 0.9)' }}>Opening Hours</h5>
            <p className="footer-visit">
              {settings.hours?.weekdays}
              <br />
              {settings.hours?.weekends}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(251, 245, 234, 0.9)' }}>Contact</h5>
            <p className="footer-visit">
              {settings.contact?.phone}
              <br />
              {settings.contact?.email}
              <br />
              <a href={`https://t.me/${settings.contact?.telegram}`} style={{ color: 'var(--caramel)', textDecoration: 'none' }}>
                Chat with us on Telegram
              </a>
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(251, 245, 234, 0.9)' }}>Delivery</h5>
            <p className="footer-visit">
              Free delivery on orders above Br {settings.delivery?.minimum}. Orders arrive in {settings.delivery?.time} across {settings.delivery?.areas}.
            </p>
          </div>
        </div>

        <div className="footer-news">
          <h4 className="footer-heading">Get 20% Off</h4>
          <p className="footer-news-sub">
            Join the list for exclusive offers and new drops.
          </p>
          <form className="news-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email address"
              className="news-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="news-btn" disabled={loading}>
              {loading ? "..." : "Join Us"}
            </button>
          </form>
          {message && (
            <p style={{
              marginTop: '8px',
              fontSize: '13px',
              color: message.includes('🎉') ? '#4c7a4a' : '#b33a2e',
              fontWeight: 600
            }}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {FOOTER_YEAR} {settings.address?.name || "Buna House"}. All rights reserved.</span>
        <span className="footer-bottom-tag">Brewed with care in Addis Ababa.</span>
      </div>
    </footer>
  );
}