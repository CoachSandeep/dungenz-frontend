import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './../../styles/DateNavigationHeader.css';



const DateNavigationHeader = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onJumpToDate,
  onToday,
  selectedVersion,
  onVersionChange,
  versionOptions,
}) => {
  return (
    <div className="date-nav-header">
      <div className="left">
        <button className="nav-arrow" onClick={onPrevMonth}>⬅</button>
        <h2 className="month-label">{currentMonth}</h2>
        <button className="nav-arrow" onClick={onNextMonth}>➡</button>
      </div>

      <div className="right">
        <DatePicker
          selected={null}
          onChange={onJumpToDate}
          placeholderText="📅 Jump to date"
          className="jump-datepicker"
        />
        <button className="today-btn" onClick={onToday}>📍 Today</button>

        <select
          className="version-dropdown"
          value={selectedVersion}
          onChange={(e) => onVersionChange(e.target.value)}
        >
          {versionOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateNavigationHeader;
