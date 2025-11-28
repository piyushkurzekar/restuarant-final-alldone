import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import axios from "axios";

const COLORS = ["#0f9d58", "#2b6cb0", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

const OverviewCharts = () => {
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ⬇️ FETCH BOTH APIs
                const [stockRes, ordersRes] = await Promise.all([
                    axios.get("http://localhost:4000/api/restaurant-stocks/all"),
                    axios.get("http://localhost:4000/api/orders/completed")
                ]);

                const stockData = stockRes.data || [];
                const ordersData = ordersRes.data || [];

                /* -------------------------------
                   1️⃣ DONUT CHART → EXPENSE CATEGORY TOTALS
                --------------------------------*/
                const breakdownMap = {};
                stockData.forEach((item) => {
                    const total = Number(item.quantity) * Number(item.price_per_unit);
                    if (item.category) {
                        breakdownMap[item.category] = (breakdownMap[item.category] || 0) + total;
                    }
                });

                const breakdownArray = Object.keys(breakdownMap).map((key, idx) => ({
                    name: key,
                    value: breakdownMap[key],
                    color: COLORS[idx % COLORS.length],
                }));
                setExpenseBreakdown(breakdownArray);

                /* -------------------------------
                   2️⃣ MONTHLY EXPENSE TOTALS
                --------------------------------*/
                const monthlyExpenses = {};

                stockData.forEach((item) => {
                    const dateObj = new Date(item.date);
                    if (!isNaN(dateObj)) {
                        const monthKey = dateObj.toLocaleString("default", { month: "short", year: "numeric" });
                        const total = Number(item.quantity) * Number(item.price_per_unit);

                        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + total;
                    }
                });

                /* -------------------------------
                   3️⃣ MONTHLY REVENUE TOTALS (FROM ORDERS)
                --------------------------------*/
                const monthlyRevenue = {};

                ordersData.forEach((order) => {
                    const dateObj = new Date(order.dateTime);
                    if (!isNaN(dateObj)) {
                        const monthKey = dateObj.toLocaleString("default", { month: "short", year: "numeric" });

                        const orderTotal =
                            order.grand_total !== undefined && order.grand_total !== null
                                ? Number(order.grand_total)
                                : Number(order.total || 0) + Number(order.gst_total || 0);

                        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + orderTotal;
                    }
                });

                /* -------------------------------
                   4️⃣ MERGE MONTHS FOR CHART
                --------------------------------*/
                const allMonths = Array.from(
                    new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyRevenue)])
                ).sort((a, b) => new Date(a) - new Date(b));

                const barData = allMonths.map((month) => ({
                    month,
                    revenue: monthlyRevenue[month] || 0,
                    expenses: monthlyExpenses[month] || 0
                }));

                setRevenueData(barData);

            } catch (err) {
                console.error("Error loading chart data:", err);
            }
        };

        fetchData();
    }, []);

    const getMaxDomain = (data) => {
        if (!data || !data.length) return 1000;
        const maxRevenue = Math.max(...data.map((item) => item.revenue));
        const maxExpenses = Math.max(...data.map((item) => item.expenses));
        return Math.ceil(Math.max(maxRevenue, maxExpenses) / 1000) * 1000;
    };

    const maxDomain = getMaxDomain(revenueData);

    return (
        <div className="row">

            {/* Donut Chart - Expense Breakdown */}
            <div className="col-12 col-md-4 mb-4">
                <div className="card shadow rounded h-100">
                    <div className="card-header">
                        <h5 className="card-title fw-bolder">Expense Breakdown</h5>
                        <small className="text-muted">Current month expense distribution</small>
                    </div>
                    <div className="card-body d-flex flex-column align-items-center">
                        <div className="w-100" style={{ height: "250px", minHeight: "200px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="40%"
                                        outerRadius="70%"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`Rs.${value.toLocaleString()}`, ""]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="row mt-4 w-100">
                            {expenseBreakdown.map((item, index) => (
                                <div key={index} className="col-6 d-flex align-items-center mb-2">
                                    <div
                                        className="rounded-circle me-2"
                                        style={{ width: "12px", height: "12px", backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-muted small">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar Chart - Revenue vs Expenses */}
            <div className="col-12 col-md-8 mb-4">
                <div className="card shadow rounded h-100">
                    <div className="card-header">
                        <h5 className="card-title">Revenue vs Expenses</h5>
                        <small className="text-muted">Monthly comparison over the last 12 months</small>
                    </div>
                    <div className="card-body">
                        <div style={{ width: "100%", height: 411 }}>
                            <ResponsiveContainer>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, maxDomain]} />
                                    <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />

                                    <Bar dataKey="revenue" fill="#0f9d58" name="Revenue" />
                                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OverviewCharts;
