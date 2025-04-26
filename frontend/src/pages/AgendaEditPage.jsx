import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/AgendaEditPage.css";


const AgendaEditPage = () => {
    const { id } = useParams(); // Meeting-ID
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [meeting, setMeeting] = useState(null);
    const [agendaInput, setAgendaInput] = useState("");
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

                // Berechtigungscheck
                const now = new Date();
                const meetingDate = new Date(data.dateTime);
                const diffDays = (meetingDate - now) / (1000 * 60 * 60 * 24);
                const hasPermission = data.userShares >= 10;
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


    if (!meeting) return <p>Meeting wird geladen...</p>;

    return (
        <div className="agenda-editor-wrapper">
            <h2 className="agenda-title">Tagesordnung: {meeting.title}</h2>

            <ul className="agenda-list">
                {meeting.agendaItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>

            {canEdit ? (
                <div className="agenda-input-area">
                    <input
                        type="text"
                        value={agendaInput}
                        onChange={(e) => setAgendaInput(e.target.value)}
                        placeholder="Neuer Punkt..."
                    />
                    <button onClick={handleAddAgendaItem}>Hinzufügen</button>
                </div>
            ) : (
                <p>Du bist entweder nicht berechtigt oder das Meeting ist in weniger als 3 Tagen.</p>
            )}

            {message && <p className="agenda-message">{message}</p>}
        </div>
    );


};

export default AgendaEditPage;
