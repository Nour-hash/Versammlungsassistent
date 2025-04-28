import React, { useState } from "react";
import { useParams } from "react-router-dom";

const SendResultsPage = () => {
    const { id } = useParams();
    const [resultsText, setResultsText] = useState("");
    const [message, setMessage] = useState("");
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("jwt");

    const handleSend = async () => {
        if (!resultsText.trim()) {
            setMessage("Bitte gib das Beschlussergebnis ein, bevor du es versendest.");
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/meetings/${id}/results`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ resultsText }),
            });

            if (res.ok) {
                setMessage("Beschlussergebnisse erfolgreich versendet.");
            } else {
                setMessage("Fehler beim Versenden der Ergebnisse.");
            }
        } catch (err) {
            setMessage("Netzwerkfehler.");
        }
    };


    return (
        <div className="send-results-container">
            <h2>Beschlussergebnisse versenden</h2>
            <textarea
                value={resultsText}
                onChange={(e) => setResultsText(e.target.value)}
                placeholder="Hier die Beschlussergebnisse eingeben..."
                rows={10}
                style={{ width: "100%" }}
            />
            <br/>
            <button onClick={handleSend}>Senden</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SendResultsPage;
