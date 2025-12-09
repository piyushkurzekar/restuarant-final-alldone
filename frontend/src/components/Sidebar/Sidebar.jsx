import React from "react";
import { NavLink } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdReceipt } from "react-icons/md";
import { MdDinnerDining } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { MdCurrencyRupee } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { LuBox } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { FaShoppingCart, FaWpforms } from "react-icons/fa";
import { IoFastFoodOutline } from "react-icons/io5";
import styles from "./Sidebar.module.css";
import { useNavigate } from "react-router-dom";   // ✅ added


const Sidebar = ({ isOpen, toggleSidebar }) => {
    
    const navigate = useNavigate();   // 👍 move here

    const role = localStorage.getItem("role");

    const linkClass = ({ isActive }) =>
        `nav-link d-flex align-items-center text-black mb-2 ${isActive ? styles.activeLink : ""}`;

    const handleLogout = () => {
        localStorage.removeItem("loggedIn");
        navigate("/login");
    };

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`} >
            <div>
                <div
                    className={`${styles.sidebarHeader} d-flex align-items-center justify-content-between mb-4 mt-6`}>
                    <h2 className="fs-5 my-0">Restaurant Manager</h2>
                    <button className={` ${styles.close} btn btn-sm  z-3`} onClick={toggleSidebar}>
                        ✖
                    </button>
                </div>

                <ul className="nav flex-column p-2">

                    {/* Always visible pages */}
                    <li>
                        <NavLink to="/" className={linkClass}>
                            <LuLayoutDashboard className="me-2" />
                            Dashboard
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/orders" className={linkClass}>
                            <IoFastFoodOutline className="me-2" />
                            Orders
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/takeorders" className={linkClass}>
                            <MdPlaylistAdd className="me-2" />
                            Take Orders
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/invoice/123" className={linkClass}>
                            <MdReceipt className="me-2" />
                            Invoice
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/kitchen" className={linkClass}>
                            <MdDinnerDining className="me-2" />
                            Kitchen
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/cart" className={linkClass}>
                            <FaShoppingCart className="me-2" />
                            Cart
                        </NavLink>
                    </li>

                    {/* ⭐ ONLY ADMIN */}
                    {role === "admin" && (
                        <>
                            <li>
                                <NavLink to="/staff" className={linkClass}>
                                    <GoPeople className="me-2" />
                                    Staff
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/finance" className={linkClass}>
                                    <MdCurrencyRupee className="me-2" />
                                    Finance
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/stocks" className={linkClass}>
                                    <LuBox className="me-2" />
                                    Stocks
                                </NavLink>
                            </li>
                        </>
                    )}
 
                </ul>
               {/* ✅ LOGOUT BUTTON (Top Right) */}
                <div className="ml-5">
                    <button
                        className="btn btn-danger px-4 py-2"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default Sidebar;
