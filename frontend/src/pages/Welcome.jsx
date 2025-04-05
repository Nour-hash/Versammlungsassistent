import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css"; // CSS importieren

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1 className="welcome-title">Einloggen oder als CEO Registrieren</h1>
        <div className="welcome-buttons">
          <button className="welcome-button" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="welcome-button" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
