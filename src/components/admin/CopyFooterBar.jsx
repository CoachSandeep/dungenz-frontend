import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './../../styles/CopyFooterBar.css';

const versionOptions = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const CopyFooterBar = ({
  selectedCount,
  selectedTargetVersions,
  setSelectedTargetVersions,
  onCopy,
  targetDate,
  setTargetDate
}) => {
  const handleVersionToggle = (version) => {
    if (selectedTargetVersions.includes(version)) {
      setSelectedTargetVersions(selectedTargetVersions.filter(v => v !== version));
    } else {
      setSelectedTargetVersions([...selectedTargetVersions, version]);
    }
  };

  return (
    <div className="copy-footer-bar">
      <div className="left">
        <span className="selected-count">✅ {selectedCount} workout{selectedCount > 1 ? 's' : ''} selected</span>
      </div>

      <div className="middle">
        <label className="footer-label">📅 Target Date:</label>
        <DatePicker
          selected={targetDate}
          onChange={setTargetDate}
          dateFormat="yyyy-MM-dd"
          className="date-picker-input"
        />
      </div>

      <div className="middle">
        <label className="footer-label">🎯 Target Versions:</label>
        <div className="version-checkboxes">
          {versionOptions.map((v) => (
            <label key={v} className="version-option">
              <input
                type="checkbox"
                checked={selectedTargetVersions.includes(v)}
                onChange={() => handleVersionToggle(v)}
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="right">
        <button onClick={onCopy} className="copy-button">🔁 Copy Selected</button>
      </div>
    </div>
  );
};

export default CopyFooterBar;
