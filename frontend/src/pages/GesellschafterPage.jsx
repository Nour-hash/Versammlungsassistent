import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/GesellchafterPage.css";

function GesellschafterPage() {
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [meetings, setMeetings] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("jwt");

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/meetings/my-latest`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (res.ok) {
                    setMeetings(await res.json());
                } else {
                    const text = await res.text();
                    setMessage(`Fehler beim Laden der Meetings: ${text}`);
                }
            } catch (err) {
                setMessage("Netzwerkfehler beim Laden der Meetings");
            } finally {
                setLoading(false);
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
        } catch {
            setMessage("❌ Netzwerkfehler beim Anfechten.");
        }
    };

    const goToVotePage = () => {
        navigate("/votes");
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home"/>
            <div className="centered-content">
                <h1>Willkommen, Gesellschafter!</h1>
                <button className="primary-button" onClick={goToVotePage}>
                    Zur Abstimmungsseite
                </button>

                <section className="meetings-section">
                    <h2>Deine letzten 5 Meetings</h2>
                    {loading ? (
                        <p className="info-text">🔄 Lädt Meetings...</p>
                    ) : meetings.length === 0 ? (
                        <p className="info-text">Keine Meetings gefunden.</p>
                    ) : (
                        <div className="meetings-list">
                            {meetings.map((meeting) => (
                                <div key={meeting.id} className="meeting-card">
                                    <h3>{meeting.title}</h3>
                                    <p className="meeting-date">
                                        {new Date(meeting.dateTime).toLocaleString()}
                                    </p>
                                    {meeting.resultsSentAt ? (
                                        <button
                                            className="secondary-button"
                                            onClick={() => handleChallenge(meeting.id)}
                                        >
                                            Ergebnis anfechten
                                        </button>
                                    ) : (
                                        <p className="info-text">
                                            Beschlussergebnisse noch nicht versendet.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {message && (
                    <p
                        className={
                            message.startsWith("✅") ? "message-success" : "message-error"
                        }
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default GesellschafterPage;
