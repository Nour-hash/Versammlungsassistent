import React, {useEffect, useState} from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function VoteResultsContent() {
    const [votes, setVotes] = useState([]);
    const [selectedVoteId, setSelectedVoteId] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [voteSummary, setVoteSummary] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);


    useEffect(() => {
        const fetchVotes = async () => {
            const token = localStorage.getItem("jwt");
            try {
                const response = await fetch(`${backendUrl}/api/votes/company`, {
                    headers: {Authorization: `Bearer ${token}`},
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
                headers: {Authorization: `Bearer ${token}`},
            });
            if (response.ok) {
                const data = await response.json();
                // Für das Chart: Stimmen je Antwort
                const chartData = Object.keys(data.stimmen).map((key) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    Stimmen: data.stimmen[key],
                    Kapital: data.kapital[key],
                }));
                setResultData(chartData);
                setVoteSummary(data);
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
        <div className="vote-results-content">
            <h1>Abstimmungsergebnisse</h1>

            {errorMessage && <p style={{color: "red"}}>{errorMessage}</p>}

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

            {isModalVisible && (
                <div
                    className="modal-overlay"
                    onClick={() => setIsModalVisible(false)}
                >
                    <div
                        className="modal-content vote-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="modal-close-button"
                            onClick={() => setIsModalVisible(false)}
                        >
                            ×
                        </button>
                        <h2>Ergebnisse:</h2>
                        <div className="chart-container">
                            {resultData && voteSummary && (
                                <div style={{marginTop: "2rem"}}>
                                    <h2>Ergebnisse</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={resultData}>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Bar dataKey="Stimmen" fill="#8884d8"/>
                                            <Bar dataKey="Kapital" fill="#82ca9d"/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div style={{marginTop: 24, fontSize: 18}}>
                                        <b>Regel:</b> {voteSummary.regelText}<br/>
                                        <b>Kapital anwesend:</b> {voteSummary.kapitalAnwesend}<br/>
                                        <b>Gesamt Stimmen:</b> {voteSummary.gesamtStimmen}<br/>
                                        <b>Beschluss:</b> {voteSummary.angenommen ? "Angenommen ✅" : "Abgelehnt ❌"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VoteResultsContent;
