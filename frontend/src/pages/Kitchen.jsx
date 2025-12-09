import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const notifiedOrders = useRef(new Set());
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const enableSound = () => setSoundEnabled(true);
    window.addEventListener("click", enableSound, { once: true });
    return () => window.removeEventListener("click", enableSound);
  }, []);

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio("/notification.mp3");
    audio.play().catch((err) => console.warn("Audio play blocked", err));
  };

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch("https://restuarant-final-alldone.onrender.com/api/orders/kitchen");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    orders.forEach((order) => {
      const orderKey = order.id;
      if (order.notes && !notifiedOrders.current.has(orderKey)) {
        const notesText = Array.isArray(order.notes)
          ? order.notes.map((n) => `${n.qty} × ${n.text}`).join(", ")
          : order.notes;
        toast(`New Note for ${order.guestName || "Customer"}: ${notesText}`, {
          icon: "⚡",
        });
        playNotificationSound();
        notifiedOrders.current.add(orderKey);
      }
    });
  }, [orders]);

  const formatTime = (time) => {
    if (!time) return "—";
    try {
      return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return time;
    }
  };

  const filteredOrders = orders.filter(
    (order) => order.status?.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div
      className="container-fluid py-4 mt-4"
      style={{ background: "#f7f7f7", minHeight: "100vh" }}
    >
      <h2 className="fw-semibold mb-4">Kitchen Orders</h2>

      <ul className="nav nav-tabs mb-4">
        {["Confirmed", "Completed"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="badge bg-secondary ms-2">
                {orders.filter(
                  (o) => o.status?.toLowerCase() === tab.toLowerCase()
                ).length}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {filteredOrders.length === 0 ? (
        <p className="text-muted text-center mt-5">
          No {activeTab.toLowerCase()} orders
        </p>
      ) : (
        <div className="row g-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-success text-white py-2 rounded-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small text-light">
                      Ordered: {formatTime(order.dateTime)}
                    </div>
                    <span className="badge bg-light text-dark">
                      {order.guestName || "Customer"}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-secondary">
                      KOT #{order.id}
                    </span>
                    <span
                      className="badge"
                      style={{ backgroundColor: "#051650" }}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* 👨‍🍳 Waiter Name */}
                  {order.receiveby && (
                    <p className="text-muted small mb-2">
                      <strong>Waiter:</strong> {order.receiveby}
                    </p>
                  )}

                  <ul className="list-unstyled small mb-3">
                    {order.items?.map((item, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>
                          {item.quantity} × {item.name}
                          {item.addons && (
                            <span className="text-muted"> (+{item.addons})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <div className="alert alert-danger py-2 mb-0">
                      <strong>Note:</strong>{" "}
                      {Array.isArray(order.notes)
                        ? order.notes
                            .map((n, i) => `${n.qty} × ${n.text}`)
                            .join(", ")
                        : order.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
