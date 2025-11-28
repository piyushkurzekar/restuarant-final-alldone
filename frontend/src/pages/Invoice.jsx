import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaShare } from "react-icons/fa";

const extrasList = [
  { text: "Extra Cheese", price: 50 },
  { text: "Extra Salt", price: 10 },
  { text: "Extra Butter", price: 30 },
  { text: "Extra Onion", price: 20 },
  { text: "Extra Roti", price: 25 },
];

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://restuarant-final-alldone.onrender.com/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Fetch order error:", err);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="container my-4">
        <p className="text-danger">⚠️ No order data found.</p>
        <button className="btn btn-primary" onClick={() => navigate("/takeorders")}>
          Go Back
        </button>
      </div>
    );
  }

  // Calculate totals
  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + (item.total || item.price * (item.quantity || 1)),
    0
  ) || 0;

  const notes = Array.isArray(order.notes) ? order.notes : [];
  const notesTotal = notes.reduce((sum, note) => {
    const extra = extrasList.find((e) => e.text === note.text);
    return sum + (extra ? extra.price * note.qty : 0);
  }, 0);

  const finalTotal = itemsTotal + notesTotal;

  // Share via WhatsApp
  const handleShareWhatsApp = async () => {
    if (!order.contact) {
      alert("❌ No contact number available!");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Generate invoice PDF via backend
      const res = await fetch(
        `https://restuarant-final-alldone.onrender.com/api/orders/send-invoice/${order.id}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!data.publicUrl) {
        alert("❌ Failed to generate invoice PDF.");
        return;
      }

      // 2️⃣ Format phone number
      const phone = order.contact?.toString().trim() || "";
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      // 3️⃣ Format invoice message nicely
      const message = `
🧾 *INVOICE DETAILS*
━━━━━━━━━━━━━━━━━━━
🏷️ *Invoice ID:* ${order.id}
📅 *Date:* ${new Date(order.date || Date.now()).toLocaleDateString("en-IN")}
💰 Total Amount: ₹${order.grand_total?.toFixed(2)}
📎 *Download Invoice (PDF):* ${data.publicUrl}

📍 *Thank you for visiting Shivaam Farms & Resorts!*
━━━━━━━━━━━━━━━━━━━
      `.trim();

      // 4️⃣ Open WhatsApp with formatted message
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("Share error:", err);
      alert("❌ Something went wrong while sharing invoice.");
    } finally {
      setLoading(false);
    }
  };
  // console.log("🧾 Order data:", order);


  return (
    <div className="container my-2 p-4 border rounded shadow bg-white position-relative">
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "5rem",
          color: "rgba(0,0,0,0.07)",
          fontWeight: "700",
          textTransform: "uppercase",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        SHIVAAM FARMS & RESORTS
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h2 className="fw-bold text-success">SHIVAAM FARMS & RESORTS</h2>
            <p className="mb-0">01, AB, Green Planet, Omkar Nagar</p>
            <p className="mb-0">Phone: +91 7387750307</p>
            <p className="mb-0">Email: shivaamfarmsandresorts@gmail.com</p>
          </div>
          <div className="col-md-6 text-end">
            <h4 className="fw-bold">INVOICE</h4>
            <p className="mb-0"><strong>Invoice To:</strong> {order.guestName}</p>
            <p className="mb-0"><strong>Table:</strong> {order.tableNumber}</p>
            <p className="mb-0"><strong>Contact:</strong> {order.contact}</p>
            <p className="mb-0"><strong>Date:</strong> {new Date(order.dateTime).toLocaleString()}</p>
            <p className="mb-0"><strong>Received By:</strong> {order.receiveby || "—"}</p>
            <p className="mb-0"><strong>Payment Mode:</strong> {order.paymentmode || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-success">
              <tr>
                <th>Description</th>
                <th className="text-center">Rate (₹)</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.price}</td>
                  <td className="text-center">{item.quantity || 1}</td>
                  <td className="text-end">{item.total || item.price * (item.quantity || 1)}</td>
                </tr>
              ))}

              {notes.map((note, idx) => {
                const extra = extrasList.find((e) => e.text === note.text);
                if (!extra) return null;
                return (
                  <tr key={`note-${idx}`} className="table-info">
                    <td>{note.text} (Extra)</td>
                    <td className="text-center">{extra.price}</td>
                    <td className="text-center">{note.qty}</td>
                    <td className="text-end">{extra.price * note.qty}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="3" className="text-end">Sub Total</th>
                <th className="text-end text-success">₹ {finalTotal}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ✅ GST Table (Dynamic Based on gst_type) */}
        {order.gst_type && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="table-warning">
                <tr>
                  <th>Tax Type</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.gst_type?.toLowerCase() === "intra" ? (
                  <>
                    <tr>
                      <td>CGST (2.5%)</td>
                      <td className="text-end">{order.cgst?.toFixed(2) || 0}</td>
                    </tr>
                    <tr>
                      <td>SGST (2.5%)</td>
                      <td className="text-end">{order.sgst?.toFixed(2) || 0}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td>IGST (5%)</td>
                    <td className="text-end">{order.igst?.toFixed(2) || 0}</td>
                  </tr>
                )}

                <tr className="table-info fw-bold">
                  <td>Total GST</td>
                  <td className="text-end">{order.gst_total?.toFixed(2) || 0}</td>
                </tr>
                <tr className="table-success fw-bold">
                  <td>Grand Total</td>
                  <td className="text-end">₹ {order.grand_total?.toFixed(2) || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}



        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-success" onClick={handleShareWhatsApp} disabled={loading}>
            <FaShare className="me-2" />
            {loading ? "Generating PDF..." : "Share via WhatsApp"}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/takeorders")}>
            Back to Take Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
