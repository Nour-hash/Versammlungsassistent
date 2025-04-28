import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SendResultsPage = () => {
    const { id } = useParams();
    const [resultsText, setResultsText] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("jwt");

    useEffect(() => {
        const fetchGeneratedResults = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/meetings/${id}/generate-results`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.text(); // Textantwort
                    setResultsText(data);
                } else {
                    const errorText = await res.text();
                    setMessage(errorText || "Fehler beim Generieren der Ergebnisse.");
                }
            } catch (err) {
                setMessage("Netzwerkfehler beim Laden der Abstimmungsergebnisse.");
            } finally {
                setLoading(false);
            }
        };

        fetchGeneratedResults();
    }, [backendUrl, id, token]);

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
            setMessage("Netzwerkfehler beim Versenden.");
        }
    };

    const handleDownloadPdf = () => {
        const blob = new Blob([resultsText], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Beschlussergebnisse.pdf`;
        link.click();

        window.URL.revokeObjectURL(link.href); // Clean-up
    };

    if (loading) {
        return <p>Ergebnisse werden geladen...</p>;
    }

    return (
        <div className="send-results-container">
            <h2>Beschlussergebnisse versenden</h2>
            <textarea
                value={resultsText}
                onChange={(e) => setResultsText(e.target.value)}
                placeholder="Hier die Beschlussergebnisse eingeben..."
                rows={12}
                style={{ width: "100%", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={handleSend}>Senden</button>
                <button onClick={handleDownloadPdf}>PDF herunterladen</button>
            </div>
            {message && <p style={{ marginTop: "1rem", color: message.includes("erfolgreich") ? "green" : "red" }}>{message}</p>}
        </div>
    );
};

export default SendResultsPage;
