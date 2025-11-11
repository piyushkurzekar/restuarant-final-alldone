import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("All");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/transactions")
            .then((res) => {
                if (res.data) {
                    setTransactions(res.data);
                    setFilteredTransactions(res.data);
                }
            })
            .catch(() => {
                // fallback dummy data
                const dummyData = [
                    {
                        description: "Villa A - 7 nights booking",
                        date: "2024-01-15",
                        amount: 4200,
                        type: "profit",
                        status: "completed",
                        receivedBy: "Ahefaz Sheikh",
                        paymentMode: "Cash",
                        paymentCategory: "Total",
                    },
                    {
                        description: "Pool maintenance service",
                        date: "2024-01-14",
                        amount: 850,
                        type: "loss",
                        status: "completed",
                        receivedBy: "Archit Patle",
                        paymentMode: "Cash",
                        paymentCategory: "Advanced",
                    },
                    {
                        description: "Villa B - 5 nights booking",
                        date: "2024-01-13",
                        amount: 3100,
                        type: "profit",
                        status: "completed",
                        receivedBy: "Palash Poharkar",
                        paymentMode: "Online",
                        paymentCategory: "Total",
                    },
                    {
                        description: "Housekeeping supplies",
                        date: "2024-01-12",
                        amount: 320,
                        type: "loss",
                        status: "completed",
                        receivedBy: "Sanika",
                        paymentMode: "Online",
                        paymentCategory: "Advanced",
                    },
                    {
                        description: "Villa C - 3 nights booking",
                        date: "2024-01-11",
                        amount: 1800,
                        type: "profit",
                        status: "pending",
                        receivedBy: "Piyush Kuzekar",
                        paymentMode: "Cash",
                        paymentCategory: "Total",
                    },
                ];
                setTransactions(dummyData);
                setFilteredTransactions(dummyData);
            });
    }, []);

    const getAmountStyle = (type) =>
        type === "profit" ? "text-success fw-bold" : "text-danger fw-bold";

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <span className="badge bg-success-subtle text-success">{status}</span>
                );
            case "pending":
                return <span className="badge bg-secondary">{status}</span>;
            case "failed":
                return <span className="badge bg-danger">{status}</span>;
            default:
                return <span className="badge bg-light text-dark">{status}</span>;
        }
    };

    const handlePaymentModeChange = (index, value) => {
        const updated = [...filteredTransactions];
        updated[index].paymentMode = value;
        setFilteredTransactions(updated);
    };

    const handlePaymentCategoryChange = (index, value) => {
        const updated = [...filteredTransactions];
        updated[index].paymentCategory = value;
        setFilteredTransactions(updated);
    };

    // 📌 Apply both date and category filters
    const applyFilters = (from, to, category) => {
        let filtered = [...transactions];

        if (from) {
            const fromD = new Date(from);
            filtered = filtered.filter((t) => new Date(t.date) >= fromD);
        }

        if (to) {
            const toD = new Date(to);
            filtered = filtered.filter((t) => new Date(t.date) <= toD);
        }

        if (category !== "All") {
            filtered = filtered.filter((t) => t.paymentCategory === category);
        }

        setFilteredTransactions(filtered);
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

    // 🔥 Added: Summary calculations using useMemo
    const { totalAmount, cashTotal, onlineTotal } = useMemo(() => {
        let total = 0;
        let cash = 0;
        let online = 0;

        filteredTransactions.forEach((t) => {
            // profit adds, loss subtracts
            const amt = t.type === "profit" ? t.amount : -t.amount;
            total += amt;

            if (t.paymentMode === "Cash") {
                cash += amt;
            } else if (t.paymentMode === "Online") {
                online += amt;
            }
        });

        return { totalAmount: total, cashTotal: cash, onlineTotal: online };
    }, [filteredTransactions]);

    return (
        <div className="card mt-4 shadow-sm">
            <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center">
                <div>
                    <h5 className="fw-bold mb-0">Total Transactions</h5>
                    <small className="text-muted">Latest financial activities</small>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-3 mt-2 mt-md-0 w-100 justify-content-between">
                    {/* ➕ Transaction Button */}
                    <button className="btn btn-sm" style={{ backgroundColor: "#1F4529", color: "white" }}>
                        + Transaction
                    </button>

                    {/* 📌 Filters */}
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        {/* From Date */}
                        <div>
                            <label className="me-2 fw-semibold">From:</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={fromDate}
                                onChange={(e) => handleFromDateChange(e.target.value)}
                            />
                        </div>
                        {/* To Date */}
                        <div>
                            <label className="me-2 fw-semibold">To:</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={toDate}
                                onChange={(e) => handleToDateChange(e.target.value)}
                            />
                        </div>
                        {/* Payment Category */}
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
                                <option value="Advanced">Advanced</option>
                                <option value="Total">Total</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                {/* Desktop / Tablet View */}
                <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Received By</th>
                                <th>Payment Mode</th>
                                <th>Payment Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.description}</td>
                                    <td>{new Date(row.date).toLocaleDateString()}</td>
                                    <td className={getAmountStyle(row.type)}>
                                        {row.type === "profit"
                                            ? `+Rs. ${row.amount.toLocaleString()}`
                                            : `-Rs. ${row.amount.toLocaleString()}`}
                                    </td>
                                    <td>{getStatusBadge(row.status)}</td>
                                    <td>{row.receivedBy}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={row.paymentMode}
                                            onChange={(e) =>
                                                handlePaymentModeChange(index, e.target.value)
                                            }
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={row.paymentCategory}
                                            onChange={(e) =>
                                                handlePaymentCategoryChange(index, e.target.value)
                                            }
                                        >
                                            <option value="Advanced">Advanced</option>
                                            <option value="Total">Total</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-3">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="d-block d-md-none p-2">
                    {filteredTransactions.map((row, index) => (
                        <div key={index} className="border rounded p-3 mb-2 bg-light">
                            <p className="mb-1 fw-bold">{row.description}</p>
                            <small className="text-muted">
                                {new Date(row.date).toLocaleDateString()}
                            </small>
                            <p className={`mt-2 ${getAmountStyle(row.type)}`}>
                                {row.type === "profit"
                                    ? `+Rs. ${row.amount.toLocaleString()}`
                                    : `-Rs. ${row.amount.toLocaleString()}`}
                            </p>
                            <div className="mb-1">{getStatusBadge(row.status)}</div>
                            <p className="mb-1">
                                <strong>Received By:</strong> {row.receivedBy}
                            </p>
                            <div className="mb-1">
                                <strong>Payment Mode:</strong>
                                <select
                                    className="form-select form-select-sm mt-1"
                                    value={row.paymentMode}
                                    onChange={(e) =>
                                        handlePaymentModeChange(index, e.target.value)
                                    }
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            <div>
                                <strong>Payment Category:</strong>
                                <select
                                    className="form-select form-select-sm mt-1"
                                    value={row.paymentCategory}
                                    onChange={(e) =>
                                        handlePaymentCategoryChange(index, e.target.value)
                                    }
                                >
                                    <option value="Advanced">Advanced</option>
                                    <option value="Total">Total</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <div className="text-center text-muted py-3">
                            No transactions found
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 Added: Summary Section */}
            <div className="card-footer bg-light">
                <div className="d-flex flex-wrap justify-content-around text-center fw-bold">
                    <div>Total: Rs. {totalAmount.toLocaleString()}</div>
                    <div>Cash: Rs. {cashTotal.toLocaleString()}</div>
                    <div>Online: Rs. {onlineTotal.toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

export default RecentTransactions;
