import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './App.css';
import "./Login.css"; // Import a CSS file for styling

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/hello" element={<HelloUser />} />
      </Routes>
    </Router>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.text();
      setLoading(false);

      if (response.ok) {
        const token = data.replace("JWT Token: ", "");
        localStorage.setItem("jwt", token);
        navigate("/hello");
      } else {
        setError(data);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred. Please try again.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <div className="login-form">
        <input
          type="email"
          className="login-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="login-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

function HelloUser() {
  const token = localStorage.getItem("jwt");
  const username = token ? jwtDecode(token).sub : "Gast";

  return (
    <div>
      <h1>Hallo, {username}!</h1>
    </div>
  );
}

export default App;
