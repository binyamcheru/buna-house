"use client";

import { useState, useEffect } from "react";
import React from "react";
import { EyeIcon, XIcon } from "./icons";
import { sendTelegramMessage } from "@/lib/telegram";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  date: string;
  address: string;
};

type OrdersViewProps = {
  onOrderUpdate?: () => void;
};

export function OrdersView({ onOrderUpdate }: OrdersViewProps = {}) {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (response.ok && data.orders) {
        // Map database orders to component format
        const mappedOrders = data.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customer: o.customer_name,
          email: o.customer_email,
          phone: o.customer_phone,
          items: (o.items || []).map((item: any) => ({
            name: item.name,
            qty: item.quantity || item.qty || 1, // Handle both quantity and qty
            price: parseFloat(item.price) || 0, // Parse price as number
          })),
          total: parseFloat(o.total),
          status: o.status,
          date: new Date(o.created_at).toLocaleString('en-ET', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          address: o.customer_address || 'No address provided',
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update orders list
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );

        // Update selectedOrder if it's the one being updated (IMPORTANT FIX)
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        if (onOrderUpdate) onOrderUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!(await confirmDialog({ message: `Delete order ${orderNumber}? This cannot be undone.`, danger: true }))) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter((o) => o.id !== orderId));
        setSelectedOrder(null);
        if (onOrderUpdate) onOrderUpdate();
        toast.success('Order deleted successfully');
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
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
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h3 className="card-title">All Orders</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--cream-line)",
                background: "var(--surface)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--espresso)",
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    {order.id}
                  </td>
                  <td>{order.customer}</td>
                  <td>{order.items.length}</td>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    Br {order.total}
                  </td>
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
                  <td style={{ fontSize: "13px", color: "var(--espresso-dim)" }}>
                    {order.date}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedOrder(order)}
                        style={{ padding: "6px 12px" }}
                      >
                        <EyeIcon size={14} strokeWidth={2.2} />
                        View
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(order.id, order.orderNumber)}
                        style={{
                          padding: "6px 12px",
                          background: 'var(--red)',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <XIcon size={14} strokeWidth={2.2} />
                        Delete
                      </button>
                    </div>
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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
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

      {/* Order Detail Slide-Over */}
      {selectedOrder && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(43, 24, 16, 0.5)",
              zIndex: 100,
            }}
            onClick={() => setSelectedOrder(null)}
          />
          <OrderDetailSlideOver
            order={selectedOrder}
            onStatusUpdate={(status) =>
              handleStatusUpdate(selectedOrder.id, status)
            }
            onClose={() => setSelectedOrder(null)}
          />
        </>
      )}
    </div>
  );
}

function OrderDetailSlideOver({
  order,
  onStatusUpdate,
  onClose,
}: {
  order: Order;
  onStatusUpdate: (status: Order["status"]) => void;
  onClose: () => void;
}) {
  // Updated statuses to match database schema
  const statuses: Order["status"][] = ["pending", "confirmed", "preparing", "ready", "delivered"];

  // Map display names for better UI
  const statusLabels: { [key: string]: string } = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    delivered: "Delivered",
  };

  // Hover state for buttons
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);

  return (
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
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

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
          Order {order.id}
        </h2>
        <button
          onClick={onClose}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--panel)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <XIcon size={18} strokeWidth={2.2} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {/* Status Stepper */}
        <div style={{ marginBottom: "28px" }}>
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
            Update Status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
            {statuses.map((status) => {
              const isActive = order.status === status;
              const isHovered = hoveredButton === status;

              return (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(status)}
                  onMouseEnter={() => setHoveredButton(status)}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "12px",
                    border: `1.5px solid ${isActive ? "var(--brown)" : isHovered ? "var(--caramel)" : "var(--cream-line)"}`,
                    background: isActive ? "var(--brown)" : isHovered ? "var(--panel)" : "var(--surface)",
                    color: isActive ? "var(--cream)" : "var(--espresso)",
                    fontSize: "13px",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    transform: isHovered && !isActive ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: isHovered && !isActive ? "0 4px 12px rgba(43, 24, 16, 0.1)" : "none",
                  }}
                >
                  {statusLabels[status]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Info */}
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
              marginBottom: "10px",
            }}
          >
            Customer
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>
            {order.customer}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <div style={{ fontSize: "14px", color: "var(--espresso-dim)" }}>
              {order.phone}
            </div>
            <button
              onClick={() => sendTelegramMessage(order.phone, order.orderNumber, order.status as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#0088cc",
                color: "white",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#006699";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0088cc";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Telegram
            </button>
          </div>
        </div>

        {/* Delivery Address */}
        <div
          style={{
            background: "var(--panel)",
            padding: "18px",
            borderRadius: "var(--radius-input)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
              marginBottom: "10px",
            }}
          >
            Delivery Address
          </div>
          <div style={{ fontSize: "14px", color: "var(--espresso-dim)" }}>
            {order.address}
          </div>
        </div>

        {/* Order Items */}
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
          Order Items
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom:
                  idx < order.items.length - 1
                    ? "1px solid var(--cream-line)"
                    : "none",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Qty: {item.qty}
                </div>
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                Br {item.price * item.qty}
              </div>
            </div>
          ))}

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "2px solid var(--cream-line)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700 }}>Total</div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: "var(--brown)",
              }}
            >
              Br {order.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
