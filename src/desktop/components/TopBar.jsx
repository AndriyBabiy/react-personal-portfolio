import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './TopBar.css';

const HomeLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

const TopBar = ({ onBackgroundChange, desktopConfig }) => {
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
          <HomeLogo />
        </Link>
        <span className="menu-item active">{desktopConfig?.topBar?.title || "Portfolio OS"}</span>
        {(desktopConfig?.topBar?.menuItems || ["File", "Edit", "View", "Help"]).map((item) => (
          <span key={item} className="menu-item">{item}</span>
        ))}
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
