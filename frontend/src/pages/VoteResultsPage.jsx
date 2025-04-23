import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function VoteResultsPage() {
    const [votes, setVotes] = useState([]);
    const [selectedVoteId, setSelectedVoteId] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchVotes = async () => {
            const token = localStorage.getItem("jwt");
            try {
                const response = await fetch(`${backendUrl}/api/votes/company`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setVotes(data);
                } else {
                    setErrorMessage("Fehler beim Laden der Abstimmungen");
                }
            } catch (error) {
                setErrorMessage("Fehler beim Laden der Abstimmungen");
                console.error(error);
            }
        };
        fetchVotes();
    }, []);

    const fetchVoteResults = async (voteId) => {
        const token = localStorage.getItem("jwt");
        try {
            const response = await fetch(`${backendUrl}/api/votes/${voteId}/results`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                const formattedData = Object.keys(data).map((key) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    count: data[key],
                }));
                setResultData(formattedData);
                setSelectedVoteId(voteId);
            } else {
                const text = await response.text();
                setErrorMessage(text);
            }
        } catch (error) {
            setErrorMessage("Fehler beim Laden der Resultate");
            console.error(error);
        }
    };

    return (
        <div className="page-container">
            <Sidebar activePage="results" />
            <div style={{ padding: "1rem" }}>
                <h1>Abstimmungsergebnisse</h1>

                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

                <h2>Abstimmungen:</h2>
                <ul>
                    {votes.map((vote) => (
                        <li key={vote.id}>
                            <button onClick={() => fetchVoteResults(vote.id)}>
                                {vote.topic}
                            </button>
                        </li>
                    ))}
                </ul>

                {resultData && (
                    <div style={{ marginTop: "2rem" }}>
                        <h2>Ergebnisse</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={resultData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VoteResultsPage;
