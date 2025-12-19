import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import MenuItems from "../components/MenuItems/MenuItems";
import { useOrders } from "../context/OrdersContext";
import { supabase } from "../config/supabaseClient.js";

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

  const [menuItems, setMenuItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());

  const waiters = ["Ramesh", "Suresh", "Amit", "Neha", "Priya"];
  const categories = ["All", "Hot & Tea", "Chinese", "Main course Veg", "Main course Non Veg", "Snacks", "Paneer", "Roti"];

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

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch menu items from Supabase
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase.from("menu_items").select("*");
        if (error) {
          console.error("Failed to fetch menu:", error.message);
        } else {
          setMenuItems(data);
        }
      } catch (err) {
        console.error("Network error while fetching menu:", err);
      }
    };
    fetchMenu();
  }, []);

  // Add new menu item to Supabase & UI
  const handleAddNewItem = async (newItem) => {
    try {
      const { data, error } = await supabase.from("menu_items").insert([newItem]).select();
      if (error) {
        console.error("Failed to add item:", error.message);
        alert("Failed to add item! Check console for error.");
      } else {
        setMenuItems(prev => [...prev, data[0]]);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to add item due to network issue!");
    }
  };

  // Edit existing menu item
  const handleSaveEdit = async (editedItem) => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .update({
          name: editedItem.name,
          price: editedItem.price,
          img: editedItem.img,
          category: editedItem.category,
        })
        .eq("id", editedItem.id)
        .select(); // returns updated row

      if (error) {
        console.error("Failed to update item:", error.message);
        alert("Failed to update item!");
      } else if (data && data.length > 0) {
        // Update menuItems in UI
        setMenuItems(prev =>
          prev.map(item => (item.id === editedItem.id ? data[0] : item))
        );
        setEditItem(null);
      } else {
        alert("No data returned from update. Item not saved.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to update item due to network issue!");
    }
  };



  // Delete menu item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete item:", error.message);
        alert("Failed to delete item!");
      } else {
        setMenuItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to delete item due to network issue!");
    }
  };


  // Send order to backend
  const sendOrderToBackend = async (tableOrder) => {
    try {
      const response = await fetch("https://restuarant-final-alldone.onrender.com/api/orders/place", {
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

  const handleAddToCart = (items) => {
    if (!orderData.guestName || !orderData.tableNumber) {
      alert("Please enter guest name and table number first.");
      return;
    }

    if (!orderData.receiveby) {
      alert("Please select the waiter (Received By)!");
      return;
    }

    if (!/^\d{10}$/.test(orderData.contact)) {
      alert("Please enter a valid 10-digit contact number!");
      return;
    }

    // ✅ FIX 1: Always convert to array
    const selectedItems = Array.isArray(items) ? items : [items];
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
        receiveby: orderData.receiveby,
        items: mergedItems,
      };

      // ✅ BACKEND CALL (IMPORTANT)
      sendOrderToBackend({
        ...updatedTable,
        items: mergedItems.map(item => ({
          menuId: item.id || null,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          total: Number(item.price) * item.quantity,
        })),
      });

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
      });
    }
  };


  // Calculate total amount
  const totalAmount = Object.values(cart).reduce((sum, table) => {
    return sum + table.items.reduce((s, item) => s + (item.total || item.price * (item.quantity || 1)), 0);
  }, 0);



  return (
    <div className="container mt-8" style={{ maxWidth: "1000px" }}>
      <div className="card shadow p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Take Orders</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/cart", { state: { cart, totalAmount } })}
          >
            View Cart ({totalAmount} ₹)
          </button>
        </div>

        {/* Guest & Table Inputs */}
        <div className="row mb-3 align-items-center">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Guest Name"
              value={orderData.guestName}
              onChange={(e) => setOrderData({ ...orderData, guestName: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Table No."
              value={orderData.tableNumber}
              onChange={(e) => setOrderData({ ...orderData, tableNumber: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="tel"
              className="form-control"
              placeholder="Contact"
              value={orderData.contact}
              maxLength="10"
              onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }}
              onChange={(e) => setOrderData({ ...orderData, contact: e.target.value })}
            />
          </div>
          <div className="col">
            <select
              className="form-select"
              value={orderData.receiveby}
              onChange={(e) => setOrderData({ ...orderData, receiveby: e.target.value })}
            >
              <option value="">Select Waiter</option>
              {waiters.map((w, i) => <option key={i} value={w}>{w}</option>)}
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
          {categories.map(cat => (
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
          onEdit={handleSaveEdit}      // ✅ use handleSaveEdit here
          onDelete={handleDelete}
          onSaveEdit={handleSaveEdit}  // optional, you can keep or remove
          onAddNewItem={handleAddNewItem}
        />

      </div>
    </div>
  );
};

export default TakeOrders;
