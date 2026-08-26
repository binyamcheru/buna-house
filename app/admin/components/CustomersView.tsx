"use client";

import { useState, useEffect } from "react";
import { DownloadIcon, EyeIcon } from "./icons";
import { useToast } from "./Toast";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
};

export function CustomersView() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const itemsPerPage = 10;

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      const data = await response.json();

      if (response.ok && data.customers) {
        const mappedCustomers = data.customers.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'N/A',
          orders: c.total_orders || 0,
          totalSpent: parseFloat(c.total_spent) || 0,
          lastOrder: c.created_at ? new Date(c.created_at).toLocaleDateString('en-ET') : 'N/A',
        }));
        setCustomers(mappedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!customers || customers.length === 0) {
      toast.error('No customers to export');
      return;
    }
    const headers = "Name,Email,Phone,Orders,Total Spent,Last Order";
    const rows = customers
      .map((c) => `${c.name},${c.email},${c.phone},${c.orders},${c.totalSpent},${c.lastOrder}`)
      .join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

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
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">All Customers</h3>
          <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
            <DownloadIcon size={16} strokeWidth={2.2} />
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "var(--caramel)",
                          color: "var(--brown-darker)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <span style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>
                        {customer.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "13px" }}>
                      <div>{customer.email}</div>
                      <div style={{ color: "var(--muted)" }}>{customer.phone}</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{customer.orders}</td>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    Br {customer.totalSpent.toLocaleString()}
                  </td>
                  <td style={{ color: "var(--espresso-dim)", fontSize: "13px" }}>
                    {customer.lastOrder}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "6px 12px" }}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <EyeIcon size={14} strokeWidth={2.2} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: '1px solid var(--cream-line)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--espresso-dim)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, customers.length)} of {customers.length} customers
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === page ? 'var(--brown)' : 'var(--panel)',
                      color: currentPage === page ? 'var(--cream)' : 'var(--espresso)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(43, 24, 16, 0.5)",
              zIndex: 100,
            }}
            onClick={() => setSelectedCustomer(null)}
          />
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: "min(480px, 90vw)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-elevated)",
              zIndex: 110,
              display: "flex",
              flexDirection: "column",
              animation: "slideIn 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--cream-line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                Customer Details
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--panel)",
                  border: "none",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {/* Customer Avatar & Name */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--caramel)",
                    color: "var(--brown-darker)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: "28px",
                    margin: "0 auto 16px",
                  }}
                >
                  {getInitials(selectedCustomer.name)}
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    marginBottom: "8px",
                  }}
                >
                  {selectedCustomer.name}
                </h3>
              </div>

              {/* Contact Information */}
              <div
                style={{
                  background: "var(--panel)",
                  padding: "18px",
                  borderRadius: "var(--radius-input)",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                    marginBottom: "12px",
                  }}
                >
                  Contact Information
                </div>
                <div style={{ fontSize: "14px", color: "var(--espresso)", marginBottom: "8px" }}>
                  📧 {selectedCustomer.email}
                </div>
                <div style={{ fontSize: "14px", color: "var(--espresso)" }}>
                  📞 {selectedCustomer.phone}
                </div>
              </div>

              {/* Order Statistics */}
              <div
                style={{
                  background: "var(--panel)",
                  padding: "18px",
                  borderRadius: "var(--radius-input)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                    marginBottom: "16px",
                  }}
                >
                  Order Statistics
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                      Total Orders
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        color: "var(--espresso)",
                      }}
                    >
                      {selectedCustomer.orders}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                      Total Spent
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        color: "var(--caramel)",
                      }}
                    >
                      Br {selectedCustomer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                      Last Order
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--espresso)" }}>
                      {selectedCustomer.lastOrder}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                      Avg. Order Value
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--espresso)" }}>
                      Rs.{" "}
                      {selectedCustomer.orders > 0
                        ? Math.round(selectedCustomer.totalSpent / selectedCustomer.orders).toLocaleString()
                        : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
