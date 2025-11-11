import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import MenuItems from "../components/MenuItems/MenuItems";
import { useOrders } from "../context/OrdersContext";

// Images
import PohaImg from "../assets/images/Poha.jpeg";
import BhakkerImg from "../assets/images/Bhakker.jpeg";
import ChilliPaneer from "../assets/images/Chilli-Paneer.jpeg";
import Coffee from "../assets/images/Coffee.jpeg";
import MixVeg from "../assets/images/Mix-Veg.jpeg";
import MuttonCurry from "../assets/images/Mutton-Curry.jpeg";
import PalakPaneer from "../assets/images/Palak-paneer.jpeg";
import ChickenCurry from "../assets/images/Chikken-Curry.jpeg";
import CrispyVeg from "../assets/images/Crispy-Veg.jpeg";
import Idli from "../assets/images/Idli.jpeg";
import Jhunka from "../assets/images/Jhunka.jpeg";
import PaneerButterMasala from "../assets/images/Paneer-Butter-Masala.jpeg";
import ButterRoti from "../assets/images/Roti.jpeg";
import Tea from "../assets/images/Tea.jpeg";

const TakeOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, setCart } = useOrders();

  const [orderData, setOrderData] = useState({
    guestName: "",
    tableNumber: "",
    contact: "",
    receiveby: "",
    items: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dummy waiter list (you can later fetch from Supabase)
  const waiters = [ "Ramesh", "Suresh", "Amit", "Neha", "Priya"];

  // Timer for date & time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    "All",
    "Hot & Tea",
    "Chinese",
    "Main course VEG",
    "Main course NON VEG",
    "Snacks",
    "Paneer",
    "Roti",
  ];

  const menuItems = [
    { id: 1, name: "Tea", price: 15, img: Tea, category: "Hot & Tea" },
    { id: 2, name: "Chilli Paneer", price: 220, img: ChilliPaneer, category: "Chinese" },
    { id: 3, name: "Paneer Butter Masala", price: 250, img: PaneerButterMasala, category: "Paneer" },
    { id: 4, name: "Mix Veg", price: 150, img: MixVeg, category: "Main course VEG" },
    { id: 5, name: "Chicken Curry", price: 260, img: ChickenCurry, category: "Main course NON VEG" },
    { id: 6, name: "Poha", price: 40, img: PohaImg, category: "Snacks" },
    { id: 7, name: "Butter Roti", price: 25, img: ButterRoti, category: "Roti" },
    { id: 8, name: "Coffee", price: 25, img: Coffee, category: "Hot & Tea" },
    { id: 9, name: "Crispy Veg", price: 200, img: CrispyVeg, category: "Chinese" },
    { id: 10, name: "Palak Paneer", price: 230, img: PalakPaneer, category: "Paneer" },
    { id: 11, name: "Jhunka", price: 150, img: Jhunka, category: "Main course VEG" },
    { id: 12, name: "Mutton Curry", price: 300, img: MuttonCurry, category: "Main course NON VEG" },
    { id: 13, name: "Idli", price: 60, img: Idli, category: "Snacks" },
    { id: 14, name: "Bhakker", price: 40, img: BhakkerImg, category: "Roti" },
  ];

  // Prefill guest/table if coming from Add More
  useEffect(() => {
    if (location.state?.addMoreFor) {
      setOrderData({
        guestName: location.state.addMoreFor.guestName,
        tableNumber: location.state.addMoreFor.tableNumber,
        contact: location.state.addMoreFor.contact,
        receiveby: location.state.addMoreFor.receiveby || "",
        items: [],
      });
    }
  }, [location.state]);

  // Send order to backend
  const sendOrderToBackend = async (tableOrder) => {
    try {
      const response = await fetch("http://localhost:4000/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: tableOrder.guestName,
          tableNumber: tableOrder.tableNumber,
          contact: tableOrder.contact,
          receiveby: tableOrder.receiveby, // ✅ added
          dateTime: new Date(),
          items: tableOrder.items,
          total: tableOrder.items.reduce(
            (sum, item) => sum + (item.total || item.price * (item.quantity || 1)),
            0
          ),
          paymentmode: null
        }),
      });

      const data = await response.json();
      if (!response.ok) console.error("Backend Error:", data.error);
    } catch (err) {
      console.error("Network Error:", err);
    }
  };

  const handleAddToCart = (selectedItems) => {
    if (!orderData.guestName || !orderData.tableNumber) {
      alert("Please enter guest name and table number first.");
      return;
    }

    if (!orderData.receiveby || orderData.receiveby === "Select Waiter") {
      alert("Please select the waiter (Received By)!");
      return;
    }

    if (!/^\d{10}$/.test(orderData.contact)) {
      alert("Please enter a valid 10-digit contact number!");
      return;
    }

    const tableKey = `Table-${orderData.tableNumber}`;

    setCart((prevCart) => {
      const oldItems = prevCart[tableKey]?.items || [];
      const mergedItems = [...oldItems];

      selectedItems.forEach((newItem) => {
        const existingIndex = mergedItems.findIndex((i) => i.name === newItem.name);
        if (existingIndex !== -1) {
          mergedItems[existingIndex].quantity =
            (mergedItems[existingIndex].quantity || 1) + (newItem.quantity || 1);
          mergedItems[existingIndex].total =
            (mergedItems[existingIndex].price || 0) *
            mergedItems[existingIndex].quantity;
        } else {
          mergedItems.push({
            ...newItem,
            quantity: newItem.quantity || 1,
            total: newItem.total || newItem.price,
          });
        }
      });

      const updatedTable = {
        guestName: orderData.guestName,
        tableNumber: orderData.tableNumber,
        contact: orderData.contact,
        receiveby: orderData.receiveby, // ✅ include waiter name
        items: mergedItems,
      };

      sendOrderToBackend(updatedTable);

      return {
        ...prevCart,
        [tableKey]: updatedTable,
      };
    });

    if (!location.state?.addMoreFor) {
      setOrderData({
        guestName: "",
        tableNumber: "",
        contact: "",
        receiveby: "",
        items: [],
      });
    }
  };

  // Calculate total amount
  const totalAmount = Object.values(cart).reduce((sum, table) => {
    return sum + table.items.reduce((s, item) => s + (item.total || item.price * (item.quantity || 1)), 0);
  }, 0);

  return (
    <div className="container my-2" style={{ maxWidth: "1000px" }}>
      <div className="card shadow p-4 mb-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Take Orders</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/cart", { state: { cart, totalAmount } })}
          >
            View Cart ({totalAmount} ₹)
          </button>
        </div>

        {/* Guest & Table */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <input
              type="text"
              className="form-control"
              style={{ width: "200px" }}
              placeholder="Guest Name"
              value={orderData.guestName}
              onChange={(e) => setOrderData({ ...orderData, guestName: e.target.value })}
            />
          </div>

          <div className="col">
            <input
              type="text"
              className="form-control"
              style={{ width: "120px" }}
              placeholder="Table No."
              value={orderData.tableNumber}
              onChange={(e) => setOrderData({ ...orderData, tableNumber: e.target.value })}
            />
          </div>

          <div className="col">
            <input
              type="tel"
              className="form-control"
              style={{ width: "150px" }}
              placeholder="Contact"
              value={orderData.contact}
              maxLength="10"
              inputMode="numeric"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              onChange={(e) => setOrderData({ ...orderData, contact: e.target.value })}
            />
          </div>

          {/* ✅ Received By Dropdown */}
          <div className="col">
            <select
              className="form-select"
              style={{ width: "180px" }}
              value={orderData.receiveby}
              onChange={(e) => setOrderData({ ...orderData, receiveby: e.target.value })}
            >
              <option value="">Select Waiter</option>
              {waiters.map((w, i) => (
                <option key={i} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="col" style={{ marginTop: "8px" }}>
            <p style={{ fontSize: "14px", marginBottom: 0 }}>
              <strong>Date & Time:</strong> {currentTime.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn me-2 mb-2 ${selectedCategory === cat ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <MenuItems
          menuItems={menuItems}
          selectedCategory={selectedCategory}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};

export default TakeOrders;
