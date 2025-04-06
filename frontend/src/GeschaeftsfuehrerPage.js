import React from "react";
import { useNavigate } from "react-router-dom";

function GeschaeftsfuehrerPage() {
  const navigate = useNavigate();

  const goToInvitePage = () => {
    navigate("/invite");
  };

  return (
    <div>
      <h1>Welcome, Geschäftsführer!</h1>
      <button onClick={goToInvitePage}>Go to Invitation Page</button>
    </div>
  );
}

export default GeschaeftsfuehrerPage;
