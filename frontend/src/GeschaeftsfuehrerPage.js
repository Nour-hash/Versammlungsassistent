import React from "react";
import { useNavigate } from "react-router-dom";

function GeschaeftsfuehrerPage() {
  const navigate = useNavigate();

  const goToInvitePage = () => {
    navigate("/invite");
  };

  const goToCreateVotePage = () => {
    navigate("/create-vote");
  };

  return (
    <div>
      <h1>Welcome, Geschäftsführer!</h1>
      <button onClick={goToCreateVotePage}>Create a New Vote</button>
      <button onClick={goToInvitePage}>Go to Invitation Page</button>
    </div>
  );
}

export default GeschaeftsfuehrerPage;
