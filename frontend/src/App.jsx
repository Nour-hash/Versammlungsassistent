import React, {useState} from "react";
import {BrowserRouter as Router, Route, Routes, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import './App.css';
import "./styles/Login.css"; // Import a CSS file for styling
import Register from "./pages/Register"; // Import the Register component
import GesellschafterPage from "./pages/GesellschafterPage";
import InvitePage from "./pages/InvitePage"; // Import the InvitePage component
import VotePage from "./pages/VotePage"; // Import the VotePage component
import CreateVotePage from "./pages/CreateVotePage"; // Import the CreateVotePage component
import GeschFtsfHrerPage from "./pages/GeschaeftsfuehrerPage";
import Welcome from "./pages/Welcome"; // Import the VotingSessionPage component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/hello" element={<SelectUserType/>}/>
                <Route path="/register" element={<Register/>}/> {/* Add register route */}
                <Route path="/invite" element={<InvitePage/>}/> {/* Add invite route */}
                <Route path="/votes" element={<VotePage/>}/> {/* Add vote route */}
                <Route path="/create-vote" element={<CreateVotePage/>}/> {/* Add create vote route */}
                <Route path="/home" element={<GeschFtsfHrerPage/>}/>
            </Routes>
        </Router>
    );
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });
            const data = await response.text();
            setLoading(false);

            if (response.ok) {
                const token = data.replace("JWT Token: ", "");
                localStorage.setItem("jwt", token);
                navigate("/hello");
            } else {
                setError(data);
            }
        } catch (error) {
            setLoading(false);
            setError("An error occurred. Please try again.");
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">Login</h1>
            <div className="login-form">
                <input
                    type="email"
                    className="login-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="login-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="login-error">{error}</p>}
            </div>
        </div>
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
