import type { AdminView } from "../page";
import {
  CoffeeIcon,
  DashboardIcon,
  PackageIcon,
  ShoppingBagIcon,
  UsersIcon,
  MailIcon,
  SettingsIcon,
} from "./icons";

// Image icon for Hero Images
function ImageIcon({ size = 20, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// Grid icon for Categories
function GridIcon({ size = 20, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

type SidebarProps = {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
};

export function Sidebar({ currentView, onNavigate, isOpen, pendingOrdersCount = 0 }: SidebarProps) {
  const navItems = [
    {
      section: "Overview",
      items: [{ id: "dashboard" as AdminView, label: "Dashboard", icon: DashboardIcon }],
    },
    {
      section: "Manage",
      items: [
        { id: "products" as AdminView, label: "Products", icon: PackageIcon },
        { id: "categories" as AdminView, label: "Categories", icon: GridIcon },
        { id: "orders" as AdminView, label: "Orders", icon: ShoppingBagIcon, badge: pendingOrdersCount },
        { id: "leads" as AdminView, label: "Leads", icon: MailIcon },
        { id: "customers" as AdminView, label: "Customers", icon: UsersIcon },
      ],
    },
    {
      section: "System",
      items: [
        { id: "hero-images" as AdminView, label: "Hero Images", icon: ImageIcon },
        { id: "settings" as AdminView, label: "Settings", icon: SettingsIcon },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-badge">
          <CoffeeIcon size={22} strokeWidth={2} />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">Buna House</div>
          <div className="sidebar-logo-caption">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${currentView === item.id ? "nav-item-active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={18} strokeWidth={2.2} />
                  <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                  {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profile */}
      <div className="sidebar-profile">
        <div className="profile-avatar">AK</div>
        <div className="profile-info">
          <div className="profile-name">Admin User</div>
          <div className="profile-role">Administrator</div>
        </div>
      </div>
    </aside>
  );
}
