import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/GeschaeftsfuehrerPage.css";
import Sidebar from "../components/Sidebar";

function GeschFtsfHrerPage() {
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // State für Navigation und bestehende Anzeige
    const [showGesellschafterForm, setShowGesellschafterForm] = useState(false);
    const [gesellschafterName, setGesellschafterName] = useState("");
    const [gesellschafterEmail, setGesellschafterEmail] = useState("");
    const [gesellschafterPasswort, setGesellschafterPasswort] = useState("");
    const [gesellschafterStimmen, setGesellschafterStimmen] = useState("");
    const [gesellschafterSuccess, setGesellschafterSuccess] = useState("");
    const [gesellschafterError, setGesellschafterError] = useState("");
    const [loadingGesellschafter, setLoadingGesellschafter] = useState(false);

    const goToInvitePage = () => {
        navigate("/invite");
    };

    const goToCreateVotePage = () => {
        navigate("/create-vote");
    };

    const toggleGesellschafterForm = () => {
        // Formular ein-/ausblenden und evtl. Reset der Felder
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

        // Abrufen des Tokens aus localStorage
        const token = localStorage.getItem("jwt");
        if (!token) {
            setGesellschafterError("Kein gültiger Token vorhanden. Bitte logge dich erneut ein.");
            setLoadingGesellschafter(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/auth/registerGesellschafter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Hier wird der Token angehängt
                },
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

        const handleLogout = () => {
            localStorage.removeItem("jwt");
            navigate("/login");
        };
    };


    return (
        <div className="page-container">
            {/* Sidebar-Komponente links */}
            <Sidebar activePage="home"/>

            {/* Hauptbereich */}
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

                {/* Form-Container für Gesellschafter */}
                {showGesellschafterForm && (
                    <div className="form-container">
                        <h2>Neuen Gesellschafter anlegen</h2>
                        <form onSubmit={handleAddGesellschafter}>
                            <div className="form-row">
                                <input
                                    type="text"
                                    className="gesellschafter-input"
                                    placeholder="Name"
                                    value={gesellschafterName}
                                    onChange={(e) => setGesellschafterName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="email"
                                    className="gesellschafter-input"
                                    placeholder="E-Mail"
                                    value={gesellschafterEmail}
                                    onChange={(e) => setGesellschafterEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="password"
                                    className="gesellschafter-input"
                                    placeholder="Passwort"
                                    value={gesellschafterPasswort}
                                    onChange={(e) => setGesellschafterPasswort(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="date"
                                    className="gesellschafter-input"
                                    placeholder="Geburtsdatum"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    type="number"
                                    className="gesellschafter-input"
                                    placeholder="Anzahl Stimmen"
                                    value={gesellschafterStimmen}
                                    onChange={(e) => setGesellschafterStimmen(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                className="gesellschafter-submit-button"
                                type="submit"
                                disabled={loadingGesellschafter}
                            >
                                {loadingGesellschafter ? "Bitte warten..." : "Gesellschafter erstellen"}
                            </button>
                            {gesellschafterError && <p className="gesellschafter-error">{gesellschafterError}</p>}
                            {gesellschafterSuccess && <p className="gesellschafter-success">{gesellschafterSuccess}</p>}
                        </form>
                    </div>
                )}

                <div className="info-container">
                    <h2>Überblick der Stimmrechte</h2>
                    <p>Weitere Daten, Statistiken oder Hinweise können hier dargestellt werden.</p>
                </div>
            </div>
        </div>
    );
}

export default GeschFtsfHrerPage;
