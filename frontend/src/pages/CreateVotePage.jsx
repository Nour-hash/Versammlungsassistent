import React, {useState} from "react";
import Sidebar from "../components/Sidebar";

function CreateVotePage() {
    const [topic, setTopic] = useState("");
    const [message, setMessage] = useState("");
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleCreateVote = async () => {
        const token = localStorage.getItem("jwt");
        try {
            const response = await fetch(`${backendUrl}/api/votes/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({topic}),
            });
            const data = await response.text();
            if (response.ok) {
                setMessage("Vote created successfully!");
                setTopic(""); // Clear the input field
            } else {
                setMessage(data);
            }
        } catch (error) {
            setMessage("Failed to create vote");
        }
    };

    return (
        <div className="page-container">
            <Sidebar activePage="home"/>
            <div>
                <h1>Create a New Vote</h1>
                <input
                    type="text"
                    placeholder="Enter vote topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                <button onClick={handleCreateVote}>Create Vote</button>
                {message && <p>{message}</p>}
            </div>
        </div>

    );
}

export default CreateVotePage;
