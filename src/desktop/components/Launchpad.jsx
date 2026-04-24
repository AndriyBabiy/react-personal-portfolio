import { useEffect } from "react";
import "./Launchpad.css";

const DEFAULT_APPS = [
  { id: "cv", name: "CV", color: "linear-gradient(135deg, #007AFF, #0051D5)" },
  { id: "video", name: "Video", color: "linear-gradient(135deg, #FF3B30, #D42A20)" },
  { id: "projects", name: "Projects", color: "linear-gradient(135deg, #34C759, #248A3D)" },
  { id: "about", name: "About", color: "linear-gradient(135deg, #5856D6, #3634A3)" },
  { id: "contact", name: "Contact", color: "linear-gradient(135deg, #FF9500, #C77700)" },
  { id: "studyie", name: "Study.ie", color: "linear-gradient(135deg, #AF52DE, #8944AB)", externalUrl: "https://study.ie" },
];

const appGlyphs = {
  cv: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  video: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  projects: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  about: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  contact: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  studyie: (
    <img src="/uploads/apps/studyie.svg" alt="" width="56" height="56" draggable={false} style={{ borderRadius: 14 }} />
  ),
};

const Launchpad = ({ open, onClose, onLaunch, desktopConfig }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const dockApps = (desktopConfig?.dock || DEFAULT_APPS).filter(
    (a) => a.id !== "launchpad" && a.id !== "trash"
  );
  const desktopApps = (desktopConfig?.desktopIcons || []).map((i) => ({
    id: i.id,
    name: i.name,
    externalUrl: i.externalUrl,
    iconPath: i.iconPath,
    color: "linear-gradient(135deg, #AF52DE, #8944AB)",
  }));
  const seen = new Set();
  const apps = [...dockApps, ...desktopApps].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const handleLaunch = (app) => {
    onClose?.();
    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    onLaunch?.(app);
  };

  return (
    <div
      className="launchpad-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="launchpad-grid">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="launchpad-tile"
            onClick={() => handleLaunch(app)}
            aria-label={`Open ${app.name}`}
          >
            <div
              className="launchpad-icon"
              style={app.iconPath ? { background: "transparent" } : { background: app.color }}
            >
              {app.iconPath ? (
                <img src={app.iconPath} alt="" width="88" height="88" draggable={false} style={{ borderRadius: 20, objectFit: "contain" }} />
              ) : (
                appGlyphs[app.id] || appGlyphs.projects
              )}
            </div>
            <span className="launchpad-label">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Launchpad;
