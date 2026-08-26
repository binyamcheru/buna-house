"use client";

import { useState, useEffect } from "react";
import {
  DollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TrendUpIcon,
  TrendDownIcon,
  EyeIcon,
} from "./icons";

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    stats: {
      totalRevenue: string;
      totalOrders: number;
      totalCustomers: number;
      pendingOrders: number;
    };
    recentOrders: Array<{
      id: string;
      customer: string;
      items: number;
      total: number;
      status: string;
      time: string;
    }>;
    chartData: Array<{
      day: string;
      total: number;
    }>;
    popularProducts: Array<{
      name: string;
      count: number;
    }>;
  } | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--cream-line)',
          borderTopColor: 'var(--caramel)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  const kpiData = [
    {
      label: "Revenue",
      value: `Br ${stats?.stats?.totalRevenue ? parseFloat(stats.stats.totalRevenue).toLocaleString() : '0'}`,
      trend: "+12.4%",
      positive: true,
      icon: DollarIcon,
    },
    {
      label: "Orders",
      value: stats?.stats?.totalOrders?.toString() || "0",
      trend: "+8.1%",
      positive: true,
      icon: ShoppingBagIcon,
    },
    {
      label: "Customers",
      value: stats?.stats?.totalCustomers?.toString() || "0",
      trend: "+15.3%",
      positive: true,
      icon: UsersIcon,
    },
    {
      label: "Pending Orders",
      value: stats?.stats?.pendingOrders?.toString() || "0",
      trend: "",
      positive: true,
      icon: ShoppingBagIcon,
    },
  ];

  const salesData = stats?.chartData || [];
  const maxValue = salesData.length > 0 ? Math.max(...salesData.map((d: any) => d.total)) : 1;

  const popularProducts = stats?.popularProducts || [];

  // Fetch recent orders from real API
  const recentOrders = stats?.recentOrders || [];

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-icon">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div
                  className={`kpi-trend ${
                    kpi.positive ? "kpi-trend-positive" : "kpi-trend-negative"
                  }`}
                >
                  {kpi.positive ? "↑" : "↓"} {kpi.trend}
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-grid">
        {/* Sales Chart */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">Sales Trend — Last 7 Days</h3>
          </div>
          <div className="card-body">
            {salesData.length > 0 ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "200px" }}>
                {salesData.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: `${(item.total / maxValue) * 180}px`,
                        background: "linear-gradient(180deg, #C08552 0%, #4A2E1F 100%)",
                        borderRadius: "8px 8px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    />
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--espresso-dim)" }}>
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                No sales data available yet
              </div>
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">Popular Products</h3>
          </div>
          <div className="card-body">
            {popularProducts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {popularProducts.map((product: any, index: number) => {
                  const maxCount = popularProducts[0]?.count || 1;
                  const percent = Math.round((product.count / maxCount) * 100);

                  return (
                    <div key={index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "var(--caramel)",
                            color: "var(--brown-darker)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "var(--espresso)" }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--espresso-dim)" }}>
                          {product.count}
                        </div>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "var(--panel)",
                          borderRadius: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: "100%",
                            background: "var(--caramel)",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                No popular products data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">Recent Orders</h3>
          <button className="btn btn-secondary btn-sm">
            View All →
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.items}</td>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>Br {order.total}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "delivered"
                          ? "badge-green"
                          : order.status === "preparing"
                          ? "badge-blue"
                          : "badge-amber"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{order.time}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ padding: "6px 12px" }}>
                      <EyeIcon size={14} strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
