import React, {useState} from "react";
import {BrowserRouter as Router, Route, Routes, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import './App.css';
import GesellschafterPage from "./pages/GesellschafterPage";
import InvitePage from "./pages/InvitePage"; // Import the InvitePage component
import VotePage from "./pages/VotePage"; // Import the VotePage component
import CreateVotePage from "./pages/CreateVotePage"; // Import the CreateVotePage component
import GeschFtsfHrerPage from "./pages/GeschaeftsfuehrerPage";
import LoginPage from "./pages/LoginPage"; // Import the VotingSessionPage component
import AgendaEditPage from "./pages/AgendaEditPage";
import SendResultsPage from "./pages/SendResultsPage";
import VoteResultsContent from "./components/VoteResultsContent"; // Import the VoteResultsContent component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/home" element={<SelectUserType/>}/>
                <Route path="/invite" element={<InvitePage/>}/> {/* Add invite route */}
                <Route path="/votes" element={<VotePage/>}/> {/* Add vote route */}
                <Route path="/create-vote" element={<CreateVotePage/>}/> {/* Add create vote route */}
                <Route path="/vote-results" element={<VoteResultsContent/>}/> {/* Add vote results route */}
                <Route path="/home" element={<GeschFtsfHrerPage/>}/>
                <Route path="/meetings/:id/agenda" element={<AgendaEditPage/>} />
                <Route path="/meetings/:id/results" element={<SendResultsPage />} />
            </Routes>
        </Router>
    );
}

function SelectUserType() {
    const token = localStorage.getItem("jwt");
    if (!token) {
        return <div>Access denied: No token provided</div>;
    }

    try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        const role = parseInt(decodedToken.role, 10);

        if (role === 2) { // Geschäftsführer
            return <GeschFtsfHrerPage/>;
        } else if (role === 1) { // Gesellschafter
            return <GesellschafterPage/>;
        } else {
            return <div>Access denied: Invalid role</div>;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        return <div>Access denied: Invalid token</div>;
    }
}

export default App;
