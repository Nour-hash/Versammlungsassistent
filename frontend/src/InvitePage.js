import React, { useState } from "react";

function InvitePage() {
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Fallback to localhost:8080

  const createInvitation = async () => {
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(`${backendUrl}/api/auth/create-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.text();
      setMessage(data);
    } catch (error) {
      setMessage("Failed to create invitation");
    }
  };

  return (
    <div>
      <h1>Create Invitation</h1>
      <button onClick={createInvitation}>Create Invitation</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default InvitePage;
