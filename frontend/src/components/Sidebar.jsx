import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ activePage}) => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <div className="sidebar-title">Gesellschafter-Assistent</div>
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activePage === "home" ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          Home
        </li>
        <li className="sidebar-item"
            onClick={() => navigate("/")}>
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
