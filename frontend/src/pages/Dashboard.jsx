import React, { useEffect, useState } from "react";
import CardBasic from "../components/CardBasic/CardBasic";
import Card from "../components/Card/Card";
import { MdCurrencyRupee } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { LuBox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { getStaff } from "../service/staffApi";

const API_STOCKS =
  "https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/restaurant-stocks";
const API_ORDERS =
  "https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/orders/kitchen";

const Dashboard = () => {
  const [totalStaff, setTotalStaff] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  // ✅ Fetch Staff Count
  const fetchStaffCount = async () => {
    try {
      const data = await getStaff();
      setTotalStaff(data.length);
    } catch (err) {
      toast.error(`Failed to load staff: ${err.message}`);
    }
  };

  // ✅ Fetch Low Stock Data
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

  // ✅ Fetch Completed Orders Count
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

          {/* ✅ Dynamic Total Orders (Completed Orders) */}
          <Card
            cardTitle={"Total Orders"}
            cardIcon={<IoFastFoodOutline fontSize={20} color="#000000" />}
            cardSubtitle={completedOrders}
          />

          <Card
            cardTitle={"Monthly Revenue"}
            cardIcon={<MdCurrencyRupee fontSize={20} color="#000000" />}
            cardSubtitle={"Rs. 45,231"}
          />

          {/* ✅ Dynamic Total Staff */}
          <Card
            cardTitle={"Total Staff"}
            cardIcon={<GoPeople fontSize={20} color="#000000" />}
            cardSubtitle={totalStaff}
          />

          {/* ✅ Dynamic Low Stock Alerts with Color Change */}
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
