import React, {useState, useEffect} from "react";
import Sidebar from "../components/Sidebar";
import "../styles/VotePage.css";

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
                const response = await fetch(
                    `${backendUrl}/api/votes/available`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setVotes(data);
                } else {
                    const errorText = await response.text();
                    setMessage("Fehler beim Laden der Abstimmungen: " + errorText);
                }
            } catch (err) {
                setMessage("Netzwerkfehler beim Laden der Abstimmungen");
            }
        };
        fetchVotes();
    }, [backendUrl]);

    const confirmVote = async () => {
        if (!selectedOption) {
            setMessage("Bitte wähle eine Option aus.");
            return;
        }
        const token = localStorage.getItem("jwt");
        const currentVote = votes[currentVoteIndex];
        try {
            const response = await fetch(
                `${backendUrl}/api/votes/${currentVote.id}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(selectedOption),
                }
            );
            const text = await response.text();
            if (response.ok) {
                setMessage("Stimme erfolgreich abgegeben!");
                setSelectedOption(null);
                if (currentVoteIndex + 1 < votes.length) {
                    setCurrentVoteIndex((i) => i + 1);
                } else {
                    setMessage("Alle Abstimmungen abgeschlossen!");
                    setVotes([]);
                }
            } else {
                setMessage("Fehler: " + text);
            }
        } catch {
            setMessage("Fehler beim Absenden der Stimme.");
        }
    };

    if (votes.length === 0) {
        return (
            <div className="page-container">
                <Sidebar activePage="home"/>
                <div className="centered-content">
                    <p className="info-text">{message || "Keine Abstimmungen verfügbar."}</p>
                </div>
            </div>
        );
    }

    const currentVote = votes[currentVoteIndex];

    return (
        <div className="page-container">
            <Sidebar activePage="home"/>
            <div className="centered-content">
                <h1>Abstimmung</h1>
                <h2>{currentVote.topic}</h2>
                {currentVote.description && (
                    <p className="description">{currentVote.description}</p>
                )}

                <div className="options-container">
                    {["ja", "nein", "enthalten"].map((opt) => (
                        <button
                            key={opt}
                            className={`option-button ${
                                selectedOption === opt ? "selected" : ""
                            }`}
                            onClick={() => setSelectedOption(opt)}
                        >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                    ))}
                </div>

                {selectedOption && (
                    <div className="confirm-section">
                        <p>Ausgewählt: <strong>{selectedOption}</strong></p>
                        <button className="primary-button" onClick={confirmVote}>
                            Stimme abgeben
                        </button>
                    </div>
                )}

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default VotePage;
