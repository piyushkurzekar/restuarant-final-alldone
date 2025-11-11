
import React, { useState, useEffect } from "react";
import Card from "../components/Card/Card";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import InventoryTable from "../components/InventoryTable/InventoryTable";



const API_URL = "https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/restaurant-stocks";

const Stocks = () => {

  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);


  const [showModal, setShowModal] = useState(false);
  
 const today = new Date().toISOString().split("T")[0]; 

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    unit: "",
    quantity: "",
    price_per_unit: "",
    used_today: 0,
    received_by: "",
    supplier_name: "",
    payment_mode: "",
    date:  today, // ✅ default to today
  });

 
  // 🔹 Fetch all restaurant stocks
  const fetchStocks = async () => {
    try {
      const res = await fetch(`${API_URL}/all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setItems(data);

      // 👇 Filter only low-stock items (remaining_stock < 10)
      const lowStocks = data.filter((item) => item.remaining_stock < 10);
      setLowStockItems(lowStocks);


    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Calculate total price
    const total_price = Number(formData.quantity) * Number(formData.price_per_unit);

    // Call Add/Update API
    const res = await fetch(`${API_URL}/add-or-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        total_price,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add/update stock");

    alert(data.message); // shows ✅ Existing stock updated or 🆕 New stock added
    fetchStocks(); // refresh table

    // Reset form
    setFormData({
      item_name: "",
      category: "",
      unit: "",
      quantity: "",
      price_per_unit: "",
      used_today: 0,
      received_by: "",
      supplier_name: "",
      payment_mode: "",
      date: today,
    });
    setShowModal(false);
  } catch (err) {
    console.error("Error adding/updating stock:", err);
    alert("❌ " + err.message);
  }
};



  const [activeCategory, setActiveCategory] = useState("All items");
  const categories = [
    {
      id: "All items", label: "All Items", content: (
        <InventoryTable items={items} fetchStocks={fetchStocks} />
      )
    },
    {
      id: "veg", label: "Veg", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "veg"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "non-Veg", label: "Non-Veg", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "non-veg"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "beverages", label: "Beverages", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "beverages"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "groceries", label: "Groceries", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "groceries"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "bakery", label: "Bakery", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "bakery"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "spices", label: "Spices", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "spices"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "dairy", label: "Dairy", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "dairy"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "fruits", label: "Fruits", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "fruits"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
    {
      id: "others", label: "Others", content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "others"
          )}
          fetchStocks={fetchStocks}
        />
      )
    },
  ];




  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const inputStyle = {
    width: "100%",
    padding: "5px",
    marginTop: "2px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const totalExpenses = items.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);


  return (
    <div className="overviewContainer container">

      <div className="d-flex justify-content-between align-items-center">
        <div className="mt-2">
          <h4 className="fw-bold mb-0">Stock Management</h4>
          <p className="text-muted mb-4">
            Track restaurant supplies and inventory levels
          </p></div>
        <button
          className="bg-success text-white px-3 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>

      {/* card section */}
      <div className="row g-3  ">

        {/* <Card
          cardTitle={"Total Villas"}
          cardSubtitle={"10"}

        /> */}

        <Card
          cardTitle={"Low Stocks Alerts"}
          cardSubtitle={lowStockItems.length}
          onClick={() => setShowLowStockModal(true)}
        />



        <Card
          cardTitle={"Expenses"}
          cardSubtitle={`Rs.${totalExpenses.toLocaleString()}`}

        />
        <Card
          cardTitle={"Category"}
          cardSubtitle={"10"}

        />
      </div>

      
      {/* category */}

      <div className="container my-4">
        <div>
          <h5 className="fw-bold mb-3">Categories</h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="btn p-1"
                style={{
                  lineHeight: 1,
                  display: "inline-block",
                  backgroundColor: activeCategory === cat.id ? "#706b6bff" : "#F8F8F8", // active black, others light gray
                  color: activeCategory === cat.id ? "#fff" : "#000",
                  border: "1px solid #8b8080ff",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Display content of active category */}

          <div>
            <div className="p-3 border rounded">
              {categories.find((cat) => cat.id === activeCategory)?.content}
            </div>
          </div>
        </div>
      </div>






      {/* Modal low stock*/}
      {showLowStockModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Low Stock Items</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLowStockModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* === Your Low Stock List === */}
                <div className="border rounded p-3 bg-light mt-2">
                  <h5 className="text-danger fw-semibold mb-1">
                    Low Stock Alerts
                  </h5>
                  <p className="text-muted mb-3">
                    Items that need immediate attention
                  </p>

                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center bg-white border rounded p-3 mb-2 shadow-sm"
                    >
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-semibold">{item.item_name}</div>
                          <small className="text-muted">
                            Remaining: {item.remaining_stock}
                          </small>
                        </div>
                      </div>
                      {/* <button className="btn btn-danger btn-sm">Reorder</button> */}
                    </div>
                  ))}

                </div>
                {/* === End Low Stock List === */}
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Modal for adding restaurant stock item */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Add New Restaurant Stock Item
            </h3>
            <p>Enter the details for the new inventory item.</p>

            <form onSubmit={handleSubmit}>
              <div>
                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                >
                  <option>Select category</option>
                  <option>Dairy</option>
                  <option>Groceries</option>
                  <option>Veg</option>
                  <option>Non-Veg</option>
                  <option>Beverages</option>
                  <option>spices</option>
                  <option>Fruits</option>
                  <option>Bakery</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., kg, liters, pcs"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Price per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  name="price_per_unit"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  placeholder="Enter price per unit"
                  style={inputStyle}
                  required
                />
              </div>

              {/* <div style={{ marginTop: "8px" }}>
                <label>Used Today</label>
                <input
                  type="number"
                  name="used_today"
                  value={formData.used_today}
                  onChange={handleChange}
                  placeholder="Enter used quantity today"
                  style={inputStyle}
                />
              </div> */}

              <div style={{ marginTop: "8px" }}>
                <label>Supplier Name</label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Payment Mode</label>
                <select
                  name="payment_mode"
                  value={formData.payment_mode}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option>Select payment mode</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Received By</label>
                <input
                  type="text"
                  name="received_by"
                  value={formData.received_by}
                  onChange={handleChange}
                  placeholder="Enter staff name"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#fff",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "green",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}






    </div>
  )
}
export default Stocks