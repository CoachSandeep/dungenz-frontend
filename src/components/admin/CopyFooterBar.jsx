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
    <div className="section">
      ✅ {selectedCount} workouts selected
    </div>
  
    <div className="section target-date">
      📅 Target Date:
      <input
        type="date"
        value={targetDate.toISOString().split('T')[0]}
        onChange={(e) => setTargetDate(new Date(e.target.value))}
      />
    </div>
  
    <div className="section">
      🎯 Target Versions:
      <div className="target-versions">
        {["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"].map((version) => (
          <label key={version}>
            <input
              type="checkbox"
              checked={selectedTargetVersions.includes(version)}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectedTargetVersions((prev) =>
                  checked ? [...prev, version] : prev.filter((v) => v !== version)
                );
              }}
            />
            {version}
          </label>
        ))}
      </div>
    </div>
  
    <button className="copy-button" onClick={onCopy}>
      🔁 Copy Selected
    </button>
  </div>
  );
};

export default CopyFooterBar;
