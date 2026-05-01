import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import './TopBar.css';

const HomeLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

const EDIT_MENU_ID = "Edit";

const TopBar = ({ onBackgroundChange, onOpenStudio, desktopConfig }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const menuItems = desktopConfig?.topBar?.menuItems || ["File", "Edit", "View", "Help"];

  const renderMenuItem = (item) => {
    if (item === EDIT_MENU_ID) {
      const expanded = openMenu === EDIT_MENU_ID;
      return (
        <div key={item} className="menu-item-wrap" ref={expanded ? menuRef : null}>
          <button
            type="button"
            className={`menu-item menu-item-button ${expanded ? "open" : ""}`}
            onClick={() => setOpenMenu(expanded ? null : EDIT_MENU_ID)}
            aria-haspopup="menu"
            aria-expanded={expanded ? "true" : "false"}
          >
            {item}
          </button>
          {expanded ? (
            <div className="menu-dropdown" role="menu" aria-label="Edit menu">
              <button
                type="button"
                role="menuitem"
                className="menu-dropdown-item"
                onClick={() => {
                  setOpenMenu(null);
                  onOpenStudio?.();
                }}
              >
                <span>Open Studio…</span>
                <span className="menu-dropdown-shortcut">⌘E</span>
              </button>
              <div className="menu-dropdown-divider" />
              <button
                type="button"
                role="menuitem"
                className="menu-dropdown-item disabled"
                disabled
              >
                <span>Undo</span>
                <span className="menu-dropdown-shortcut">⌘Z</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu-dropdown-item disabled"
                disabled
              >
                <span>Redo</span>
                <span className="menu-dropdown-shortcut">⇧⌘Z</span>
              </button>
            </div>
          ) : null}
        </div>
      );
    }
    return (
      <span key={item} className="menu-item">{item}</span>
    );
  };

  useEffect(() => {
    const onShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        onOpenStudio?.();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [onOpenStudio]);

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <Link to="/" className="apple-logo" aria-label="Back to portfolio">
          <HomeLogo />
        </Link>
        <span className="menu-item active">{desktopConfig?.topBar?.title || "Portfolio OS"}</span>
        {menuItems.map(renderMenuItem)}
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
