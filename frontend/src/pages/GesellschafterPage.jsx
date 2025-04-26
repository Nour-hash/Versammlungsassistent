import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function GesellschafterPage() {
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [meetings, setMeetings] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true); // NEU

    const token = localStorage.getItem("jwt");

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/meetings/my-latest`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setMeetings(data);
                } else {
                    const text = await res.text();
                    setMessage(`Fehler beim Laden der Meetings: ${text}`);
                }
            } catch (error) {
                setMessage("Netzwerkfehler beim Laden der Meetings");
            } finally {
                setLoading(false); // Fertig mit Laden
            }
        };

        fetchMeetings();
    }, [backendUrl, token]);

    const handleChallenge = async (id) => {
        try {
            const res = await fetch(`${backendUrl}/api/meetings/${id}/challenge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setMessage("✅ Anfechtung erfolgreich eingereicht.");
            } else {
                const text = await res.text();
                setMessage(`❌ Fehler beim Anfechten: ${text}`);
            }
        } catch (err) {
            setMessage("❌ Netzwerkfehler beim Anfechten.");
        }
    };

    const goToVotePage = () => {
        navigate("/votes");
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home" />
            <div className="main-content">
                <h1>Willkommen, Gesellschafter!</h1>
                <button onClick={goToVotePage}>Zur Abstimmungsseite</button>

                <p>Hier sind deine letzten 5 Meetings:</p>

                {loading ? (
                    <p>🔄 Lädt Meetings...</p>
                ) : (
                    <div className="meetings-list">
                        {meetings.length === 0 ? (
                            <p>Keine Meetings gefunden.</p>
                        ) : (
                            meetings.map((meeting) => (
                                <div key={meeting.id} className="meeting-card">
                                    <h3>{meeting.title}</h3>
                                    <p>Datum: {new Date(meeting.dateTime).toLocaleString()}</p>

                                    {meeting.resultsSentAt ? (
                                        <div>
                                            <button onClick={() => handleChallenge(meeting.id)}>
                                                Ergebnis anfechten
                                            </button>
                                        </div>
                                    ) : (
                                        <p>Beschlussergebnisse noch nicht versendet.</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {message && <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
            </div>
        </div>
    );
}

export default GesellschafterPage;
