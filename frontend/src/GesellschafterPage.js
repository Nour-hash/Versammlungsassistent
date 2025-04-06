import React from "react";
import { useNavigate } from "react-router-dom";

function GesellschafterPage() {
  const navigate = useNavigate();

  const goToVotePage = () => {
    navigate("/votes");
  };

  return (
    <div>
      <h1>Welcome, Gesellschafter!</h1>
      <button onClick={goToVotePage}>Go to Voting Page</button>
      <p>You can view company information here.</p>
    </div>
  );
}

export default GesellschafterPage;
