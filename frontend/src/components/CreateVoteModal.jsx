import React, {useState} from "react";

function CreateVoteModal({isOpen, onClose}) {
    const [fileContent, setFileContent] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => setFileContent(event.target.result);
        reader.readAsText(file);
    };

    const parseAgendaPoints = (text) => {
        const lines = text.split("\n");
        const voteBlocks = [];
        let current = null;
        lines.forEach(line => {
            const match = line.match(/^(\d+)\.\s+(.*)/);
            if (match) {
                if (current) voteBlocks.push(current);
                current = {title: match[2], description: ""};
            } else if (current && line.trim()) {
                current.description += line.trim() + " ";
            }
        });
        if (current) voteBlocks.push(current);
        return voteBlocks;
    };

    const handleCreateVotes = async () => {
        if (!startTime || !endTime) {
            setMessage("Bitte Start- und Endzeit angeben");
            return;
        }
        if (new Date(endTime) <= new Date(startTime)) {
            setMessage("Endzeit muss nach Startzeit liegen");
            return;
        }
        const agendaPoints = parseAgendaPoints(fileContent);
        const token = localStorage.getItem("jwt");
        try {
            for (let point of agendaPoints) {
                const vote = {
                    topic: point.title,
                    description: point.description.trim(),
                    startTime,
                    endTime
                };
                const res = await fetch(`${backendUrl}/api/votes/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(vote)
                });
                if (!res.ok) {
                    throw new Error(await res.text());
                }
            }
            setMessage("Alle Abstimmungen erfolgreich erstellt!");
        } catch (err) {
            setMessage(`Fehler: ${err.message}`);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-vote-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>×</button>
                <h2>Abstimmungen erstellen</h2>
                <input type="file" accept=".txt" onChange={handleFileChange}/>
                <br/>
                <label>Startzeit:</label>
                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}/>
                <label>Endzeit:</label>
                <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}/>
                <br/>
                <button onClick={handleCreateVotes}>Erstellen</button>
                {message && <p className="create-vote-message">{message}</p>}
            </div>
        </div>
    );
}

export default CreateVoteModal;
