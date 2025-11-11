// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import "bootstrap/dist/css/bootstrap.min.css";

// const data = [
//   { name: "Jan", expenses: 32000 },
//   { name: "Feb", expenses: 35000 },
//   { name: "Mar", expenses: 33000 },
//   { name: "Apr", expenses: 37000 },
//   { name: "May", expenses: 36000 },
//   { name: "Jun", expenses: 42000 },
//   { name: "July", expenses: 65000 },
//   { name: "Aug", expenses: 37000 },
//   { name: "Sep", expenses: 87000 },
//   { name: "Oct", expenses: 57000 },
//   { name: "Nov", expenses: 69000 },
//   { name: "Dec", expenses: 47000 },
// ];

// const Finance = () => {
//   return (
//     <div className="container mt-4 w-75">
//       <div className="card shadow-sm p-3">
//         <h5 className="mb-3">Expense Breakdown</h5>
//         <p className="text-muted">Monthly expenses analysis</p>
//         <ResponsiveContainer width="100%" height={350}>
//           <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="expenses" fill="#008080" barSize={40} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default Finance;

import React, { useState, useEffect } from "react";
import OverviewCharts from "../components/FinanceTable/OverviewCharts";
import RecentTransactions from "../components/FinanceTable/RecentTransactions";
import RevenueTable from "../components/FinanceTable/RevenueTable";
import ExpenseTable from "../components/FinanceTable/ExpenseTable";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartDataLabels
);

