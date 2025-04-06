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
          setVotes(data);
        } else {
          setMessage("Failed to fetch votes");
        }
      } catch (error) {
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
      setMessage("Failed to submit vote");
    }
  };

  return (
    <div>
      <h1>Vote Page</h1>
      {votes.length === 0 ? (
        <p>No votes available</p>
      ) : (
        votes.map((vote) => (
          <div key={vote.id}>
            <h2>{vote.topic}</h2>
            <button onClick={() => submitVote(vote.id, "yes")}>Yes</button>
            <button onClick={() => submitVote(vote.id, "no")}>No</button>
          </div>
        ))
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default VotePage;
