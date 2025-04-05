import React from 'react';
import './App.css';
import Login from './Login'; // Import der Login-Komponente

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Versammlungsassistent</h1>
        <Login /> {/* Login-Komponente wird hier gerendert */}
      </header>
    </div>
  );
}

export default App;
