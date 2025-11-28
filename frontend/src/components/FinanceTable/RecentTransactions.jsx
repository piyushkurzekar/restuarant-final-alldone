import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const RecentTransactions = ({ filteredData }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch Orders + Stock
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, stockRes] = await Promise.all([
          axios.get("http://localhost:4000/api/orders/completed"),
          axios.get("http://localhost:4000/api/restaurant-stocks/all"),
        ]);

        // 🟢 FIXED — ORDERS mapping (paymentMode auto-detect)
        const ordersData = ordersRes.data.map((order) => {
          const total = Number(order.total || 0);
          const gstTotal = Number(order.gst_total || 0);
          const grandTotal = total + gstTotal;

          return {
            source: "Orders",
            description: `Guest: ${order.guestName || "-"} | Table: ${
              order.tableNumber || "-"
            } | Contact: ${order.contactNumber || "-"}`,
            date: order.dateTime || "-",
            total: total,
            gst_percent: order.gst_percent || 0,
            gst_type: order.gst_type || "-",
            cgst: order.cgst || 0,
            sgst: order.sgst || 0,
            igst: order.igst || 0,
            gst_total: gstTotal,
            grand_total: grandTotal,
            status: order.status || "completed",
            receivedBy: order.received_by || "-",

            // 🔥 FIXED — paymentMode detection (no matter backend field)
            paymentMode:
              order.payment_mode ||
              order.paymentMode ||
              order.paymentmode ||
              order.pay_mode ||
              order.paymentType ||
              order.mode_of_payment ||
              "-",

            paymentCategory: "Profit",
            type: "profit",
          };
        });

        // 🔴 STOCK (Expense)
        const stockData = stockRes.data.map((item) => ({
          source: "Stock",
          description: `${item.item_name || "N/A"} | Qty: ${
            item.quantity || 0
          } | ₹${item.price_per_unit || 0}/unit`,
          date: item.date || "-",
          total: Number(item.total_price || 0),
          gst_percent: "-",
          gst_type: "-",
          cgst: "-",
          sgst: "-",
          igst: "-",
          gst_total: "-",
          grand_total: Number(item.total_price || 0),
          status: "-",
          receivedBy: item.received_by || "-",
          paymentMode: item.payment_mode || "-",
          paymentCategory: "Expense",
          type: "loss",
        }));

        const mergedData = [...ordersData, ...stockData].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setTransactions(mergedData);
        setFilteredTransactions(mergedData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const getAmountStyle = (type) =>
    type === "profit" ? "text-success fw-bold" : "text-danger fw-bold";

  const getStatusBadge = (status) => {
    if (status === "-")
      return <span className="badge bg-light text-dark">-</span>;
    switch (status) {
      case "completed":
        return (
          <span className="badge bg-success-subtle text-success">{status}</span>
        );
      case "pending":
        return <span className="badge bg-secondary">{status}</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  // Filters
  const applyFilters = (from, to, category) => {
    let filtered = [...transactions];

    if (from) filtered = filtered.filter((t) => new Date(t.date) >= new Date(from));
    if (to) filtered = filtered.filter((t) => new Date(t.date) <= new Date(to));

    if (category !== "All") {
      filtered = filtered.filter((t) => t.paymentCategory === category);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    applyFilters(value, toDate, paymentCategoryFilter);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    applyFilters(fromDate, value, paymentCategoryFilter);
  };

  const handlePaymentCategoryFilterChange = (value) => {
    setPaymentCategoryFilter(value);
    applyFilters(fromDate, toDate, value);
  };

  // Summary
  const { totalAmount, totalProfit, totalExpense } = useMemo(() => {
    let total = 0;
    let profit = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.grand_total || 0);
      total += t.type === "loss" ? -amt : amt;
      if (t.type === "profit") profit += amt;
      else expense += amt;
    });

    return { totalAmount: total, totalProfit: profit, totalExpense: expense };
  }, [filteredTransactions]);

  const { cashTotal, onlineTotal } = useMemo(() => {
    let cash = 0;
    let online = 0;

    filteredTransactions.forEach((t) => {
      const mode = (t.paymentMode || "").toLowerCase();
      const amt = Number(t.grand_total || 0);

      if (mode === "cash") cash += amt;
      if (mode === "upi" || mode === "bank transfer") online += amt;
    });

    return { cashTotal: cash, onlineTotal: online };
  }, [filteredTransactions]);

  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">Total Transactions</h5>
          <small className="text-muted">
            Orders (Profit) & Stock (Expense)
          </small>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mt-2 mt-md-0 w-100 justify-content-between">
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "#1F4529", color: "white" }}
          >
            + Transaction
          </button>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <label className="me-2 fw-semibold">From:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="me-2 fw-semibold">To:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="me-2 fw-semibold">Category:</label>
              <select
                className="form-select form-select-sm"
                value={paymentCategoryFilter}
                onChange={(e) =>
                  handlePaymentCategoryFilterChange(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Profit">Profit</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Source</th>
                <th>Description</th>
                <th>Date</th>
                <th>Total</th>
                <th>GST %</th>
                <th>GST Type</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>IGST</th>
                <th>GST Total</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Received By</th>
                <th>Payment Mode</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((row, index) => (
                <tr key={index}>
                  <td>{row.source}</td>
                  <td>{row.description}</td>
                  <td>
                    {row.date !== "-"
                      ? new Date(row.date).toLocaleString()
                      : "-"}
                  </td>
                  <td className={getAmountStyle(row.type)}>₹{row.total}</td>
                  <td>{row.gst_percent}</td>
                  <td>{row.gst_type}</td>
                  <td>{row.cgst}</td>
                  <td>{row.sgst}</td>
                  <td>{row.igst}</td>
                  <td>{row.gst_total}</td>
                  <td className={getAmountStyle(row.type)}>₹{row.grand_total}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>{row.receivedBy}</td>
                  <td>{row.paymentMode}</td>
                  <td>{row.paymentCategory}</td>
                </tr>
              ))}
              {currentTransactions.length === 0 && (
                <tr>
                  <td colSpan="15" className="text-center text-muted py-3">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center py-3 bg-light border-top">
        <button
          className="btn btn-sm btn-outline-secondary me-2"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ◀ Prev
        </button>
        <span className="fw-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary ms-2"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </button>
      </div>

      {/* Summary */}
      <div className="card-footer bg-light">
        <div className="d-flex flex-wrap justify-content-around text-center fw-bold">
          <div>Total: ₹{totalAmount.toLocaleString()}</div>

          <div className="text-success">
            Profit: ₹{totalProfit.toLocaleString()}
          </div>

          <div className="text-danger">
            Expense: ₹{totalExpense.toLocaleString()}</div>

          <div className="text-primary">
            Cash: ₹{cashTotal.toLocaleString()}</div>

          <div className="text-info">
            Online (UPI + Bank Transfer): ₹{onlineTotal.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
