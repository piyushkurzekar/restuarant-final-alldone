// import React, { createContext, useContext, useState } from "react";

// const OrdersContext = createContext();

// export const OrdersProvider = ({ children }) => {
//   const [cart, setCart] = useState({});
//   const [confirmedOrders, setConfirmedOrders] = useState({});

//   const confirmOrder = (tableKey, orderData) => {
//     setConfirmedOrders((prev) => ({
//       ...prev,
//       [tableKey]: orderData,
//     }));
//   };

//   return (
//     <OrdersContext.Provider value={{ cart, setCart, confirmedOrders, confirmOrder }}>
//       {children}
//     </OrdersContext.Provider>
//   );
// };

// export const useOrders = () => useContext(OrdersContext);

import React, { createContext, useContext, useState } from "react";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [confirmedOrders, setConfirmedOrders] = useState({});

  // Generate unique key for table + date
  const getTableDateKey = (tableNumber, date) => `${tableNumber}_${date}`;

  // Add or update order in cart
  const addOrUpdateCart = (orderData) => {
    const date = orderData.date || new Date().toISOString().split("T")[0];
    const tableKey = getTableDateKey(orderData.tableNumber, date);

    setCart((prev) => ({
      ...prev,
      [tableKey]: { ...orderData, date },
    }));
  };

  // Confirm order: move from cart to confirmedOrders
  const confirmOrder = (tableNumber, orderData) => {
    const date = orderData.date || new Date().toISOString().split("T")[0];
    const tableKey = getTableDateKey(tableNumber, date);

    setConfirmedOrders((prev) => ({
      ...prev,
      [tableKey]: { ...orderData, date },
    }));
  };

  // Remove from cart
  const removeFromCart = (tableNumber, date) => {
    const tableKey = getTableDateKey(tableNumber, date);
    const updatedCart = { ...cart };
    delete updatedCart[tableKey];
    setCart(updatedCart);
  };

  return (
    <OrdersContext.Provider
      value={{
        cart,
        setCart,
        addOrUpdateCart,
        confirmedOrders,
        confirmOrder,
        removeFromCart,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
