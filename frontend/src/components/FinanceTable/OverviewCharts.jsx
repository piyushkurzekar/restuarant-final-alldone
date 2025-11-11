////OverviewCharts.jsx
import React from "react";
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

const expenseBreakdown = [
    { name: "Staff Salaries", value: 18000, color: "#0f9d58" },
    { name: "Maintenance", value: 8000, color: "#2b6cb0" },
    { name: "Utilities", value: 5000, color: "#f59e0b" },
    { name: "Supplies", value: 4000, color: "#ef4444" },
    { name: "Marketing", value: 3000, color: "#8b5cf6" },
    { name: "Other", value: 3000, color: "#6b7280" },
];

const revenueData = [
    { month: "Jan", revenue: 4000, expenses: 2400 },
    { month: "Feb", revenue: 3000, expenses: 1398 },
    { month: "Mar", revenue: 4600, expenses: 2000 },
    { month: "Apr", revenue: 3980, expenses: 2708 },
    { month: "May", revenue: 4890, expenses: 1800 },
    { month: "July", revenue: 7890, expenses: 2900 },
    { month: "Aug", revenue: 6000, expenses: 2000 },
    { month: "Sep", revenue: 3890, expenses: 3000 },
    { month: "Oct", revenue: 8500, expenses: 1340 },
    { month: "Nov", revenue: 5890, expenses: 2900 },
    { month: "Dec", revenue: 6543, expenses: 5370 },
];

const getMaxDomain = (data) => {
    let maxRevenue = Math.max(...data.map((item) => item.revenue));
    let maxExpenses = Math.max(...data.map((item) => item.expenses));
    return Math.ceil(Math.max(maxRevenue, maxExpenses) / 1000) * 1000;
};

const OverviewCharts = () => {
    const maxDomain = getMaxDomain(revenueData);

    return (
        <div className="row">
            {/* Expense Breakdown */}
            <div className="col-12 col-md-4 mb-4">
                <div className="card shadow rounded h-100">
                    <div className="card-header">
                        <h5 className="card-title fw-bolder">Expense Breakdown</h5>
                        <small className="text-muted">Current month expense distribution</small>
                    </div>
                    <div className="card-body d-flex flex-column align-items-center">
                        {/* ✅ Responsive wrapper */}
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
                                    <Tooltip
                                        formatter={(value) => [`Rs.${value.toLocaleString()}`, ""]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ✅ Legends stay below chart, wrap on small screens */}
                        <div className="row mt-4 w-100">
                            {expenseBreakdown.map((item, index) => (
                                <div key={index} className="col-6 d-flex align-items-center mb-2">
                                    <div
                                        className="rounded-circle me-2"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: item.color,
                                        }}
                                    ></div>
                                    <span className="text-muted small">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Revenue vs Expenses */}
            <div className="col-12 col-md-8 mb-4">
                <div className="card shadow rounded h-100">
                    <div className="card-header">
                        <h5 className="card-title">Revenue vs Expenses</h5>
                        <small className="text-muted">
                            Monthly comparison over the last 12 months
                        </small>
                    </div>
                    <div className="card-body">
                        <div style={{ width: "100%", height: 411 }}>
                            <ResponsiveContainer>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, maxDomain]} />
                                    <Tooltip
                                        formatter={(value) => `Rs.${value.toLocaleString()}`}
                                    />
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
