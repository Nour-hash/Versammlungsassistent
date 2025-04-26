import React, { useEffect, useState } from "react";
import '../styles/InvitePage.css';
import Sidebar from "../components/Sidebar";
import AgendaSuggestions from "../pages/AgendaSuggestions";
import "../styles/AgendaSuggestions.css";

const richAgendaSuggestions = [
    "Beschlussfassung über die Bestellung eines neuen Geschäftsführers – Vorschlag zur Bestellung von [Name, ggf. mit Titel] als Geschäftsführer der Gesellschaft mit Wirkung zum [Datum] gemäß § 15 GmbHG.",
    "Beschlussfassung über die Änderung des Gesellschaftsvertrags betreffend die Dauer der Geschäftsführungsbestellung – Änderung von § [X] des Gesellschaftsvertrags dahingehend, dass die Geschäftsführer künftig auf 5 Jahre bestellt werden.",
    "Genehmigung der Anschaffung von Maschinen/IT-Systemen/Mobiliar in Höhe von insgesamt bis zu EUR 50.000,00 im Geschäftsjahr 2025.",
    "Feststellung der Beschlussfähigkeit und Einverständnis zu den Tagesordnungspunkten",
    "Genehmigung des Jahresabschlusses für das Geschäftsjahr 2024 – Vorlage und Erläuterung durch die Geschäftsführung",
    "Beschlussfassung über die Verwendung des Bilanzgewinns – Ausschüttung in Höhe von EUR 20’000 an die Gesellschafter",
    "Entlastung der Geschäftsführung für das Geschäftsjahr 2024",
    "Beschlussfassung über Einführung virtueller Gesellschafterversammlungen – Ergänzung von § 9 des Gesellschaftsvertrags"
];

const InvitePage = () => {
    const [title, setTitle] = useState("Generalversammlung Q1 2024");
    const [dateTime, setDateTime] = useState("");
    const [type, setType] = useState("Virtuell");
    const [location, setLocation] = useState("");
    const [participants, setParticipants] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [agendaFiles, setAgendaFiles] = useState({});
    const [newAgendaPoint, setNewAgendaPoint] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

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

                if (!res.ok) throw new Error(`Fehler beim Laden: ${res.status}`);

                const data = await res.json();
                setAvailableUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fehler beim Laden der Gesellschafter:", err);
                setAvailableUsers([]);
            }
        };

        fetchUsers();
    }, [backendUrl]);

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
        if (!title || !dateTime || !location || participants.length === 0 || agenda.length === 0) {
            setMessage("Bitte alle Felder ausfüllen und mindestens einen Teilnehmer sowie Tagesordnungspunkt hinzufügen.");
            return;
        }

        const meetingDate = new Date(dateTime);
        const now = new Date();
        const diffDays = (meetingDate - now) / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
            setMessage("Das Meeting muss mindestens 7 Tage im Voraus geplant werden.");
            return;
        }

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
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={errors.title ? "error-input" : ""}
                        />
                    </div>

                    <div className="field">
                        <label>Datum und Uhrzeit</label>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className={errors.dateTime ? "error-input" : ""}
                        />
                    </div>

                    <div className="field">
                        <label>Meeting Typ</label>
                        <div className="radio-group">
                            {["Virtuell", "Hybrid", "Präsenz"].map((t) => (
                                <label key={t}>
                                    <input type="radio" name="type" value={t} checked={type === t}
                                           onChange={() => setType(t)}/>
                                    {t}
                                </label>
                            ))}
                        </div>

                        <label>Teilnehmer hinzufügen</label>
                        <div style={{display: "flex", gap: "10px"}}>
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
                                <li key={idx}>
                                    {p}
                                    <button type="button" onClick={() => {
                                        setParticipants(participants.filter((_, i) => i !== idx));
                                    }} style={{marginLeft: "10px"}}>🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>

                    </div>

                    <div className="field">
                        <label>Ort oder Konferenzlink</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}/>
                    </div>

                    <div className="field">
                        <label>Tagesordnung</label>
                        <p className="info">
                            Alle Punkte über die abgestimmt wird → Gesellschafter mit ≥10 % Stammkapital dürfen Punkte
                            hinzufügen
                        </p>
                        <ol className="agenda-list">
                            {agenda.map((item, index) => (
                                <li key={index}>
                                    {item}
                                    <button type="button" onClick={() => removeAgendaPoint(index)}
                                            style={{marginLeft: "10px"}}>🗑️
                                    </button>

                                    <label style={{marginLeft: "10px", cursor: "pointer"}}>
                                        📎 PDF
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            style={{display: "none"}}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setAgendaFiles(prev => ({...prev, [index]: file}));
                                                }
                                            }}
                                        />
                                    </label>

                                    {agendaFiles[index] && (
                                        <span style={{fontSize: "0.8rem", marginLeft: "5px", color: "#555"}}>
          ({agendaFiles[index].name})
        </span>
                                    )}
                                </li>
                            ))}
                        </ol>


                        <div style={{display: "flex", gap: "10px", marginBottom: "10px"}}>
                            <input
                                type="text"
                                placeholder="Tagesordnungspunkt"
                                value={newAgendaPoint}
                                onChange={(e) => setNewAgendaPoint(e.target.value)}
                            />
                            <button type="button" className="add-button" onClick={addAgendaPoint}>+</button>
                        </div>

                        <AgendaSuggestions
                            suggestions={richAgendaSuggestions}
                            onSelect={(text) => setNewAgendaPoint(text)}
                        />
                    </div>
                </form>

                {message && <p className="info">{message}</p>}
            </div>
        </div>
    );
};

export default InvitePage;
