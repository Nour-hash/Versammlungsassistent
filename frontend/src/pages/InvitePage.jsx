import React from "react";
import '../styles/InvitePage.css';

const InvitePage = () => {
    return (
        <div className="meeting-wrapper">
            <button className="top-button">Einladung erstellen</button>

            <h1 className="heading">Einladung der Gesellschafter zur Versammlung</h1>

            <form className="form">
                <div className="field">
                    <label>Meetingtitel</label>
                    <input type="text" defaultValue="Generalversammlung Q1 2024" />
                </div>

                {/* Datum */}
                <div className="field">
                    <label>Datum und Uhrzeit</label>
                    <input type="datetime-local"/>
                </div>

                {/* Teilnehmer */}
                <div className="field">
                    <label>Meeting Typ</label>
                    <div className="radio-group">
                        <label><input type="radio" name="type" defaultChecked/> Virtuell</label>
                        <label><input type="radio" name="type"/> Hybrid</label>
                        <label><input type="radio" name="type"/> Präsenz</label>
                    </div>
                    <label>Teilnehmer hinzufügen</label>
                    <input type="text" placeholder="Meetingteilnehmer hinzufügen"/>
                </div>

                {/* Ort */}
                <div className="field">
                    <label>Ort oder Konferenzlink</label>
                    <input type="text" placeholder="Ort oder Konferenzlink" />
                </div>

                {/* Tagesordnung */}
                <div className="field">
                    <label>Tagesordnung</label>
                    <p className="info">
                        Alle Punkte über, über die in der Versammlung abgestimmt wird →
                        Berechtigung von Gesellschaftern mit mindestens 10 % (durch Gesellschaftsvertrag nach unten anpassbar)
                        Stammkapital Punkte zur Hinzufügung
                    </p>
                    <ol className="agenda-list">
                        <li>Eröffnung und Begrüßung</li>
                        <li>Jahresabschluss 2023</li>
                        <li>Entlastung der Geschäftsführung</li>
                    </ol>
                    <button type="button" className="add-button">Neuen Punkt hinzufügen</button>
                </div>
            </form>
        </div>
    );
};

export default InvitePage;
