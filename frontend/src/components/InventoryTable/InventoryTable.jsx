import React, { useState, useEffect } from "react";

const API_URL = "https://shivaam-farms-and-resorts-restaurant-t95b.onrender.com/api/restaurant-stocks";

const InventoryTable = ({ items: propsItems, fetchStocks }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(propsItems || []);
    }, [propsItems]);


    // 🧩 Update "used_today" logic
    const handleUsedChange = async (id, newUsedValue) => {
        try {
            // Local update for instant UI change
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, used_today: newUsedValue }
                        : item
                )
            );

            // Update backend
            const res = await fetch(`${API_URL}/update-used/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ used_today: Number(newUsedValue) }),

            });


            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update used_today");

            console.log("✅ Used_today updated successfully");
            fetchStocks();

        } catch (err) {
            console.error("Error updating used_today:", err);
            alert("Failed to update used_today");
        }
    };

    // 🧹 Delete item
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to delete");

                setItems((prev) => prev.filter((item) => item.id !== id));
                alert(data.message);
            } catch (err) {
                console.error("Delete error:", err);
                alert("Error deleting item");
            }
        }
    };

    return (
        <div style={{ marginTop: "20px", overflowX: "auto", whiteSpace: "nowrap" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Stock Inventory</h3>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    marginTop: "10px",
                }}
            >
                <thead>
                    <tr style={{ background: "#f2f2f2", borderRadius: "6px" }}>
                        <th style={thStyle}>Item Name</th>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Unit</th>
                        <th style={thStyle}>Quantity</th>
                        <th style={thStyle}>Price/Unit</th>
                        <th style={thStyle}>Total Price</th>
                        <th style={thStyle}>Used Today</th>
                        <th style={thStyle}>Remaining</th>
                        <th style={thStyle}>Received By</th>
                        <th style={thStyle}>Supplier</th>
                        <th style={thStyle}>Payment Mode</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <tr key={item.id}>
                                <td style={tdStyle}>{item.item_name}</td>
                                <td style={tdStyle}>{item.category}</td>
                                <td style={tdStyle}>{item.unit}</td>
                                <td style={tdStyle}>{item.quantity}</td>
                                <td style={tdStyle}>₹{item.price_per_unit}</td>
                                <td style={tdStyle}>₹{item.total_price}</td>

                                {/* Editable Used Today field */}
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <button
                                            type="button"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                background: "#f8f9fa",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                handleUsedChange(item.id, Math.max((item.used_today || 0) - 1, 0))
                                            }
                                        >
                                            -
                                        </button>

                                        <input
                                            type="number"
                                            value={item.used_today || 0}
                                            min="0"
                                            className="form-control form-control-sm"
                                            style={{
                                                width: "60px",
                                                textAlign: "center",
                                            }}
                                            onChange={(e) => handleUsedChange(item.id, e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                background: "#f8f9fa",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleUsedChange(item.id, (item.used_today || 0) + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>

                                {/* Auto-calculated Remaining Stock */}
                                <td
                                    style={{
                                        ...tdStyle,
                                        color:
                                            item.remaining_stock <= 5
                                                ? "red"
                                                : item.remaining_stock <= 10
                                                    ? "orange"
                                                    : "black",
                                        fontWeight:
                                            item.remaining_stock <= 10 ? "600" : "normal",
                                    }}
                                >
                                   {item.remaining_stock}

                                </td>

                                <td style={tdStyle}>{item.received_by}</td>
                                <td style={tdStyle}>{item.supplier_name}</td>
                                <td style={tdStyle}>{item.payment_mode}</td>
                                <td style={tdStyle}>{item.date}</td>
                                <td style={tdStyle}>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        style={{ padding: "4px 10px", borderRadius: "6px" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(item.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td style={tdStyle} colSpan="13">
                                No items found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Styles
const thStyle = {
    borderBottom: "2px solid #dee2e6",
    padding: "10px 20px",
    textAlign: "left",
    fontWeight: "bold",
    whiteSpace: "nowrap",
};

const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "8px 20px",
    whiteSpace: "nowrap",
    fontSize: "0.95rem",
};

export default InventoryTable;
