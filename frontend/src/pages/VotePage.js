import React, { useState, useEffect } from "react";

function VotePage() {
  const [votes, setVotes] = useState([]);
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchVotes = async () => {
      const token = localStorage.getItem("jwt");
      try {
        const response = await fetch(`${backendUrl}/api/votes/company`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched votes:", data); // Log the response data
          setVotes(data);
        } else {
          const errorText = await response.text();
          console.error("Error fetching votes:", errorText);
          setMessage("Failed to fetch votes: " + errorText);
        }
      } catch (error) {
        console.error("An error occurred while fetching votes:", error);
        setMessage("An error occurred while fetching votes");
      }
    };
    fetchVotes();
  }, [backendUrl]);

  const submitVote = async (voteId, result) => {
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
      setMessage(data);
    } catch (error) {
      console.error("Failed to submit vote:", error);
      setMessage("Failed to submit vote");
    }
  };

  return (
    <div>
      <h1>Vote Page</h1>
      {votes.length === 0 ? (
        <p>{message || "No votes available"}</p>
      ) : (
        votes.map((vote) => (
          <div key={vote.id}>
            <h2>{vote.topic}</h2>
            <button onClick={() => submitVote(vote.id, "ja")}>Ja</button>
            <button onClick={() => submitVote(vote.id, "nein")}>Nein</button>
            <button onClick={() => submitVote(vote.id, "enthalten")}>Enthalten</button>
          </div>
        ))
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default VotePage;
