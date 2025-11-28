import React, { useEffect, useState } from "react";
import CardBasic from "../components/CardBasic/CardBasic";
import Card from "../components/Card/Card";
import { MdCurrencyRupee } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { LuBox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { getStaff } from "../service/staffApi";
import { useNavigate } from "react-router-dom";   // ✅ added

const API_STOCKS = "http://localhost:4000/api/restaurant-stocks";
const API_ORDERS = "http://localhost:4000/api/orders/kitchen";

const Dashboard = () => {
  const navigate = useNavigate(); // ✅ initialize navigation

  const [totalStaff, setTotalStaff] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  // Fetch Staff Count
  const fetchStaffCount = async () => {
    try {
      const data = await getStaff();
      setTotalStaff(data.length);
    } catch (err) {
      toast.error(`Failed to load staff: ${err.message}`);
    }
  };

  // Fetch Stock Data
  const fetchStockData = async () => {
    try {
      const res = await fetch(`${API_STOCKS}/all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch stocks");

      const lowStocks = data.filter((item) => item.remaining_stock < 10).length;
      setLowStockCount(lowStocks);
    } catch (err) {
      toast.error(`Failed to load stock data: ${err.message}`);
    }
  };

  // Fetch Completed Orders Count
  const fetchCompletedOrders = async () => {
    try {
      const res = await fetch(API_ORDERS);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");

      const completed = data.filter(
        (order) => order.status?.toLowerCase() === "completed"
      ).length;

      setCompletedOrders(completed);
    } catch (err) {
      toast.error(`Failed to load orders: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchStaffCount();
    fetchStockData();
    fetchCompletedOrders();
  }, []);

  return (
    <div className="overviewContainer container">

      {/* ✅ LOGOUT BUTTON (Top Right) */}
      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-danger px-4 py-2"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="py-4">
        <h2 className="fs-4 fw-500">Quick Actions</h2>

        <div className="row g-3 justify-content-center pb-4">
          <CardBasic
            cardTitle={"New Order"}
            cardText={"Make a new order"}
            cardColor={"#B7E4C7"}
            navigateTo="/takeorders"
          />
          <CardBasic
            cardTitle={"Menu"}
            cardText={"View full menu"}
            cardColor={"#A3CCDA"}
            navigateTo="/takeorders"
          />
          <CardBasic
            cardTitle={"Stock update"}
            cardText={"Update inventory levels"}
            cardColor={"#FFF3B0"}
            navigateTo="/stocks"
          />
        </div>

        <div className="row g-3 justify-content-center pb-4">
          <h2 className="fs-4 fw-500">Overview</h2>

          {/* Total Orders */}
          <Card
            cardTitle={"Total Orders"}
            cardIcon={<IoFastFoodOutline fontSize={20} color="#000000" />}
            cardSubtitle={completedOrders}
          />

          {/* Monthly Revenue */}
          <Card
            cardTitle={"Monthly Revenue"}
            cardIcon={<MdCurrencyRupee fontSize={20} color="#000000" />}
            cardSubtitle={"Rs. 45,231"}
          />

          {/* Total Staff */}
          <Card
            cardTitle={"Total Staff"}
            cardIcon={<GoPeople fontSize={20} color="#000000" />}
            cardSubtitle={totalStaff}
          />

          {/* Low Stock Alerts */}
          <Card
            cardTitle={"Low Stock Alerts"}
            cardIcon={<LuBox fontSize={20} color="#000000" />}
            cardSubtitle={
              <span
                style={{
                  color: lowStockCount > 0 ? "red" : "black",
                  fontWeight: 500,
                }}
              >
                {lowStockCount}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
