import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const extrasList = [
  { text: "Extra Cheese", price: 50 },
  { text: "Extra Salt", price: 10 },
  { text: "Extra Butter", price: 30 },
  { text: "Extra Onion", price: 20 },
  { text: "Extra Roti", price: 25 },
];

const Orders = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState([]);

  // ✅ Fetch completed orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/orders/completed");
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // ✅ Filter by date
  const filteredOrders = selectedDate
    ? orders.filter(
        (order) =>
          new Date(order.dateTime).toLocaleDateString("en-CA") === selectedDate
      )
    : [];

  // ✅ Calculate total
  const totalAmount = filteredOrders.reduce((sum, order) => {
    const itemsTotal = order.items.reduce(
      (s, item) => s + (item.total || item.price * (item.quantity || 1)),
      0
    );

    const notesTotal = (order.notes || []).reduce((s, note) => {
      const extra = extrasList.find((e) => e.text === note.text);
      return s + (extra ? extra.price * note.qty : 0);
    }, 0);

    return sum + itemsTotal + notesTotal;
  }, 0);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Orders Summary</h2>

      {/* 📅 Date Picker */}
      <div className="mb-3 w-25">
        <label className="form-label fw-bold">Select Date</label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* 🧾 Orders Table */}
      {selectedDate && (
        <>
          <h5 className="mb-3">
            Showing orders for:{" "}
            <span className="text-primary">{selectedDate}</span>
          </h5>

          <table className="table table-bordered shadow-sm">
            <thead className="table-success">
              <tr>
                <th>Customer Name</th>
                <th>Table</th>
                <th>Contact</th>
                <th>Payment Mode</th>
                <th>Amount (₹)</th>
                <th>Date & Time</th>
                <th>Received By</th> {/* ✅ Added */}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const itemsTotal = order.items.reduce(
                    (s, item) =>
                      s + (item.total || item.price * (item.quantity || 1)),
                    0
                  );

                  const notesTotal = (order.notes || []).reduce((s, note) => {
                    const extra = extrasList.find((e) => e.text === note.text);
                    return s + (extra ? extra.price * note.qty : 0);
                  }, 0);

                  const amount = itemsTotal + notesTotal;

                  return (
                    <tr key={order.id}>
                      <td>{order.guestName}</td>
                      <td>{order.tableNumber}</td>
                      <td>{order.contact}</td>
                      <td>{order.paymentMethod || "UPI"}</td>
                      <td>₹ {amount.toLocaleString()}</td>
                      <td>{new Date(order.dateTime).toLocaleString()}</td>
                      <td>{order.receiveby || "—"}</td> {/* ✅ Fixed */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No orders found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredOrders.length > 0 && (
            <div className="alert alert-info mt-3">
              <strong>Total Amount: ₹ {totalAmount.toLocaleString()}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
