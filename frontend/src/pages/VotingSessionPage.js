import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VotingSessionPage() {
  const { voteId } = useParams(); // Get the vote ID from the URL
  const [vote, setVote] = useState(null);
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVote = async () => {
      const token = localStorage.getItem("jwt");
      try {
        const response = await fetch(`${backendUrl}/api/votes/${voteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setVote(data);
        } else {
          const errorText = await response.text();
          console.error("Error fetching vote:", errorText);
          setMessage("Failed to fetch vote: " + errorText);
        }
      } catch (error) {
        console.error("An error occurred while fetching the vote:", error);
        setMessage("An error occurred while fetching the vote");
      }
    };
    fetchVote();
  }, [backendUrl, voteId]);

  const submitVote = async (result) => {
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(`${backendUrl}/api/votes/${voteId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });
      const data = await response.text();
      if (response.ok) {
        setMessage("Vote submitted successfully!");
        navigate("/votes"); // Navigate back to the list of votes
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error("Failed to submit vote:", error);
      setMessage("Failed to submit vote");
    }
  };

  if (!vote) {
    return <p>{message || "Loading vote..."}</p>;
  }

  return (
    <div>
      <h1>Vote on: {vote.topic}</h1>
      <button onClick={() => submitVote("ja")}>Ja</button>
      <button onClick={() => submitVote("nein")}>Nein</button>
      <button onClick={() => submitVote("enthalten")}>Enthalten</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default VotingSessionPage;
