import React from "react";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">Willkommen auf der Startseite</h1>
        <p className="home-text">
          Sie haben sich erfolgreich angemeldet und Ihre GmbH wurde bestätigt.
        </p>
        <button className="home-button">Weiter</button>
      </div>
    </div>
  );
}

export default Home;
