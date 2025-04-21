import React, { useEffect, useState } from "react";
import '../styles/InvitePage.css';
import Sidebar from "../components/Sidebar";

const genericAgendaOptions = [
    "Eröffnung und Begrüßung",
    "Jahresabschluss",
    "Entlastung der Geschäftsführung",
    "Wahl neuer Geschäftsführer",
    "Bericht des Aufsichtsrats",
    "Ausschüttung Dividende",
    "Änderung Gesellschaftsvertrag",
    "Genehmigung Investitionen",
    "Personalplanung",
    "Sonstiges"
];

const InvitePage = () => {
    const [title, setTitle] = useState("Generalversammlung Q1 2024");
    const [dateTime, setDateTime] = useState("");
    const [type, setType] = useState("Virtuell");
    const [location, setLocation] = useState("");
    const [participants, setParticipants] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [newAgendaPoint, setNewAgendaPoint] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState("");
    const [message, setMessage] = useState("");

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchUsers = async () => {

            const rawToken = localStorage.getItem("jwt");
            const token = rawToken?.replace("JWT Token: ", "").trim();

            try {
                const res = await fetch(`${backendUrl}/api/users/shareholders`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });


                if (!res.ok) {
                    throw new Error(`Fehler beim Laden: ${res.status}`);
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setAvailableUsers(data);
                } else {
                    setAvailableUsers([]);
                    console.error("Unerwartete Antwort:", data);
                }
            } catch (err) {
                console.error("Fehler beim Laden der Gesellschafter:", err);
                setAvailableUsers([]);
            }
        };

        fetchUsers();
    }, []);

    const addAgendaPoint = () => {
        if (newAgendaPoint.trim() !== "") {
            setAgenda([...agenda, newAgendaPoint]);
            setNewAgendaPoint("");
        }
    };

    const removeAgendaPoint = (index) => {
        setAgenda(agenda.filter((_, i) => i !== index));
    };

    const addParticipant = () => {
        if (selectedParticipant && !participants.includes(selectedParticipant)) {
            setParticipants([...participants, selectedParticipant]);
            setSelectedParticipant("");
        }
    };

    const createInvitation = async () => {
        const token = localStorage.getItem("jwt");
        const payload = {
            title,
            dateTime,
            meetingType: type,
            locationOrLink: location,
            participants,
            agendaItems: agenda
        };

        try {
            const response = await fetch(`${backendUrl}/api/meetings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.text();
            setMessage(data);
        } catch (error) {
            setMessage("Fehler beim Erstellen der Einladung");
        }
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home" />
            <div className="meeting-wrapper">
                <button className="top-button" onClick={createInvitation}>Einladung erstellen</button>

                <h1 className="heading">Einladung der Gesellschafter zur Versammlung</h1>

                <form className="form" onSubmit={(e) => e.preventDefault()}>
                    <div className="field">
                        <label>Meetingtitel</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Datum und Uhrzeit</label>
                        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Meeting Typ</label>
                        <div className="radio-group">
                            {["Virtuell", "Hybrid", "Präsenz"].map((t) => (
                                <label key={t}>
                                    <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} />
                                    {t}
                                </label>
                            ))}
                        </div>

                        <label>Teilnehmer hinzufügen</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                list="users"
                                value={selectedParticipant}
                                onChange={(e) => setSelectedParticipant(e.target.value)}
                                placeholder="z.B. max@example.com"
                            />
                            <button type="button" onClick={addParticipant}>+</button>
                        </div>
                        <datalist id="users">
                            {availableUsers.map(user => (
                                <option key={user.email} value={user.email}>{user.name}</option>
                            ))}
                        </datalist>
                        <ul>
                            {participants.map((p, idx) => (
                                <li key={idx}>{p}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="field">
                        <label>Ort oder Konferenzlink</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Tagesordnung</label>
                        <p className="info">
                            Alle Punkte über die abgestimmt wird → Gesellschafter mit ≥10 % Stammkapital dürfen Punkte hinzufügen
                        </p>
                        <ol className="agenda-list">
                            {agenda.map((item, index) => (
                                <li key={index}>
                                    {item}
                                    <button type="button" onClick={() => removeAgendaPoint(index)} style={{ marginLeft: "10px" }}>🗑️</button>
                                </li>
                            ))}
                        </ol>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="text"
                                list="agendaOptions"
                                placeholder="Tagesordnungspunkt"
                                value={newAgendaPoint}
                                onChange={(e) => setNewAgendaPoint(e.target.value)}
                            />
                            <button type="button" className="add-button" onClick={addAgendaPoint}>+</button>
                        </div>
                        <datalist id="agendaOptions">
                            {genericAgendaOptions.map((item, idx) => (
                                <option key={idx} value={item} />
                            ))}
                        </datalist>
                    </div>
                </form>

                {message && <p className="info">{message}</p>}
            </div>
        </div>
    );
};

export default InvitePage;
