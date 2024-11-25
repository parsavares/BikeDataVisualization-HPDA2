// src/components/legend/LegendD3.js
import React from 'react';
import './LegendD3.css'; // Ensure to import the correct CSS file

function LegendD3() {
  return (
    <div className="legend-container">
      <div className="legend-item">
        <span className="legend-color" style={{ backgroundColor: '#4682B4' }}></span>
        <span>Data Points (Unselected)</span>
      </div>
      <div className="legend-item">
        <span className="legend-color" style={{ backgroundColor: '#FF6347' }}></span>
        <span>Brushed Data Points (Selected)</span>
      </div>
    </div>
  );
}

export default LegendD3;
