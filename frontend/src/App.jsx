import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff.jsx";
import Finance from "./pages/Finance.jsx";
import Orders from "./pages/Orders.jsx";
import Cart from "./pages/Cart";
import Stocks from "./pages/Stocks.jsx";
import Kitchen from "./pages/Kitchen.jsx";
import TakeOrders from "./pages/TakeOrders.jsx";
import Invoice from "./pages/Invoice.jsx";   // ✅ Kitchen added

import { OrdersProvider } from "./context/OrdersContext";


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <OrdersProvider>
      <Router>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="main-content">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/takeorders" element={<TakeOrders />} />
              <Route path="/invoice/:orderId" element={<Invoice />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/kitchen" element={<Kitchen />} /> {/* ✅ New route */}
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </OrdersProvider>
  );
};

export default App;
