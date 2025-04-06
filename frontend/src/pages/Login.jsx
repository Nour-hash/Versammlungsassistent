import React, { useState } from "react";
import "../styles/Login.css"; // CSS importieren


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Use the backend URL from the environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    try {
      // Send email and password to the backend
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.text();
      console.log("Login successful:", data);
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
