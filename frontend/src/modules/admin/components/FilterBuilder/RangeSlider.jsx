import React from 'react';
import './RangeSlider.css';

const RangeSlider = ({ min, max, onChangeMin, onChangeMax, label }) => {
  return (
    <div className="range-slider-config">
      {label && <label className="range-label">{label}</label>}
      <div className="range-inputs">
        <div className="range-field">
          <span>Min</span>
          <input 
            type="number" 
            value={min} 
            onChange={(e) => onChangeMin(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="range-divider">to</div>
        <div className="range-field">
          <span>Max</span>
          <input 
            type="number" 
            value={max} 
            onChange={(e) => onChangeMax(Number(e.target.value))}
            placeholder="5000"
          />
        </div>
      </div>
      <div className="range-visual">
        <div className="range-track">
          <div className="range-progress" style={{ left: '0%', right: '0%' }}></div>
        </div>
        <div className="range-markers">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
