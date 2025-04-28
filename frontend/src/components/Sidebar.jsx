import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/logo.png"
import Datenschutzerklärung from "../assets/Datenschutzerklärung_AssemBLY.pdf";

const Sidebar = ({activePage}) => {
    const navigate = useNavigate();
      const [showImpressum, setShowImpressum] = useState(false);

    const openPrivacyPdf = () => {
        window.open(Datenschutzerklärung, "_blank");
    };

    return (
        <>
            <div className="sidebar">
                <img src={logo} alt="AssemBly Logo" className="sidebar-logo"/>
                <ul className="sidebar-menu">
                    <li
                        className={`sidebar-item ${activePage === "home" ? "active" : ""}`}
                        onClick={() => navigate("/home")}
                    >
                        Startseite
                    </li>
                    <li className="sidebar-item" onClick={() => navigate("/")}>
                        Ausloggen
                    </li>
                    <li className="sidebar-item" onClick={openPrivacyPdf}>
                        Datenschutzerklärung
                    </li>
                    <li className="sidebar-item" onClick={() => setShowImpressum(true)}>
                        Impressum
                    </li>
                </ul>
            </div>

            {showImpressum && (
                <div className="modal-overlay" onClick={() => setShowImpressum(false)}>
                    <div
                        className="modal-content impressum-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="modal-close-button"
                            onClick={() => setShowImpressum(false)}
                        >
                            ×
                        </button>
                        <h2>Impressum</h2>
                        <p>
                            AssemBLY<br/>
                            Musterstraße 1<br/>
                            1010 Wien, Österreich<br/>
                            E-Mail: kontakt@assembly.at<br/>
                            Telefon: +43 xxx xxx xxx
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};


export default Sidebar;
