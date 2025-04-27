import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

function CreateVotePage() {
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
                current = { title: match[2], description: "" };
            } else if (current && line.trim()) {
                current.description += line.trim() + " ";
            }
        });

        if (current) voteBlocks.push(current); // letzer Punkt
        return voteBlocks;
    };

    const handleCreateVotes = async () => {
        if (!startTime || !endTime) {
            setMessage("Please provide start and end time");
            return;
        }

        if (new Date(endTime) <= new Date(startTime)) {
            setMessage("End time must be after start time");
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
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(vote)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText);
                }
            }

            setMessage("All votes created successfully!");
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home" />
            <div>
                <h1>Create Votes from Agenda</h1>
                <input type="file" accept=".txt" onChange={handleFileChange} />
                <br />
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <br />
                <button onClick={handleCreateVotes}>Create Votes</button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default CreateVotePage;
