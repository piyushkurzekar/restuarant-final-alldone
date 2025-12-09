import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { GoPeople } from "react-icons/go";
import styles from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import src from "../../../public/images/logo.png"


const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  // Map routes to titles
  const pageTitles = {
    "/": "Dashboard",
    "/staff": "Staff",
    "/finance": "Finance",
    "/booking": "Booking",
    "/stocks": "Stocks",
    "/checkinform": "Check In From",
  };

  // Get current title, default "Dashboard"
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const navigate = useNavigate();

  return (
    <nav
      className={`${styles.navbar} navbar navbar-expand-lg px-3 py-3 border-bottom mt-6`}
    >
      <div className="container-fluid d-flex align-items-center">
        {/* Sidebar toggle button - only visible on small screens */}
        <button
          className={`${styles.hamburger} btn btn-dark me-3`}
          onClick={toggleSidebar}
        >
          ☰
        </button>
 
        {/* Dynamic Page Title */}
        {/* <span className="navbar-brand fw-bold">{currentTitle}</span> */}
        <img src={src} style={{ height: "47px", marginBottom: "-5px" }} alt="" onClick={() => navigate("/")} />

      {/* 👉 Language Selector here */}
        <div className="ml-5 mt-2">
          <LanguageSelector />
        </div>

        {/* Push user info to the right */}
        <div className="ms-auto d-flex align-items-center">
          <Link
            className="navbar-brand d-flex align-items-center gap-2 fs-6"
            to="/"
          >
            <GoPeople />
            User Name
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
