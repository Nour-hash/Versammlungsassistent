import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/logo.png"

const Sidebar = ({ activePage}) => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <img src={logo} alt="AssemBly Logo" className="sidebar-logo" />
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activePage === "home" ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          Startseite
        </li>
        <li className="sidebar-item"
            onClick={() => navigate("/")}>
          Ausloggen
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
