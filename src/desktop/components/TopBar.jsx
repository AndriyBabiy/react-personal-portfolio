import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './TopBar.css';

const AppleLogo = () => (
  <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor">
    <path d="M13.1 12.32c-.26.6-.57 1.15-.93 1.66-.49.7-.9 1.18-1.2 1.45-.48.44-1 .67-1.55.69-.4 0-.88-.11-1.44-.34-.57-.23-1.09-.34-1.56-.34-.5 0-1.03.11-1.6.34-.58.23-1.04.35-1.4.36-.53.02-1.06-.21-1.58-.71C1.5 15.1 1.17 14.66.78 14.02.36 13.34.03 12.56 0 11.67c0-.6.13-1.12.4-1.56.2-.35.48-.63.82-.84.34-.21.71-.32 1.1-.33.42 0 .98.13 1.66.39.68.26 1.12.39 1.31.39.14 0 .63-.16 1.45-.47.78-.29 1.43-.41 1.97-.36 1.46.12 2.55.7 3.28 1.74-1.3.79-1.95 1.9-1.93 3.32.02 1.11.41 2.03 1.18 2.77.35.33.74.59 1.18.77-.09.27-.19.53-.3.79zM9.97.52c0 .87-.32 1.68-.95 2.44-.76.9-1.68 1.41-2.68 1.33a2.7 2.7 0 01-.02-.33c0-.83.36-1.73 1-2.46.32-.37.73-.68 1.22-.93.49-.24.96-.38 1.4-.4.02.12.03.24.03.35z" />
  </svg>
);

const TopBar = ({ onBackgroundChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <Link to="/" className="apple-logo" aria-label="Back to portfolio">
          <AppleLogo />
        </Link>
        <span className="menu-item active">Portfolio OS</span>
        <span className="menu-item">File</span>
        <span className="menu-item">Edit</span>
        <span className="menu-item">View</span>
        <span className="menu-item">Help</span>
      </div>
      <div className="top-bar-right">
        <button
          className="top-bar-icon-btn"
          onClick={onBackgroundChange}
          aria-label="Change background"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <span className="top-bar-date">{formatDate(currentTime)}</span>
        <span className="top-bar-time">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

export default TopBar;
