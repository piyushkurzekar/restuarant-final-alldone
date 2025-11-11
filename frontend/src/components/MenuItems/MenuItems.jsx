// import React, { useState } from "react";

// const MenuItems = ({ menuItems, selectedCategory, onAddToCart }) => {
//   // Manage local quantities
//   const [quantities, setQuantities] = useState(
//     menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
//   );

//   // Handle quantity change
//   const handleQuantityChange = (id, value) => {
//     setQuantities((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   // Filter menu by category
//   const filteredMenu =
//     selectedCategory === "All"
//       ? menuItems
//       : menuItems.filter((item) => item.category === selectedCategory);

//   return (
//     <div>
//       {/* Menu Header with Add to Cart */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4 className="mb-0">{selectedCategory} Menu</h4>
//         <button
//           className="btn btn-success"
//           type="button"
//           onClick={() => {
//             const selectedItems = menuItems
//               .filter((item) => quantities[item.id] > 0)
//               .map((item) => ({
//                 ...item,
//                 quantity: parseInt(quantities[item.id]),
//                 total: item.price * quantities[item.id],
//               }));

//             onAddToCart(selectedItems);

//             // Reset quantities
//             setQuantities(
//               menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
//             );
//           }}
//         >
//           Add to Cart
//         </button>
//       </div>

//       {/* Menu as Cards */}
//       <div className="row">
//         {filteredMenu.map((item) => (
//           <div className="col-12 col-md-6 mb-3" key={item.id}>
//             <div className="card h-100 shadow-sm">
//               <div className="row g-0">
//                 {/* Left: Image */}
//                 <div className="col-4">
//                   <img
//                     src={item.img}
//                     alt={item.name}
//                     className="img-fluid rounded-start h-100"
//                     style={{ objectFit: "cover" }}
//                   />
//                 </div>

//                 {/* Right: Details */}
//                 <div className="col-8 d-flex flex-column justify-content-between p-3">
//                   <div>
//                     <h5 className="card-title mb-1">{item.name}</h5>
//                     <p className="text-muted mb-2">₹ {item.price}</p>
//                   </div>
//                   <div>
//                     <input
//                       type="number"
//                       min="0"
//                       className="form-control"
//                       style={{ width: "100px" }}
//                       value={quantities[item.id]}
//                       onChange={(e) =>
//                         handleQuantityChange(item.id, e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//         {filteredMenu.length === 0 && (
//           <p className="text-muted text-center">No items in this category</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MenuItems;




import React, { useState } from "react";

const MenuItems = ({ menuItems, selectedCategory, onAddToCart }) => {
  // Manage local quantities
  const [quantities, setQuantities] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );

  // Increase quantity
  const handleIncrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Decrease quantity
  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  // Filter menu by category
  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div>
      {/* Menu Header with Add to Cart */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{selectedCategory} Menu</h4>
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

            // Reset quantities after adding
            setQuantities(
              menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
            );
          }}
        >
          Add to Cart
        </button>
      </div>

      {/* Menu as Cards */}
      <div className="row">
        {filteredMenu.map((item) => (
          <div className="col-12 col-md-6 mb-3" key={item.id}>
            <div className="card h-100 shadow-sm">
              <div className="row g-0">
                {/* Left: Image */}
                <div className="col-4">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="img-fluid rounded-start h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {/* Right: Details */}
                <div className="col-8 d-flex flex-column justify-content-between p-3">
                  <div>
                    <h5 className="card-title mb-1">{item.name}</h5>
                    <p className="text-muted mb-2">₹ {item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDecrease(item.id)}
                      disabled={quantities[item.id] === 0}
                    >
                      –
                    </button>
                    <span className="mx-3" style={{ minWidth: "10px" }}>
                      {quantities[item.id] || 0}
                    </span>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleIncrease(item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredMenu.length === 0 && (
          <p className="text-muted text-center">No items in this category</p>
        )}
      </div>
    </div>
  );
};

export default MenuItems;
