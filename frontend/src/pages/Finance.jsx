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

  // Card States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [netLoss, setNetLoss] = useState(0);

  // Chart States
  const [revenue, setRevenue] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [months, setMonths] = useState([]);

  // Convert time range to dates
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    if (timeRange === "Last Month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (timeRange === "Last 3 Months") {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else if (timeRange === "Last 6 Months") {
      startDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (timeRange === "Last Year") {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    return { startDate, endDate: new Date() };
  };

  const fetchOrdersAndStocks = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      const [ordersRes, stockRes] = await Promise.all([
        axios.get("https://restuarant-final-alldone.onrender.com/api/orders/completed"),
        axios.get("https://restuarant-final-alldone.onrender.com/api/restaurant-stocks/all"),
      ]);

      let ordersData = ordersRes.data || [];
      let stockData = stockRes.data || [];

      // Filter by selected range
      ordersData = ordersData.filter((order) => {
        const d = new Date(order.dateTime);
        return d >= startDate && d <= endDate;
      });

      stockData = stockData.filter((item) => {
        const d = new Date(item.date);
        return d >= startDate && d <= endDate;
      });

      /* TOTALS */
      const sumRevenue = ordersData.reduce(
        (acc, order) => acc + Number(order.grand_total || 0),
        0
      );

      const sumExpenses = stockData.reduce(
        (acc, item) => acc + Number(item.total_price || 0),
        0
      );

      setTotalRevenue(sumRevenue);
      setTotalExpenses(sumExpenses);
      setNetProfit(Math.max(sumRevenue - sumExpenses, 0));
      setNetLoss(Math.max(sumExpenses - sumRevenue, 0));

      /* MONTHLY GROUPING */
      const revenueMonthly = {};
      const expenseMonthly = {};

      ordersData.forEach((order) => {
        const dateObj = new Date(order.dateTime);
        if (!isNaN(dateObj)) {
          const key = dateObj.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          revenueMonthly[key] =
            (revenueMonthly[key] || 0) + Number(order.grand_total || 0);
        }
      });

      stockData.forEach((item) => {
        const dateObj = new Date(item.date);
        if (!isNaN(dateObj)) {
          const key = dateObj.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          expenseMonthly[key] =
            (expenseMonthly[key] || 0) + Number(item.total_price || 0);
        }
      });

      /* MERGE MONTHS */
      const allMonths = Array.from(
        new Set([...Object.keys(revenueMonthly), ...Object.keys(expenseMonthly)])
      ).sort((a, b) => new Date(a) - new Date(b));

      /* FINAL FILTER OF MONTH LABELS */
      const filteredMonths = allMonths.filter((m) => {
        const [monthName, year] = m.split(" ");
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const dateObj = new Date(year, monthIndex, 1);

        return dateObj >= startDate && dateObj <= endDate;
      });

      setMonths(filteredMonths);
      setRevenue(filteredMonths.map((m) => revenueMonthly[m] || 0));
      setExpenses(filteredMonths.map((m) => expenseMonthly[m] || 0));
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchOrdersAndStocks();
  }, [timeRange]); // REFRESH on filter change

  // === Chart Configs ===
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
          <p className="text-muted mb-0">
            Track revenue, expenses, and profitability
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeRange}
            </button>
            <ul className="dropdown-menu">
              {["Last Month", "Last 3 Months", "Last 6 Months", "Last Year"].map(
                (range) => (
                  <li key={range}>
                    <button
                      className="dropdown-item"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
          <button className="btn btn-outline-secondary">Export</button>
        </div>
      </div>

      {/* === Summary Cards === */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Revenue</h6>
            <h4 className="fw-bold text-dark">₹{totalRevenue.toLocaleString()}</h4>
            <small className="text-success">▲ Based on orders</small>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Expenses</h6>
            <h4 className="fw-bold text-dark">₹{totalExpenses.toLocaleString()}</h4>
            <small className="text-danger">▼ Based on stock</small>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Profit</h6>
            <h4 className="fw-bold text-success">₹{netProfit.toLocaleString()}</h4>
            <small className="text-success">▲ Auto calculated</small>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Loss</h6>
            <h4 className="fw-bold text-danger">₹{netLoss.toLocaleString()}</h4>
            <small className="text-danger">▼ Auto calculated</small>
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





 