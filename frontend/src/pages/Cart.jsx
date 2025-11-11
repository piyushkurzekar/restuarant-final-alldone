import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const extrasList = [
  { text: "Extra Cheese", price: 50 },
  { text: "Extra Salt", price: 10 },
  { text: "Extra Butter", price: 30 },
  { text: "Extra Onion", price: 20 },
  { text: "Extra Roti", price: 25 },
];

const Cart = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tableNotes, setTableNotes] = useState({});

  const [gst_type, setgst_type] = useState("");


  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentmode, setpaymentmode] = useState("");

  const fetchCartOrders = async () => {
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/orders/cart");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchCartOrders();
  }, []);

  const handleNoteChange = (orderId, index, field, value) => {
    setTableNotes((prev) => {
      const notes = prev[orderId] || [{ text: "", qty: 1 }];
      const updated = [...notes];
      updated[index][field] = field === "qty" ? parseInt(value, 10) || 1 : value;
      return { ...prev, [orderId]: updated };
    });
  };

  const handleAddNote = (orderId) => {
    setTableNotes((prev) => {
      const notes = prev[orderId] || [{ text: "", qty: 1 }];
      return { ...prev, [orderId]: [...notes, { text: "", qty: 1 }] };
    });
  };

  const handleRemoveNote = (orderId, index) => {
    setTableNotes((prev) => {
      const notes = prev[orderId] || [];
      return { ...prev, [orderId]: notes.filter((_, i) => i !== index) };
    });
  };

  // ✅ Confirm Order (with price in notes)
  const handleConfirmOrder = async (order) => {
    const notes = tableNotes[order.id] || [];

    const formattedNotes = notes
      .filter(n => n.text) // avoid blank
      .map(n => {
        const extra = extrasList.find(e => e.text === n.text);
        return {
          text: n.text,
          qty: n.qty,
          price: extra ? extra.price : 0,
          total: extra ? extra.price * n.qty : 0
        };
      });

    try {
      const res = await fetch(`https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/orders/confirm/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: formattedNotes }), // ✅ send with price
      });
      if (!res.ok) throw new Error("Failed to confirm order");

      alert("Order sent to Kitchen!");
      fetchCartOrders();
    } catch (err) {
      console.error(err);
      alert("Error confirming order");
    }
  };

  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleCompleteOrder = async () => {
    if (!paymentmode) return alert("Please select payment mode!");
    if (!gst_type) return alert("Please select GST type!");

    try {
      const res = await fetch(
        `https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/orders/complete/${selectedOrder.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentmode,
            gst_type, // ✅ send GST type to backend
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to complete order");

      setShowPaymentModal(false);
      alert("✅ Order completed!");
      fetchCartOrders();
      navigate(`/invoice/${selectedOrder.id}`);
    } catch (err) {
      console.error(err);
      alert("Error completing order");
    }
  };

  const handleAddMore = (order) => {
    navigate("/takeorders", { state: { addMoreFor: order } });
  };

  return (
    <div className="container my-3">
      <h2>Cart</h2>
      {orders.length === 0 && <p>No pending or confirmed orders.</p>}

      {orders.map((order) => {
        const notes = tableNotes[order.id] || [{ text: "", qty: 1 }];
        return (
          <div key={order.id} className="card shadow p-3 mb-3 border">
            <h5>
              Guest: {order.guestName} | Table: {order.tableNumber} | Contact:{" "}
              {order.contact} | Date: {new Date(order.dateTime).toLocaleString()} |{" "}
              Status: {order.status}
            </h5>

            <p style={{ fontWeight: "500", color: "#0d6efd" }}>
              👨‍🍳 Received By: {order.receiveby || "Not Assigned"}
            </p>

            <ul>
              {order.items?.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.quantity || 1} - ₹
                  {item.total || item.price * (item.quantity || 1)}
                </li>
              ))}
              {notes.map((note, idx) => {
                if (!note.text) return null;
                const extra = extrasList.find((e) => e.text === note.text);
                return (
                  <li key={idx} style={{ color: "blue" }}>
                    {note.text} x {note.qty} - ₹{extra ? extra.price * note.qty : 0}
                  </li>
                );
              })}
            </ul>

            <div className="mt-2">
              <h6>Add Special Notes / Extras</h6>
              {notes.map((note, idx) => (
                <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                  <select
                    className="form-control"
                    value={note.text}
                    onChange={(e) =>
                      handleNoteChange(order.id, idx, "text", e.target.value)
                    }
                  >
                    <option value="">Select Extra</option>
                    {extrasList.map((extra, i) => (
                      <option key={i} value={extra.text}>
                        {extra.text} (₹{extra.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Qty"
                    min="1"
                    style={{ width: "80px" }}
                    value={note.qty}
                    onChange={(e) =>
                      handleNoteChange(order.id, idx, "qty", e.target.value)
                    }
                  />
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveNote(order.id, idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleAddNote(order.id)}
              >
                + Add Extra
              </button>
            </div>

            <div className="mt-3 d-flex gap-2">
              {order.status === "Pending" && (
                <button className="btn btn-primary" onClick={() => handleConfirmOrder(order)}>
                  Confirm Order
                </button>
              )}
              <button className="btn btn-warning" onClick={() => handleAddMore(order)}>
                Add More
              </button>
              {order.status !== "Completed" && (
                <button className="btn btn-success" onClick={() => openPaymentModal(order)}>
                  Complete Order
                </button>
              )}
            </div>
          </div>
        );
      })}

      {showPaymentModal && (
        <div className="payment-modal-bg">
          <div className="payment-modal-box">
            <h5>Select Payment Mode</h5>

            <select
              className="form-select mt-2"
              value={paymentmode}
              onChange={(e) => setpaymentmode(e.target.value)}
            >
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Pending">Pending / Room</option>
              <option value="Split">Split</option>
              <option value="Other">Other</option>
            </select>

            <div style={{ marginTop: "10px" }}>
              <label htmlFor="gst_type">GST Type:</label>
              <select
                id="gst_type"
                value={gst_type}
                onChange={(e) => setgst_type(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select GST Type</option>
                <option value="intra">Intra-State (CGST + SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={handleCompleteOrder}>
                Confirm & Complete
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>



            </div>

          </div>



        </div>
      )}

      <style>{`
        .payment-modal-bg {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          display:flex; align-items:center; justify-content:center;
          z-index:10000;
        }
        .payment-modal-box {
          background:white; padding:20px; border-radius:8px;
          width:300px; box-shadow:0 0 10px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Cart;
