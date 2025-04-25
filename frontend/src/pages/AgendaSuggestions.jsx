import React from "react";

const AgendaSuggestions = ({ suggestions, onSelect }) => {
    return (
        <div className="suggestion-list">
            {suggestions.map((text, idx) => (
                <div key={idx} className="suggestion-item" onClick={() => onSelect(text)}>
                    {text.length > 80 ? `${text.slice(0, 80)}...` : text}
                </div>
            ))}
        </div>
    );
};

export default AgendaSuggestions;
