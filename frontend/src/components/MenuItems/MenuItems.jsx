import React, { useState } from "react";

const MenuItems = ({ menuItems, selectedCategory, onAddToCart, onEdit, onDelete, onAddNewItem }) => {
  const [quantities, setQuantities] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );

  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", price: 0, quantity: 1, img: "", category: "" });

  const [addingNew, setAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: "", price: 0, img: "", category: "" });

  const handleIncrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditFormData({ 
      name: item.name, 
      price: item.price, 
      quantity: item.quantity || 1,
      img: item.img,
      category: item.category || ""
    });
  };

  const saveEdit = (itemId) => {
    onEdit({ ...editFormData, id: itemId });
    setEditingItemId(null);
  };

  const saveNewItem = () => {
    if (!newItemData.name || !newItemData.price || !newItemData.category) {
      alert("Please fill all fields!");
      return;
    }
    onAddNewItem(newItemData);
    setAddingNew(false);
    setNewItemData({ name: "", price: 0, img: "", category: "" });
  };

  const categories = [
  "All",
  "Hot & Tea",
  "Chinese",
  "Main course Veg",
  "Main course Non Veg",
  "Snacks",
  "Paneer",
  "Roti"
];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{selectedCategory} Menu</h4>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => setAddingNew(!addingNew)}
          >
            {addingNew ? "Cancel" : "Add New Item"}
          </button>
          <button
            className="btn btn-success"
            type="button"
            onClick={() => {
              const selectedItems = menuItems
                .filter((item) => quantities[item.id] > 0)
                .map((item) => ({
                  ...item,
                  quantity: quantities[item.id],
                  total: item.price * quantities[item.id],
                }));

              if (selectedItems.length === 0) {
                alert("Please select at least 1 item before adding to cart");
                return;
              }

              onAddToCart(selectedItems);
              setQuantities(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      {addingNew && (
        <div className="card mb-3 p-3 shadow-sm">
          <div className="mb-2">
            <label className="form-label">Item Name:</label>
            <input
              type="text"
              className="form-control"
              value={newItemData.name}
              onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Price:</label>
            <input
              type="number"
              className="form-control"
              value={newItemData.price}
              onChange={(e) => setNewItemData({ ...newItemData, price: parseFloat(e.target.value) })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Category:</label>
            <select
              className="form-control"
              value={newItemData.category}
              onChange={(e) =>
                setNewItemData({ ...newItemData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label">Image:</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setNewItemData({ ...newItemData, img: ev.target.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {newItemData.img && (
              <img
                src={newItemData.img}
                alt="preview"
                style={{ width: "80px", height: "80px", objectFit: "cover", marginTop: "5px" }}
              />
            )}
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-success" onClick={saveNewItem}>Save</button>
          </div>
        </div>
      )}

      {/* Menu Cards */}
      <div className="row">
        {filteredMenu.map((item) => (
          <div className="col-12 col-md-6 mb-3" key={item.id}>
            <div className="card h-100 shadow-sm">
              {editingItemId === item.id ? (
                <div className="card-body">
                  <div className="mb-2">
                    <label className="form-label">Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Price:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.price}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Quantity:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.quantity}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Category:</label>
                    <select
                      className="form-control"
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, category: e.target.value })
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setEditFormData({ ...editFormData, img: ev.target.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {editFormData.img && (
                      <img
                        src={editFormData.img}
                        alt="preview"
                        style={{ width: "80px", height: "80px", objectFit: "cover", marginTop: "5px" }}
                      />
                    )}
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary me-2" onClick={() => saveEdit(item.id)}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setEditingItemId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="row g-0">
                  <div className="col-4">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="img-fluid rounded-start h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-8 d-flex flex-column justify-content-between p-3">
                    <div>
                      <h5 className="card-title mb-1">{item.name}</h5>
                      <p className="text-muted mb-2">₹ {item.price}</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <button
                          className="btn btn-outline-danger btn-sm me-2"
                          onClick={() => handleDecrease(item.id)}
                          disabled={quantities[item.id] === 0}
                        >–</button>
                        <span className="mx-2">{quantities[item.id] || 0}</span>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleIncrease(item.id)}
                        >+</button>
                      </div>
                      <div>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredMenu.length === 0 && <p className="text-muted text-center">No items in this category</p>}
      </div>
    </div>
  );
};

export default MenuItems;
