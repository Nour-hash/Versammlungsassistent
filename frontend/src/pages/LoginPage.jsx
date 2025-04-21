import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // --- LoginPage States ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // --- Register States ---
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState(1); // 1 = Gesellschafter, 2 = Geschäftsführer
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // --- LoginPage Handler ---
  const handleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.text();
      setLoginLoading(false);
      if (response.ok) {
        // Entferne den Präfix "JWT Token: " und speichere den Token in localStorage
        const token = data.replace("JWT Token: ", "").trim();
        localStorage.setItem("jwt", token);
        // Beispielhafte Navigation (anpassen, wie benötigt)
        navigate("/home");
      } else {
        setLoginError(data);
      }
    } catch (error) {
      setLoginLoading(false);
      setLoginError("An error occurred. Please try again.");
      console.error("LoginPage failed:", error);
    }
  };

  // --- Register Handler ---
  const handleRegister = async () => {
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          role: regRole,
          companyName: regCompanyName,
        }),
      });
      const data = await response.text();
      setRegLoading(false);
      if (response.ok) {
        setRegSuccess("User registered successfully!");
      } else {
        setRegError(data);
      }
    } catch (error) {
      setRegLoading(false);
      setRegError("An error occurred. Please try again.");
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="auth-page-container">
      <h1 className="auth-page-title">
        Willkommen beim Gesellschafter-Assistenten
      </h1>
      <div className="auth-panels">
        {/* Login Panel */}
        <div className="auth-panel login-panel">
          <h2 className="panel-title">Login</h2>
          <div className="panel-form">
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button
              className="button login-button"
              onClick={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Einloggen"}
            </button>
            {loginError && <p className="error-text">{loginError}</p>}
          </div>
        </div>

        {/* Register Panel */}
        <div className="auth-panel register-panel">
          <h2 className="panel-title">Als Geschäftsführer registrieren</h2>
          <div className="panel-form">
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Enter your company name"
              value={regCompanyName}
              onChange={(e) => setRegCompanyName(e.target.value)}
            />
            <button
              className="button register-button"
              onClick={handleRegister}
              disabled={regLoading}
            >
              {regLoading ? "Registering..." : "Registrieren"}
            </button>
            {regError && <p className="error-text">{regError}</p>}
            {regSuccess && <p className="success-text">{regSuccess}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