const Finance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("Last Month");

  // ✅ States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [netLoss, setNetLoss] = useState(0);
  const [revenue, setRevenue] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [months, setMonths] = useState([]);

  // ✅ Fetch summary
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/finance-summary")
      .then((res) => {
        if (res.data) {
          setTotalRevenue(res.data.totalRevenue || 0);
          setTotalExpenses(res.data.totalExpenses || 0);
          setNetProfit(res.data.netProfit || 0);
          setNetLoss(res.data.netLoss || 0);
        }
      })
      .catch(() => console.log("Backend not ready, using defaults"));
  }, []);

  // ✅ Fetch Revenue & Expenses Totals for Cards (runs once on page load)
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/revenue")
      .then((res) => {
        if (res.data?.values) {
          const sumRevenue = res.data.values.reduce((acc, val) => acc + val, 0);
          setTotalRevenue(sumRevenue);
        }
      })
      .catch(() => console.log("Backend not ready for revenue"));

    axios
      .get("http://localhost:4000/api/expenses")
      .then((res) => {
        if (res.data?.values) {
          const sumExpenses = res.data.values.reduce((acc, val) => acc + val, 0);
          setTotalExpenses(sumExpenses);
        }
      })
      .catch(() => console.log("Backend not ready for expenses"));
  }, []);

  // ✅ Auto-calc Net Profit / Loss
  useEffect(() => {
    const profit = totalRevenue - totalExpenses;
    setNetProfit(profit > 0 ? profit : 0);
    setNetLoss(totalExpenses > totalRevenue ? totalExpenses - totalRevenue : 0);
  }, [totalRevenue, totalExpenses]);

  // ✅ Fetch revenue for chart (only when revenue tab is active)
  useEffect(() => {
    if (activeTab === "revenue") {
      axios
        .get("http://localhost:4000/api/revenue")
        .then((res) => {
          if (res.data?.values && res.data?.months) {
            setRevenue(res.data.values);
            setMonths(res.data.months);
          }
        })
        .catch(() => console.log("Backend not ready for revenue"));
    }
  }, [activeTab]);

  // ✅ Fetch expenses for chart (only when expenses tab is active)
  useEffect(() => {
    if (activeTab === "expenses") {
      axios
        .get("http://localhost:4000/api/expenses")
        .then((res) => {
          if (res.data?.values && res.data?.months) {
            setExpenses(res.data.values);
            setMonths(res.data.months);
          }
        })
        .catch(() => console.log("Backend not ready for expenses"));
    }
  }, [activeTab]);

  // ✅ Chart configs (Revenue)
  const revenueData = {
    labels: months,
    datasets: [
      {
        label: "Revenue",
        data: revenue,
        fill: true,
        backgroundColor: "rgba(0, 128, 0, 0.2)",
        borderColor: "green",
        pointBackgroundColor: "green",
        pointRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        align: "top",
        color: "black",
        font: { weight: "bold" },
        formatter: (value) => `₹${value.toLocaleString()}`,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Revenue: ₹${ctx.raw.toLocaleString()}`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val / 1000}k`,
        },
      },
    },
  };

  // ✅ Chart configs (Expenses)
  const expensesData = {
    labels: months,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
        fill: true,
        backgroundColor: "rgba(255, 99, 133, 0.16)",
        borderColor: "red",
        pointBackgroundColor: "red",
        pointRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const expensesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        align: "top",
        color: "black",
        font: { weight: "bold" },
        formatter: (value) => `₹${value.toLocaleString()}`,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Expenses: ₹${ctx.raw.toLocaleString()}`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val / 1000}k`,
        },
      },
    },
  };

  return (
    <div className="container-fluid mt-4">
      {/* === Header === */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div className="mb-2">
          <h4 className="fw-bold">Finance Overview</h4>
          <p className="text-muted mb-0">Track revenue, expenses, and profitability</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeRange}
            </button>
            <ul className="dropdown-menu">
              {["Last Month", "Last 3 Months", "Last 6 Months", "Last Year"].map((range) => (
                <li key={range}>
                  <button className="dropdown-item" onClick={() => setTimeRange(range)}>
                    {range}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button className="btn btn-outline-secondary">Export</button>
        </div>
      </div>


      {/* === Summary Cards === */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Revenue</h6>
            <h4 className="fw-bold text-dark">₹{totalRevenue.toLocaleString()}</h4>
            <small className="text-success">
              ▲ Based on database values
            </small>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Expenses</h6>
            <h4 className="fw-bold text-dark">₹{totalExpenses.toLocaleString()}</h4>
            <small className="text-danger">
              ▼ Based on database values
            </small>
          </div>
        </div>

        {/* Net Profit */}
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Profit</h6>
            <h4 className="fw-bold text-success">₹{netProfit.toLocaleString()}</h4>
            <small className="text-success">
              ▲ Auto calculated
            </small>
          </div>
        </div>

        {/* Net Loss */}
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Loss</h6>
            <h4 className="fw-bold text-danger">₹{netLoss.toLocaleString()}</h4>
            <small className="text-danger">
              ▼ Auto calculated
            </small>
          </div>
        </div>
      </div>



      {/* === Tabs === */}
      <ul className="nav nav-pills mb-4 flex-wrap">
        {["overview", "revenue", "expenses"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* === Charts === */}
      <div className="card p-3 shadow-sm mb-4">
        {activeTab === "overview" && <OverviewCharts />}
        {activeTab === "revenue" && (
          <RevenueTable
            revenueData={revenueData}
            revenueOptions={revenueOptions}
          />
        )}
        {activeTab === "expenses" && (
          <ExpenseTable
            expensesData={expensesData}
            expensesOptions={expensesOptions}
          />
        )}
      </div>

      {/* === Transactions Table === */}
      <RecentTransactions />
    </div>
  );
};

export default Finance;


//  finalTotal:
//         order.grand_total ||
//         ((order.total || 0) + (order.gst_total || 0)),





  // status: "Completed",
  //       paymentmode: paymentmode || null,
  //       cgst,
  //       sgst,
  //       igst,
  //       gst_total: cgst + sgst + igst,   // ✅ add this for total GST
  //       grand_total: total + cgst + sgst + igst,  // ✅ lowercase for React
  //       updated_at: new Date().toISOString(),


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const extrasList = [
//   { text: "Extra Cheese", price: 50 },
//   { text: "Extra Salt", price: 10 },
//   { text: "Extra Butter", price: 30 },
//   { text: "Extra Onion", price: 20 },
//   { text: "Extra Roti", price: 25 },
// ];

// const Cart = () => {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [tableNotes, setTableNotes] = useState({});

//   // 🆕 Payment modal state
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [paymentmode, setpaymentmode] = useState("");

//   const fetchCartOrders = async () => {
//     try {
//       const res = await fetch("http://localhost:4000/api/orders/cart");
//       const data = await res.json();
//       setOrders(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setOrders([]);
//     }
//   };

//   useEffect(() => {
//     fetchCartOrders();
//   }, []);

//   const handleNoteChange = (orderId, index, field, value) => {
//     setTableNotes((prev) => {
//       const notes = prev[orderId] || [{ text: "", qty: 1 }];
//       const updated = [...notes];
//       updated[index][field] = field === "qty" ? parseInt(value, 10) || 1 : value;
//       return { ...prev, [orderId]: updated };
//     });
//   };

//   const handleAddNote = (orderId) => {
//     setTableNotes((prev) => {
//       const notes = prev[orderId] || [{ text: "", qty: 1 }];
//       return { ...prev, [orderId]: [...notes, { text: "", qty: 1 }] };
//     });
//   };

//   const handleRemoveNote = (orderId, index) => {
//     setTableNotes((prev) => {
//       const notes = prev[orderId] || [];
//       return { ...prev, [orderId]: notes.filter((_, i) => i !== index) };
//     });
//   };

//   const handleConfirmOrder = async (order) => {
//     const notes = tableNotes[order.id] || [];
//     try {
//       const res = await fetch(`http://localhost:4000/api/orders/confirm/${order.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ notes }),
//       });
//       if (!res.ok) throw new Error("Failed to confirm order");
//       alert("Order sent to Kitchen!");
//       fetchCartOrders();
//     } catch (err) {
//       console.error(err);
//       alert("Error confirming order");
//     }
//   };

//   // ✅ Instead of completing directly, show payment modal first
//   const openPaymentModal = (order) => {
//     setSelectedOrder(order);
//     setShowPaymentModal(true);
//   };

//   // ✅ Complete order WITH payment mode
//   const handleCompleteOrder = async () => {
//     if (!paymentmode) return alert("Please select payment mode!");

//     try {
//       const res = await fetch(
//         `http://localhost:4000/api/orders/complete/${selectedOrder.id}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//          body: JSON.stringify({ paymentmode }),

//         }
//       );

//       if (!res.ok) throw new Error("Failed to complete order");

//       setShowPaymentModal(false);
//       alert("✅ Order completed!");
//       fetchCartOrders();
//       navigate(`/invoice/${selectedOrder.id}`);
//     } catch (err) {
//       console.error(err);
//       alert("Error completing order");
//     }
//   };
  

//   const handleAddMore = (order) => {
//     navigate("/takeorders", { state: { addMoreFor: order } });
//   };

//   return (
//     <div className="container my-3">
//       <h2>Cart</h2>
//       {orders.length === 0 && <p>No pending or confirmed orders.</p>}

//       {orders.map((order) => {
//         const notes = tableNotes[order.id] || [{ text: "", qty: 1 }];
//         return (
//           <div key={order.id} className="card shadow p-3 mb-3 border">
//             <h5>
//               Guest: {order.guestName} | Table: {order.tableNumber} | Contact:{" "}
//               {order.contact} | Date: {new Date(order.dateTime).toLocaleString()} |{" "}
//               Status: {order.status}
//             </h5>

//             <p style={{ fontWeight: "500", color: "#0d6efd" }}>
//               👨‍🍳 Received By: {order.receiveby || "Not Assigned"}
//             </p>

//             <ul>
//               {order.items?.map((item, idx) => (
//                 <li key={idx}>
//                   {item.name} x {item.quantity || 1} - ₹
//                   {item.total || item.price * (item.quantity || 1)}
//                 </li>
//               ))}
//               {notes.map((note, idx) => {
//                 if (!note.text) return null;
//                 const extra = extrasList.find((e) => e.text === note.text);
//                 return (
//                   <li key={idx} style={{ color: "blue" }}>
//                     {note.text} x {note.qty} - ₹{extra ? extra.price * note.qty : 0}
//                   </li>
//                 );
//               })}
//             </ul>

//             <div className="mt-2">
//               <h6>Add Special Notes / Extras</h6>
//               {notes.map((note, idx) => (
//                 <div key={idx} className="d-flex gap-2 align-items-center mb-2">
//                   <select
//                     className="form-control"
//                     value={note.text}
//                     onChange={(e) =>
//                       handleNoteChange(order.id, idx, "text", e.target.value)
//                     }
//                   >
//                     <option value="">Select Extra</option>
//                     {extrasList.map((extra, i) => (
//                       <option key={i} value={extra.text}>
//                         {extra.text} (₹{extra.price})
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="number"
//                     className="form-control"
//                     placeholder="Qty"
//                     min="1"
//                     style={{ width: "80px" }}
//                     value={note.qty}
//                     onChange={(e) =>
//                       handleNoteChange(order.id, idx, "qty", e.target.value)
//                     }
//                   />
//                   <button
//                     className="btn btn-danger"
//                     onClick={() => handleRemoveNote(order.id, idx)}
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}
//               <button
//                 className="btn btn-outline-primary btn-sm"
//                 onClick={() => handleAddNote(order.id)}
//               >
//                 + Add Extra
//               </button>
//             </div>

//             <div className="mt-3 d-flex gap-2">
//               {order.status === "Pending" && (
//                 <button className="btn btn-primary" onClick={() => handleConfirmOrder(order)}>
//                   Confirm Order
//                 </button>
//               )}
//               <button className="btn btn-warning" onClick={() => handleAddMore(order)}>
//                 Add More
//               </button>
//               {order.status !== "Completed" && (
//                 <button className="btn btn-success" onClick={() => openPaymentModal(order)}>
//                   Complete Order
//                 </button>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       {/* 🆕 Payment Mode Modal */}
//       {showPaymentModal && (
//         <div className="payment-modal-bg">
//           <div className="payment-modal-box">
//             <h5>Select Payment Mode</h5>

//             <select
//               className="form-select mt-2"
//               value={paymentmode}
//               onChange={(e) => setpaymentmode(e.target.value)}
//             >
//               <option value="">Select Payment Mode</option>
//               <option value="Cash">Cash</option>
//               <option value="UPI">UPI</option>
//               <option value="Card">Card</option>
//               <option value="Pending">Pending / Room</option>
//               <option value="Split">Split</option>
//               <option value="Other">Other</option>
//             </select>

//             <div className="d-flex gap-2 mt-3">
//               <button className="btn btn-primary" onClick={handleCompleteOrder}>
//                 Confirm & Complete
//               </button>
//               <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         .payment-modal-bg {
//           position: fixed; inset: 0;
//           background: rgba(0,0,0,0.4);
//           display:flex; align-items:center; justify-content:center;
//           z-index:10000;
//         }
//         .payment-modal-box {
//           background:white; padding:20px; border-radius:8px;
//           width:300px; box-shadow:0 0 10px rgba(0,0,0,0.2);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Cart;



