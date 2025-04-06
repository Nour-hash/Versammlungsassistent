import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Home.css";

function GeschFtsfHrerPage() {
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // State für Navigation und bestehende Anzeige
    const [showGesellschafterForm, setShowGesellschafterForm] = useState(false);
    const [gesellschafterName, setGesellschafterName] = useState("");
    const [gesellschafterEmail, setGesellschafterEmail] = useState("");
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

    const handleWeiter = () => {
        navigate("/invite"); // ✅ leitet weiter
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

        // Anpassen: Hier wird ein POST-Request an einen angenommenen Endpoint geschickt.
        // Der Request enthält Name, E-Mail, Stimmen und die Rolle "Gesellschafter".
        try {
            const response = await fetch(`${backendUrl}/api/auth/registerGesellschafter`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: gesellschafterName,
                    email: gesellschafterEmail,
                    stimmen: gesellschafterStimmen,
                    role: "Gesellschafter"
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
        <div className="home-container">
            <div className="home-box">
                <h1 className="home-title">Willkommen auf der Startseite</h1>
                <p className="home-text">
                    Sie haben sich erfolgreich angemeldet und Ihre GmbH wurde bestätigt.
                </p>
                <button className="home-button" onClick={handleWeiter}>
                    Einladung erstellen
                </button>

                {/* Neuer Button für Gesellschafter */}
                <button className="home-button gesellschafter-button" onClick={toggleGesellschafterForm}>
                    Gesellschafter hinzufügen
                </button>

                <button className="home-button" onClick={goToCreateVotePage}>Create a New Vote</button>
                <button className="home-button" onClick={goToInvitePage}>Go to Invitation Page</button>

                {showGesellschafterForm && (
                    <form className="gesellschafter-form" onSubmit={handleAddGesellschafter}>
                        <h2>Neuen Gesellschafter anlegen</h2>
                        <input
                            type="text"
                            className="gesellschafter-input"
                            placeholder="Name"
                            value={gesellschafterName}
                            onChange={(e) => setGesellschafterName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            className="gesellschafter-input"
                            placeholder="E-Mail"
                            value={gesellschafterEmail}
                            onChange={(e) => setGesellschafterEmail(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            className="gesellschafter-input"
                            placeholder="Anzahl Stimmen"
                            value={gesellschafterStimmen}
                            onChange={(e) => setGesellschafterStimmen(e.target.value)}
                            required
                        />

                        <button className="gesellschafter-submit-button" type="submit" disabled={loadingGesellschafter}>
                            {loadingGesellschafter ? "Bitte warten..." : "Gesellschafter erstellen"}
                        </button>
                        {gesellschafterError && <p className="gesellschafter-error">{gesellschafterError}</p>}
                        {gesellschafterSuccess && <p className="gesellschafter-success">{gesellschafterSuccess}</p>}
                    </form>
                )}
            </div>
        </div>
    );
}

export default GeschFtsfHrerPage;
