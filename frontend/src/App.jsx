import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import Invoice from "./pages/Invoice.jsx";
import Login from "./pages/Login.jsx";

import Protected from "./Protected.jsx";
import { OrdersProvider } from "./context/OrdersContext";

function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/login"; // ❗ only login hides layout

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {!hideLayout && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      
      <div className="main-content">
        {!hideLayout && <Navbar toggleSidebar={toggleSidebar} />}

        <div className="p-4">{children}</div>

        {!hideLayout && <Footer />}
      </div>
    </>
  );
}

const App = () => {
  return (
    <OrdersProvider>
      <Router>
        <Layout>
          <Routes>

            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />

            <Route
              path="/staff"
              element={
                <Protected>
                  <Staff />
                </Protected>
              }
            />

            <Route
              path="/finance"
              element={
                <Protected>
                  <Finance />
                </Protected>
              }
            />

            <Route
              path="/orders"
              element={
                <Protected>
                  <Orders />
                </Protected>
              }
            />

            <Route
              path="/takeorders"
              element={
                <Protected>
                  <TakeOrders />
                </Protected>
              }
            />

            <Route
              path="/invoice/:orderId"
              element={
                <Protected>
                  <Invoice />
                </Protected>
              }
            />

            <Route
              path="/cart"
              element={
                <Protected>
                  <Cart />
                </Protected>
              }
            />

            <Route
              path="/stocks"
              element={
                <Protected>
                  <Stocks />
                </Protected>
              }
            />

            <Route
              path="/kitchen"
              element={
                <Protected>
                  <Kitchen />
                </Protected>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </OrdersProvider>
  );
};

export default App;
