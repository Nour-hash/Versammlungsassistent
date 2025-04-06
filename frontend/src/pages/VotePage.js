import React, { useState, useEffect } from "react";

function VotePage() {
  const [votes, setVotes] = useState([]);
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
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

  const confirmVote = async () => {
    if (!selectedOption) {
      setMessage("Please select an option before confirming.");
      return;
    }

    const token = localStorage.getItem("jwt");
    const currentVote = votes[currentVoteIndex];
    try {
      const response = await fetch(`${backendUrl}/api/votes/${currentVote.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedOption),
      });
      const data = await response.text();
      if (response.ok) {
        setMessage("Vote submitted successfully!");
        setSelectedOption(null); // Reset the selected option
        // Move to the next vote
        if (currentVoteIndex + 1 < votes.length) {
          setCurrentVoteIndex(currentVoteIndex + 1);
        } else {
          setMessage("All votes completed!");
          setVotes([]); // Clear votes when all are completed
        }
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error("Failed to submit vote:", error);
      setMessage("Failed to submit vote");
    }
  };

  if (votes.length === 0) {
    return <p>{message || "No votes available"}</p>;
  }

  const currentVote = votes[currentVoteIndex];

  return (
    <div>
      <h1>Vote Page</h1>
      <h2>{currentVote.topic}</h2>
      <div>
        <button onClick={() => setSelectedOption("ja")}>Ja</button>
        <button onClick={() => setSelectedOption("nein")}>Nein</button>
        <button onClick={() => setSelectedOption("enthalten")}>Enthalten</button>
      </div>
      {selectedOption && (
        <div>
          <p>You selected: {selectedOption}</p>
          <button onClick={confirmVote}>Stimmabgabe bestätigen</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default VotePage;
