import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeschaeftsfuehrerPage.css";
import Sidebar from "../components/Sidebar";

function GeschFtsfHrerPage() {
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [meetings, setMeetings] = useState([]);
    const [loadingMeetings, setLoadingMeetings] = useState(true);
    const [showGesellschafterForm, setShowGesellschafterForm] = useState(false);
    const [gesellschafterName, setGesellschafterName] = useState("");
    const [gesellschafterEmail, setGesellschafterEmail] = useState("");
    const [gesellschafterPasswort, setGesellschafterPasswort] = useState("");
    const [gesellschafterStimmen, setGesellschafterStimmen] = useState("");
    const [gesellschafterSuccess, setGesellschafterSuccess] = useState("");
    const [gesellschafterError, setGesellschafterError] = useState("");
    const [loadingGesellschafter, setLoadingGesellschafter] = useState(false);
    const [noMeetingWarning, setNoMeetingWarning] = useState(false);

    const fetchMeetings = async () => {
        const token = localStorage.getItem("jwt");

        try {
            const res = await fetch(`${backendUrl}/api/meetings/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMeetings(data);
            } else {
                console.error("Fehler beim Laden der Meetings");
            }
        } catch (error) {
            console.error("Netzwerkfehler:", error);
        } finally {
            setLoadingMeetings(false);
        }
    };

    useEffect(() => {
        const checkYearlyMeeting = async () => {
            const token = localStorage.getItem("jwt");
            try {
                const res = await fetch(`${backendUrl}/api/meetings/check-yearly`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    setNoMeetingWarning(true);
                }
            } catch (error) {
                console.error("Fehler beim Prüfen der Generalversammlung", error);
            }
        };

        checkYearlyMeeting();
        fetchMeetings();
    }, [backendUrl]);


    const goToInvitePage = () => {
        navigate("/invite");
    };

    const goToCreateVotePage = () => {
        navigate("/create-vote");
    };

    const handleGoToAgenda = (id) => {
        navigate(`/meetings/${id}/agenda`);
    };

    const handleGoToResults = (id) => {
        navigate(`/meetings/${id}/results`);
    };

    const toggleGesellschafterForm = () => {
        setGesellschafterError("");
        setGesellschafterSuccess("");
        setGesellschafterName("");
        setGesellschafterEmail("");
        setGesellschafterStimmen("");
        setShowGesellschafterForm(!showGesellschafterForm);
    };

    const handleAddGesellschafter = async (e) => {
        e.preventDefault();
        setGesellschafterError("");
        setGesellschafterSuccess("");
        setLoadingGesellschafter(true);

        const token = localStorage.getItem("jwt");
        if (!token) {
            setGesellschafterError("Kein gültiger Token vorhanden. Bitte logge dich erneut ein.");
            setLoadingGesellschafter(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/auth/registerGesellschafter`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    email: gesellschafterEmail,
                    password: gesellschafterPasswort,
                    shares: parseInt(gesellschafterStimmen, 10)
                }),
            });

            const data = await response.text();
            setLoadingGesellschafter(false);

            if (response.ok) {
                setGesellschafterSuccess("Gesellschafter erfolgreich hinzugefügt!");
            } else {
                setGesellschafterError(data);
            }
        } catch (error) {
            setLoadingGesellschafter(false);
            setGesellschafterError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
            console.error("Fehler beim Hinzufügen des Gesellschafters:", error);
        }
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home" />
            {noMeetingWarning && (
                <div className="warning-box">
                    ⚠️ Achtung: Es wurde noch keine Generalversammlung für {new Date().getFullYear()} durchgeführt!
                </div>
            )}

            <div className="main-content">
                <div className="welcome-container">
                    <h1>Willkommen auf der Startseite</h1>
                    <p>Sie haben sich erfolgreich angemeldet und Ihre GmbH wurde bestätigt.</p>
                </div>

                <div className="buttons-grid">
                    <div className="button-card">
                        <button className="home-button" onClick={goToInvitePage}>
                            Einladung erstellen
                        </button>
                    </div>
                    <div className="button-card">
                        <button className="home-button" onClick={toggleGesellschafterForm}>
                            Gesellschafter hinzufügen
                        </button>
                    </div>
                    <div className="button-card">
                        <button className="home-button" onClick={goToCreateVotePage}>
                            Create a New Vote
                        </button>
                    </div>
                </div>

                {showGesellschafterForm && (
                    <div className="modal-overlay" onClick={() => setShowGesellschafterForm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Neuen Gesellschafter anlegen</h2>
                            <form onSubmit={handleAddGesellschafter}>
                                <input type="text" className="gesellschafter-input" placeholder="Name" value={gesellschafterName} onChange={(e) => setGesellschafterName(e.target.value)} required />
                                <input type="email" className="gesellschafter-input" placeholder="E-Mail" value={gesellschafterEmail} onChange={(e) => setGesellschafterEmail(e.target.value)} required />
                                <input type="password" className="gesellschafter-input" placeholder="Passwort" value={gesellschafterPasswort} onChange={(e) => setGesellschafterPasswort(e.target.value)} required />
                                <input type="number" className="gesellschafter-input" placeholder="Anzahl Stimmen" value={gesellschafterStimmen} onChange={(e) => setGesellschafterStimmen(e.target.value)} required />
                                <button className="gesellschafter-submit-button" type="submit" disabled={loadingGesellschafter}>
                                    {loadingGesellschafter ? "Bitte warten..." : "Gesellschafter erstellen"}
                                </button>
                                {gesellschafterError && <p className="gesellschafter-error">{gesellschafterError}</p>}
                                {gesellschafterSuccess && <p className="gesellschafter-success">{gesellschafterSuccess}</p>}
                                <button className="modal-close-button" onClick={() => setShowGesellschafterForm(false)}>X</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="info-container">
                    <h2>Überblick der Stimmrechte</h2>
                    <p>Weitere Daten, Statistiken oder Hinweise können hier dargestellt werden.</p>
                </div>

                {/* NEUER TEIL - Meetings ganz unten */}
                <div className="meetings-section">
                    <h2>Letzte 5 Meetings</h2>
                    {loadingMeetings ? (
                        <p>Lädt Meetings...</p>
                    ) : (
                        <div className="meetings-list">
                            {meetings.map((meeting) => (
                                <div key={meeting.id} className="meeting-card">
                                    <h3>{meeting.title}</h3>
                                    <p>{new Date(meeting.dateTime).toLocaleString()}</p>
                                    <div className="meeting-buttons">
                                        <button onClick={() => handleGoToAgenda(meeting.id)}>Tagesordnung bearbeiten</button>
                                        <button onClick={() => handleGoToResults(meeting.id)}>Beschlussergebnisse senden</button>
                                    </div>

                                    {/* Challenges anzeigen */}
                                    {meeting.challenges && meeting.challenges.length > 0 && (
                                        <div className="challenges-section">
                                            <h4>Anfechtungen:</h4>
                                            <ul>
                                                {meeting.challenges.map((email, idx) => (
                                                    <li key={idx}>{email}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>

                    )}
                </div>

            </div>
        </div>
    );
}

export default GeschFtsfHrerPage;
