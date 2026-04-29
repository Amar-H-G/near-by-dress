import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className={`premium-toggle-wrapper ${disabled ? 'disabled' : ''}`}>
      {label && <span className="toggle-label">{label}</span>}
      <label className="premium-toggle">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
