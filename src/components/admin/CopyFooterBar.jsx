import React from 'react';
import './../../styles/CopyFooterBar.css';

const versionOptions = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const CopyFooterBar = ({ selectedCount, selectedTargetVersions, setSelectedTargetVersions, onCopy }) => {
  return (
    <div className="copy-footer-bar">
      <div className="left">
        <span className="selected-count">✅ {selectedCount} workout{selectedCount > 1 ? 's' : ''} selected</span>
      </div>

      <div className="right">
        <select
          multiple
          value={selectedTargetVersions}
          onChange={(e) =>
            setSelectedTargetVersions(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="target-versions-select"
        >
          {versionOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <button onClick={onCopy} className="copy-button">🔁 Copy Selected</button>
      </div>
    </div>
  );
};

export default CopyFooterBar;
