import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {

    const navigate = useNavigate();

    const handleWeiter = () => {
        navigate("/invite"); // ✅ leitet weiter
    };

    return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">Willkommen auf der Startseite</h1>
        <p className="home-text">
          Sie haben sich erfolgreich angemeldet und Ihre GmbH wurde bestätigt.
        </p>
        <button className="home-button" onClick={handleWeiter}>Einladung erstellen</button>
      </div>
    </div>
  );
}

export default Home;
