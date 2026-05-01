import { useEffect, useMemo, useState } from "react";
import { desktopBackgrounds, desktopConfig } from "../data/content";
import PDFViewer from "./components/PDFViewer";
import BlogApp from "./components/BlogApp";
import ProjectsApp from "./components/ProjectsApp";
import AboutApp from "./components/AboutApp";
import ContactApp from "./components/ContactApp";
import TrashApp from "./components/TrashApp";
import BrowserApp from "./components/BrowserApp";
import BackgroundCaption from "./components/BackgroundCaption";
import MobileSheet from "./MobileSheet";
import "./MobileSpringboard.css";

const INITIAL_BACKGROUND = "/uploads/backgrounds/IMG_2659.AVIF";

const APP_RENDERERS = {
  cv: PDFViewer,
  blog: BlogApp,
  projects: ProjectsApp,
  about: AboutApp,
  contact: ContactApp,
  trash: TrashApp,
};

const APP_TITLES = {
  cv: "CV",
  blog: "Blog",
  projects: "Projects",
  about: "About",
  contact: "Contact",
  trash: "Trash",
};

const DockGlyph = ({ id }) => {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (id) {
    case "cv":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "blog":
      return (
        <svg {...common}>
          <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" />
          <line x1="8" y1="9" x2="15" y2="9" />
          <line x1="8" y1="13" x2="15" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "projects":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "about":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "contact":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
          <path d="M5.5 6.5l1 13a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.8l1-13" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
      );
  }
};

const StatusBar = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="ms-status-bar" aria-hidden="true">
      <div className="ms-status-time">{time}</div>
      <div className="ms-status-icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="white">
          <rect x="0" y="7" width="3" height="4" rx="0.6" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" />
          <rect x="9" y="3" width="3" height="8" rx="0.6" />
          <rect x="13.5" y="0.5" width="3" height="10.5" rx="0.6" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
          <path d="M7.5 1c2.4 0 4.6.95 6.27 2.5l-1.4 1.45A6.95 6.95 0 0 0 7.5 3a6.95 6.95 0 0 0-4.87 1.95L1.23 3.5A8.97 8.97 0 0 1 7.5 1zM3.6 5.5a5.5 5.5 0 0 1 7.8 0l-1.4 1.45a3.5 3.5 0 0 0-5 0L3.6 5.5zM7.5 7.5c.83 0 1.6.32 2.18.85L7.5 10.5l-2.18-2.15A3.13 3.13 0 0 1 7.5 7.5z" />
        </svg>
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
          <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke="white" strokeOpacity="0.4" />
          <rect x="2" y="2" width="19" height="7" rx="1" fill="white" />
          <rect x="23" y="3.5" width="1.5" height="4" rx="0.6" fill="white" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
};

const MobileSpringboard = () => {
  const [openApp, setOpenApp] = useState(null);
  const [browserOverlay, setBrowserOverlay] = useState(null);
  const background = INITIAL_BACKGROUND;

  useEffect(() => {
    if (!background.startsWith("/")) return undefined;
    const img = new Image();
    img.src = background;
    return undefined;
  }, [background]);

  const apps = useMemo(() => {
    const dock = (desktopConfig?.dock || []).filter(
      (a) => a.id !== "launchpad" && a.id !== "studio" && !a.action
    );
    const desktopIcons = (desktopConfig?.desktopIcons || []).map((i) => ({
      id: i.id,
      name: i.name,
      iconPath: i.iconPath,
      externalUrl: i.externalUrl,
      color: "linear-gradient(135deg, #AF52DE, #8944AB)",
    }));
    const seen = new Set();
    return [...dock, ...desktopIcons].filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, []);

  const handleTap = (app) => {
    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (APP_RENDERERS[app.id]) setOpenApp(app);
  };

  const ActiveApp = openApp ? APP_RENDERERS[openApp.id] : null;
  const activeTitle = openApp ? openApp.name || APP_TITLES[openApp.id] || openApp.id : "";

  const bgList = desktopBackgrounds || [];
  const bgUrl = bgList.includes(background) ? background : background;

  return (
    <div
      className="mobile-springboard"
      style={{
        background: bgUrl.startsWith("/")
          ? `url(${bgUrl}) center center / cover no-repeat`
          : bgUrl,
      }}
    >
      <StatusBar />
      <div className="ms-grid" role="list">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="ms-tile"
            onClick={() => handleTap(app)}
            aria-label={`Open ${app.name}`}
            role="listitem"
          >
            <div
              className="ms-icon"
              style={app.iconPath ? { background: "transparent" } : { background: app.color }}
            >
              {app.iconPath ? (
                <img src={app.iconPath} alt="" draggable={false} />
              ) : (
                <DockGlyph id={app.id} />
              )}
            </div>
            <span className="ms-label">{app.name}</span>
          </button>
        ))}
      </div>
      <div className="ms-home-indicator" aria-hidden="true" />
      <BackgroundCaption background={background} />
      <MobileSheet open={!!openApp} title={activeTitle} onClose={() => setOpenApp(null)}>
        {ActiveApp ? <ActiveApp onOpenBrowser={(p) => setBrowserOverlay(p)} /> : null}
      </MobileSheet>
      <MobileSheet
        open={!!browserOverlay}
        title={browserOverlay?.title || "Browser"}
        onClose={() => setBrowserOverlay(null)}
      >
        {browserOverlay ? (
          <BrowserApp url={browserOverlay.url} title={browserOverlay.title} />
        ) : null}
      </MobileSheet>
    </div>
  );
};

export default MobileSpringboard;
