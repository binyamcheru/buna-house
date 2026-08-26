"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAdminUser, DEMO_ADMIN_EMAIL } from "@/lib/auth";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DashboardView } from "./components/DashboardView";
import { ProductsView } from "./components/ProductsView";
import { CategoriesView } from "./components/CategoriesView";
import { OrdersView } from "./components/OrdersView";
import { LeadsView } from "./components/LeadsView";
import { CustomersView } from "./components/CustomersView";
import { HeroImagesView } from "./components/HeroImagesView";
import { SettingsView } from "./components/SettingsView";
import { ToastProvider } from "./components/Toast";
import { ConfirmProvider } from "./components/ConfirmDialog";

export type AdminView = "dashboard" | "products" | "categories" | "orders" | "leads" | "customers" | "hero-images" | "settings";

export default function AdminPage() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminPageContent />
      </ConfirmProvider>
    </ToastProvider>
  );
}

function AdminPageContent() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/admin/login');
      } else {
        setIsLoading(false);
        fetchPendingOrdersCount();
        const user = await getAdminUser();
        setIsDemoUser(user?.email?.toLowerCase() === DEMO_ADMIN_EMAIL);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch pending orders count
  const fetchPendingOrdersCount = async () => {
    try {
      const response = await fetch('/api/orders?status=pending');
      const data = await response.json();
      if (response.ok && data.orders) {
        setPendingOrdersCount(data.orders.length);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--cream)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--cream-line)',
            borderTopColor: 'var(--caramel)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  const viewTitles: Record<AdminView, string> = {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    orders: "Orders",
    leads: "Leads",
    customers: "Customers",
    "hero-images": "Hero Images",
    settings: "Settings",
  };

  return (
    <div className="admin-shell">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
      />

      <div className="main-content">
        <Topbar
          title={viewTitles[currentView]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {isDemoUser && (
          <div
            style={{
              background: 'var(--amber-bg)',
              color: 'var(--amber)',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              borderBottom: '1px solid var(--cream-line)',
            }}
          >
            👁️ Demo Mode — you're viewing a live portfolio preview. All data is real, but changes (create/edit/delete) are disabled.
          </div>
        )}

        <div className="page-content">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "products" && <ProductsView />}
          {currentView === "categories" && <CategoriesView />}
          {currentView === "orders" && <OrdersView onOrderUpdate={fetchPendingOrdersCount} />}
          {currentView === "leads" && <LeadsView />}
          {currentView === "customers" && <CustomersView />}
          {currentView === "hero-images" && <HeroImagesView />}
          {currentView === "settings" && <SettingsView />}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
