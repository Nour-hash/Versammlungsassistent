import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function VoteResultsContent() {
  const [votes, setVotes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          setErrorMessage("Fehler beim Laden der Abstimmungen");
        }
      } catch (error) {
        setErrorMessage("Fehler beim Laden der Abstimmungen");
        console.error(error);
      }
    };
    fetchVotes();
  }, []);

  const openVoteResults = async (voteId, topic) => {
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(`${backendUrl}/api/votes/${voteId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = Object.entries(data).map(([key, val]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          count: val,
        }));
        setResultData(formatted);
        setSelectedTopic(topic);
        setIsModalVisible(true);
      } else {
        const text = await response.text();
        setErrorMessage(text);
      }
    } catch (error) {
      setErrorMessage("Fehler beim Laden der Resultate");
      console.error(error);
    }
  };

  return (
    <div className="vote-results-content">
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <h3>Abstimmungen:</h3>
      <ul className="vote-list">
        {votes.map((v) => (
          <li key={v.id}>
            <button
              className="vote-item-button"
              onClick={() => openVoteResults(v.id, v.topic)}
            >
              {v.topic}
            </button>
          </li>
        ))}
      </ul>

      {isModalVisible && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalVisible(false)}
        >
          <div
            className="modal-content vote-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setIsModalVisible(false)}
            >
              ×
            </button>
            <h2>Ergebnisse: {selectedTopic}</h2>
            <div className="chart-container">
              {resultData && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={resultData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoteResultsContent;
