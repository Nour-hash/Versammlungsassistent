import React, { useState } from "react";
import "../styles/Register.css"; // Import a CSS file for styling

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(1); // Default role is "Gesellschafter"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.text();
      setLoading(false);

      if (response.ok) {
        setSuccess("User registered successfully!");
      } else {
        setError(data);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred. Please try again.");
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      <div className="register-form">
        <input
          type="email"
          className="register-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="register-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="register-select"
          value={role}
          onChange={(e) => setRole(parseInt(e.target.value, 10))}
        >
          <option value={1}>Gesellschafter</option>
          <option value={2}>Geschäftsführer</option>
        </select>
        <button className="register-button" onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <p className="register-error">{error}</p>}
        {success && <p className="register-success">{success}</p>}
      </div>
    </div>
  );
}

export default Register;
