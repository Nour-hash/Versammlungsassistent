import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/AgendaEditPage.css";

const richAgendaSuggestions = [
    "Beschlussfassung über die Bestellung eines neuen Geschäftsführers - Vorschlag zur Bestellung von [Name, ggf. mit Titel] als Geschäftsführer der Gesellschaft mit Wirkung zum [Datum] gemäß § 15 GmbHG.",
    "Beschlussfassung über die Änderung des Gesellschaftsvertrags betreffend die Dauer der Geschäftsführungsbestellung - Änderung von § [X] des Gesellschaftsvertrags dahingehend, dass die Geschäftsführer künftig auf 5 Jahre bestellt werden.",
    "Genehmigung der Anschaffung von Maschinen/IT-Systemen/Mobiliar in Höhe von insgesamt bis zu EUR 50000,00 im Geschäftsjahr 2025.",
    "Feststellung der Beschlussfähigkeit und Einverständnis zu den Tagesordnungspunkten",
    "Genehmigung des Jahresabschlusses für das Geschäftsjahr 2024 - Vorlage und Erläuterung durch die Geschäftsführung",
    "Beschlussfassung über die Verwendung des Bilanzgewinns - Ausschüttung in Höhe von EUR 20'000 an die Gesellschafter",
    "Entlastung der Geschäftsführung für das Geschäftsjahr 2024",
    "Beschlussfassung über Einführung virtueller Gesellschafterversammlungen - Ergänzung von § 9 des Gesellschaftsvertrags"
];

const AgendaEditPage = () => {
    const { id } = useParams();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [meeting, setMeeting] = useState(null);
    const [agendaInput, setAgendaInput] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [message, setMessage] = useState("");
    const [canEdit, setCanEdit] = useState(false);

    const token = localStorage.getItem("jwt");

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/meetings/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setMeeting(data);

                const now = new Date();
                const meetingDate = new Date(data.dateTime);
                const diffDays = (meetingDate - now) / (1000 * 60 * 60 * 24);
                const hasPermission = data.userStimmen >= 10;
                const editable = diffDays > 3;

                setCanEdit(hasPermission && editable);
            } catch (err) {
                setMessage("Fehler beim Laden des Meetings.");
            }
        };

        fetchMeeting();
    }, [backendUrl, id, token]);

    const handleAddAgendaItem = async () => {
        if (!agendaInput.trim()) {
            setMessage("Bitte gib einen Tagesordnungspunkt ein.");
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/meetings/${id}/agenda`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ agendaItem: agendaInput }),
            });

            if (res.ok) {
                const updated = await res.json();
                setMeeting(updated);
                setAgendaInput("");
                setMessage("Tagesordnungspunkt hinzugefügt.");
            } else {
                setMessage("Fehler beim Speichern.");
            }
        } catch (err) {
            setMessage("Netzwerkfehler.");
        }
    };

    const handleDeleteAgendaItem = async (index) => {
        try {
            const res = await fetch(`${backendUrl}/api/meetings/${id}/agenda/${index}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const updated = await res.json();
                setMeeting(updated);
                setMessage("Tagesordnungspunkt gelöscht.");
            } else {
                const errorText = await res.text();
                setMessage("Fehler beim Löschen: " + errorText);
            }
        } catch (err) {
            setMessage("Netzwerkfehler beim Löschen.");
        }
    };

    const handleInputChange = (e) => {
        const input = e.target.value;
        setAgendaInput(input);

        if (input.length > 0) {
            const filtered = richAgendaSuggestions.filter((s) =>
                s.toLowerCase().includes(input.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    };

    if (!meeting) return <p>Meeting wird geladen...</p>;

    return (
        <div className="agenda-editor-wrapper">
            <h2 className="agenda-title">Tagesordnung: {meeting.title}</h2>

            <ul className="agenda-list">
                {meeting.agendaItems.map((item, idx) => (
                    <li key={idx}>
                        {item}
                        {canEdit && (
                            <button
                                style={{ marginLeft: "10px", cursor: "pointer" }}
                                onClick={() => handleDeleteAgendaItem(idx)}
                            >
                                🗑️
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {canEdit ? (
                <div>
                    <div className="agenda-input-area">
                        <input
                            type="text"
                            value={agendaInput}
                            onChange={handleInputChange}
                            placeholder="Neuer Punkt..."
                        />
                        <button onClick={handleAddAgendaItem}>Hinzufügen</button>
                    </div>

                    {filteredSuggestions.length > 0 && (
                        <div className="suggestions-dropdown">
                            {filteredSuggestions.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    className="suggestion-item"
                                    onClick={() => {
                                        setAgendaInput(suggestion);
                                        setFilteredSuggestions([]);
                                    }}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p>Du bist entweder nicht berechtigt oder das Meeting ist in weniger als 3 Tagen.</p>
            )}

            {message && <p className="agenda-message">{message}</p>}
        </div>
    );
};

export default AgendaEditPage;
