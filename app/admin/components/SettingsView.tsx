"use client";

import { useState, useEffect } from "react";
import { clearSettingsCache } from "@/lib/cache-manager";
import { useToast } from "./Toast";

export function SettingsView() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<{ [key: string]: boolean }>({
    address: false,
    hours: false,
    contact: false,
    delivery: false,
    promo_bar: false,
    product_card: false,
  });
  const [settings, setSettings] = useState<any>({
    address: { name: "", street: "", area: "" },
    hours: { weekdays: "", weekends: "" },
    contact: { phone: "", email: "", telegram: "" },
    delivery: { minimum: "", time: "", areas: "" },
    promo_bar: { messages: [] },
    product_card: {
      sizes: ["Small", "Medium", "Large"],
      type: "instructions",
      instructions_label: "Special Instructions",
      instructions_placeholder: "Any special requests? (e.g., less sugar, extra hot)"
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (response.ok && data.settings) {
        // Parse stringified objects back to JavaScript objects
        const parsedSettings: any = {};
        for (const [key, value] of Object.entries(data.settings)) {
          try {
            // Try to parse as JSON if it's a string
            parsedSettings[key] = typeof value === 'string' ? JSON.parse(value as string) : value;
          } catch {
            // If parsing fails, use the value as-is
            parsedSettings[key] = value;
          }
        }
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    setSavingStates({ ...savingStates, [key]: true });
    try {
      // Stringify objects for database storage
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : value;

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_key: key, setting_value: settingValue }),
      });

      if (response.ok) {
        clearSettingsCache(); // Clear cache so changes appear immediately on homepage
        toast.success("Settings updated successfully!");
        fetchSettings();
      } else {
        const text = await response.text();
        let errorMsg = "Failed to update settings";
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || errorMsg;
        } catch {
          console.error('Non-JSON response:', text);
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSavingStates({ ...savingStates, [key]: false });
    }
  };

  const handleSubmit = (e: React.FormEvent, key: string) => {
    e.preventDefault();
    handleUpdate(key, settings[key]);
  };

  if (loading) {
    return (
      <div className="admin-view">
        <div className="view-header">
          <h1 className="view-title">Site Settings</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1 className="view-title">Site Settings</h1>
        <p className="view-subtitle">Manage your website information</p>
      </div>

      <div className="settings-grid">
        {/* Address Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">📍 Address</h2>
          <form onSubmit={(e) => handleSubmit(e, "address")}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.address?.name || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, name: e.target.value },
                  })
                }
                placeholder="Buna House"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.address?.street || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, street: e.target.value },
                  })
                }
                placeholder="Bole Road, near Dembel City Center,"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area/City</label>
              <input
                type="text"
                className="form-input"
                value={settings.address?.area || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, area: e.target.value },
                  })
                }
                placeholder="Bole, Addis Ababa"
              />
            </div>
            <button type="submit" className="btn-save" disabled={savingStates.address}>
              {savingStates.address ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>

        {/* Opening Hours */}
        <div className="settings-card">
          <h2 className="settings-card-title">🕐 Opening Hours</h2>
          <form onSubmit={(e) => handleSubmit(e, "hours")}>
            <div className="form-group">
              <label className="form-label">Weekdays (Mon-Fri)</label>
              <input
                type="text"
                className="form-input"
                value={settings.hours?.weekdays || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hours: { ...settings.hours, weekdays: e.target.value },
                  })
                }
                placeholder="Monday – Friday: 8:00am – 11:00pm"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weekends (Sat-Sun)</label>
              <input
                type="text"
                className="form-input"
                value={settings.hours?.weekends || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hours: { ...settings.hours, weekends: e.target.value },
                  })
                }
                placeholder="Saturday – Sunday: 9:00am – 12:00am"
              />
            </div>
            <button type="submit" className="btn-save" disabled={savingStates.hours}>
              {savingStates.hours ? "Saving..." : "Save Hours"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="settings-card">
          <h2 className="settings-card-title">📞 Contact Information</h2>
          <form onSubmit={(e) => handleSubmit(e, "contact")}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact?.phone || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, phone: e.target.value },
                  })
                }
                placeholder="+251 11 662 3348"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={settings.contact?.email || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: e.target.value },
                  })
                }
                placeholder="hello@bunahouse.et"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telegram Username</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact?.telegram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, telegram: e.target.value },
                  })
                }
                placeholder="BunaHouseAddis"
              />
            </div>
            <button type="submit" className="btn-save" disabled={savingStates.contact}>
              {savingStates.contact ? "Saving..." : "Save Contact"}
            </button>
          </form>
        </div>

        {/* Delivery Info */}
        <div className="settings-card">
          <h2 className="settings-card-title">🚚 Delivery Information</h2>
          <form onSubmit={(e) => handleSubmit(e, "delivery")}>
            <div className="form-group">
              <label className="form-label">Minimum Order (Br)</label>
              <input
                type="text"
                className="form-input"
                value={settings.delivery?.minimum || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, minimum: e.target.value },
                  })
                }
                placeholder="1,500"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Time</label>
              <input
                type="text"
                className="form-input"
                value={settings.delivery?.time || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, time: e.target.value },
                  })
                }
                placeholder="30–45 minutes"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Areas</label>
              <input
                type="text"
                className="form-input"
                value={settings.delivery?.areas || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, areas: e.target.value },
                  })
                }
                placeholder="Bole, CMC and Megenagna"
              />
            </div>
            <button type="submit" className="btn-save" disabled={savingStates.delivery}>
              {savingStates.delivery ? "Saving..." : "Save Delivery Info"}
            </button>
          </form>
        </div>

        {/* Promo Bar Messages */}
        <div className="settings-card">
          <h2 className="settings-card-title">📢 Promo Bar Messages</h2>
          <form onSubmit={(e) => handleSubmit(e, "promo_bar")}>
            <div className="form-group">
              <label className="form-label">Messages (One per line)</label>
              <textarea
                className="form-textarea"
                value={settings.promo_bar?.messages?.join('\n') || ""}
                onChange={(e) => {
                  const messages = e.target.value.split('\n').filter((line) => line.trim() !== '');
                  setSettings({
                    ...settings,
                    promo_bar: { messages },
                  });
                }}
                placeholder="RATED 4.9 BY 2,000+ COFFEE LOVERS ✦&#10;FLAT 20% OFF ON YOUR FIRST ORDER&#10;ORDER NOW"
                rows={6}
              />
              <p className="form-hint">
                Each line will be a separate message in the scrolling promo bar. Add emojis or special characters like ✦ for style.
              </p>
            </div>
            <button type="submit" className="btn-save" disabled={savingStates.promo_bar}>
              {savingStates.promo_bar ? "Saving..." : "Save Promo Messages"}
            </button>
          </form>
        </div>

        {/* Product Card Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">🛍️ Product Card</h2>
          <form onSubmit={(e) => handleSubmit(e, "product_card")}>
            <div className="form-group">
              <label className="form-label">Available Sizes (comma separated)</label>
              <input
                type="text"
                className="form-input"
                value={settings.product_card?.sizes?.join(', ') || ""}
                onChange={(e) => {
                  const sizes = e.target.value.split(',').map(s => s.trim());
                  setSettings({
                    ...settings,
                    product_card: { ...settings.product_card, sizes },
                  });
                }}
                placeholder="Small, Medium, Large"
              />
              <p className="form-hint">Size options shown in product card</p>
            </div>

            <div className="form-group">
              <label className="form-label">Card Type</label>
              <select
                className="form-input"
                value={settings.product_card?.type || "instructions"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    product_card: { ...settings.product_card, type: e.target.value },
                  })
                }
              >
                <option value="instructions">Special Instructions (Text input)</option>
                <option value="none">None (Size only)</option>
              </select>
              <p className="form-hint">Choose how customers can customize their order</p>
            </div>

            {settings.product_card?.type === "instructions" && (
              <div className="form-group">
                <label className="form-label">Special Instructions Label</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.product_card?.instructions_label || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product_card: { ...settings.product_card, instructions_label: e.target.value },
                    })
                  }
                  placeholder="Special Instructions"
                />
                <input
                  type="text"
                  className="form-input"
                  value={settings.product_card?.instructions_placeholder || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product_card: { ...settings.product_card, instructions_placeholder: e.target.value },
                    })
                  }
                  placeholder="Placeholder text (e.g., Any special requests?)"
                  style={{ marginTop: '8px' }}
                />
              </div>
            )}

            <button type="submit" className="btn-save" disabled={savingStates.product_card}>
              {savingStates.product_card ? "Saving..." : "Save Product Card"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
