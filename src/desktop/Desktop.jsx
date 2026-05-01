import { useCallback, useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import DesktopIcons from "./components/DesktopIcons";
import Window from "./components/Window";
import PDFViewer from "./components/PDFViewer";
import BlogApp from "./components/BlogApp";
import ProjectsApp from "./components/ProjectsApp";
import AboutApp from "./components/AboutApp";
import ContactApp from "./components/ContactApp";
import TrashApp from "./components/TrashApp";
import StudioApp from "./components/StudioApp";
import AuthPrompt from "./components/AuthPrompt";
import Launchpad from "./components/Launchpad";
import ContextMenu from "./components/ContextMenu";
import BackgroundCaption from "./components/BackgroundCaption";
import BrowserApp from "./components/BrowserApp";
import { desktopBackgrounds, desktopConfig, siteConfig } from "../data/content";
import { loadState, saveState } from "./utils/persistence";
import "./Desktop.css";

const STUDIO_AUTH_KEY = "portfolio-os:studio.authed:v1";

const DEFAULT_WINDOW_SIZES = {
  cv: { width: 700, height: 500 },
  blog: { width: 760, height: 540 },
  projects: { width: 520, height: 480 },
  about: { width: 480, height: 560 },
  contact: { width: 440, height: 400 },
  trash: { width: 520, height: 380 },
};

const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
];

const INITIAL_BACKGROUND = "/uploads/backgrounds/IMG_2659.AVIF";

const APP_META = {
  cv: { name: "CV" },
  blog: { name: "Blog" },
  projects: { name: "Projects" },
  about: { name: "About" },
  contact: { name: "Contact" },
  trash: { name: "Trash" },
  studio: { name: "Studio" },
};

function Desktop() {
  const persisted = loadState();

  const [openWindows, setOpenWindows] = useState(persisted.openWindows || []);
  const [activeWindowId, setActiveWindowId] = useState(persisted.activeWindowId || null);
  const [iconPositions, setIconPositions] = useState(persisted.iconPositions || {});
  const [backgroundImage, setBackgroundImage] = useState(persisted.backgroundImage || INITIAL_BACKGROUND);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [studioAuthed, setStudioAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STUDIO_AUTH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [pendingStudioLaunch, setPendingStudioLaunch] = useState(null);

  useEffect(() => {
    if (backgroundImage.startsWith("/")) {
      const img = new Image();
      img.onerror = () => {
        setBackgroundImage("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  useEffect(() => {
    saveState({ openWindows, activeWindowId, iconPositions, backgroundImage });
  }, [openWindows, activeWindowId, iconPositions, backgroundImage]);

  const windowSizes = desktopConfig?.windowSizes || DEFAULT_WINDOW_SIZES;

  const pinnedDockIds = (desktopConfig?.dock || []).map((app) => app.id);
  const unpinnedAppRegistry = desktopConfig?.unpinnedApps || {};
  const runningUnpinnedApps = openWindows
    .filter((w) => !pinnedDockIds.includes(w.id))
    .map((w) => {
      const meta = unpinnedAppRegistry[w.id];
      if (meta) {
        return { id: w.id, name: meta.name, color: meta.color, iconPath: meta.iconPath };
      }
      if (w.kind === "browser") {
        return { id: w.id, name: w.title || "Browser", color: "linear-gradient(135deg, #5AC8FA, #007AFF)", icon: "browser" };
      }
      return { id: w.id, name: APP_META[w.id]?.name || w.id, color: "linear-gradient(135deg, #8e8e93, #48484a)" };
    });

  const changeBackground = () => {
    const gradients = desktopConfig?.gradients || DEFAULT_GRADIENTS;
    const backgrounds = [...desktopBackgrounds, ...gradients];
    const currentIndex = backgrounds.indexOf(backgroundImage);
    const nextIndex = (currentIndex + 1) % backgrounds.length;
    setBackgroundImage(backgrounds[nextIndex]);
  };

  const openWindowForApp = useCallback((app) => {
    const existing = openWindows.find((w) => w.id === app.id);
    if (existing) {
      if (existing.minimized) {
        setOpenWindows((list) =>
          list.map((w) => (w.id === app.id ? { ...w, minimized: false } : w))
        );
      }
      setActiveWindowId(app.id);
      return;
    }

    const size = windowSizes[app.id] || { width: 600, height: 400 };
    const offset = openWindows.length * 30;
    const newWindow = {
      id: app.id,
      title: app.name || APP_META[app.id]?.name || app.id,
      position: { x: 120 + offset, y: 60 + offset },
      size,
      maximized: false,
      minimized: false,
    };
    setOpenWindows([...openWindows, newWindow]);
    setActiveWindowId(app.id);
  }, [openWindows, windowSizes]);

  const handleAppClick = (app) => {
    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (app.id === "studio" && !studioAuthed) {
      setPendingStudioLaunch(app);
      setAuthPromptOpen(true);
      return;
    }
    openWindowForApp(app);
  };

  const handleAuthAllow = () => {
    setStudioAuthed(true);
    try {
      window.sessionStorage.setItem(STUDIO_AUTH_KEY, "1");
    } catch {
      // ignore — fallback is in-memory state
    }
    setAuthPromptOpen(false);
    if (pendingStudioLaunch) {
      openWindowForApp(pendingStudioLaunch);
      setPendingStudioLaunch(null);
    }
  };

  const handleAuthCancel = () => {
    setAuthPromptOpen(false);
    setPendingStudioLaunch(null);
  };

  const handleOpenBrowser = useCallback(({ url, title }) => {
    if (!url) return;
    const id = `browser:${url}`;
    setOpenWindows((list) => {
      const existing = list.find((w) => w.id === id);
      if (existing) {
        return list.map((w) => (w.id === id ? { ...w, minimized: false } : w));
      }
      const offset = list.length * 30;
      return [
        ...list,
        {
          id,
          kind: "browser",
          url,
          title: title || url,
          position: { x: 160 + offset, y: 80 + offset },
          size: { width: 900, height: 620 },
          maximized: false,
          minimized: false,
        },
      ];
    });
    setActiveWindowId(id);
  }, []);

  const handleDockClick = (app) => {
    const existing = openWindows.find((w) => w.id === app.id);
    if (existing && !existing.minimized && activeWindowId === app.id) {
      setOpenWindows((list) =>
        list.map((w) => (w.id === app.id ? { ...w, minimized: true } : w))
      );
      setActiveWindowId(null);
      return;
    }
    handleAppClick(app);
  };

  const handleCloseWindow = (windowId) => {
    setOpenWindows(openWindows.filter((w) => w.id !== windowId));
    if (activeWindowId === windowId) setActiveWindowId(null);
  };

  const handleMinimizeWindow = (windowId) => {
    setOpenWindows((list) =>
      list.map((w) => (w.id === windowId ? { ...w, minimized: true } : w))
    );
    if (activeWindowId === windowId) setActiveWindowId(null);
  };

  const handleWindowFocus = (windowId) => setActiveWindowId(windowId);

  const handleGeometryChange = useCallback(
    (windowId) => (geometry) => {
      setOpenWindows((list) =>
        list.map((w) =>
          w.id === windowId
            ? { ...w, position: geometry.position, size: geometry.size, maximized: geometry.maximized }
            : w
        )
      );
    },
    []
  );

  const handleIconPositionChange = useCallback((iconId, pos) => {
    setIconPositions((prev) => ({ ...prev, [iconId]: pos }));
  }, []);

  const handleDesktopContextMenu = (e) => {
    if (e.target.closest(".desktop-icon, .window, .dock, .top-bar, .launchpad-backdrop")) return;
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 180),
      items: [
        { label: "Change Background", onSelect: changeBackground },
        { label: "Open Launchpad", onSelect: () => setLaunchpadOpen(true) },
        { divider: true },
        { label: "Clean Up Icons", onSelect: () => setIconPositions({}) },
        { divider: true },
        { label: "Reset Desktop", onSelect: () => {
          setOpenWindows([]);
          setActiveWindowId(null);
          setIconPositions({});
          setBackgroundImage(INITIAL_BACKGROUND);
        } },
      ],
    });
  };

  const renderWindowContent = (win) => {
    if (win.kind === "browser") {
      return <BrowserApp url={win.url} title={win.title} />;
    }
    switch (win.id) {
      case "cv": return <PDFViewer />;
      case "blog": return <BlogApp />;
      case "projects": return <ProjectsApp onOpenBrowser={handleOpenBrowser} />;
      case "about": return <AboutApp />;
      case "contact": return <ContactApp />;
      case "trash": return <TrashApp />;
      case "studio": return <StudioApp onOpenBrowser={handleOpenBrowser} />;
      default: return null;
    }
  };

  return (
    <div
      className="app"
      style={{
        background: backgroundImage.startsWith("/")
          ? `url(${backgroundImage}) center center / cover no-repeat`
          : backgroundImage,
      }}
      onContextMenu={handleDesktopContextMenu}
    >
      <TopBar
        onBackgroundChange={changeBackground}
        onOpenStudio={() => handleAppClick({ id: "studio", name: "Studio" })}
        desktopConfig={desktopConfig}
      />
      <DesktopIcons
        onOpen={handleAppClick}
        desktopConfig={desktopConfig}
        positions={iconPositions}
        onPositionChange={handleIconPositionChange}
      />
      <div className="desktop">
        {openWindows
          .filter((w) => !w.minimized)
          .map((win) => (
            <Window
              key={win.id}
              title={win.title}
              onClose={() => handleCloseWindow(win.id)}
              onMinimize={() => handleMinimizeWindow(win.id)}
              onFocus={() => handleWindowFocus(win.id)}
              onGeometryChange={handleGeometryChange(win.id)}
              initialPosition={win.position}
              initialSize={win.size}
              initialMaximized={win.maximized}
              isActive={activeWindowId === win.id}
            >
              {renderWindowContent(win)}
            </Window>
          ))}
      </div>
      <Sidebar
        onAppClick={handleDockClick}
        onLaunchpadOpen={() => setLaunchpadOpen(true)}
        openWindowIds={openWindows.map((w) => w.id)}
        minimizedWindowIds={openWindows.filter((w) => w.minimized).map((w) => w.id)}
        desktopConfig={desktopConfig}
        runningApps={runningUnpinnedApps}
      />
      <Launchpad
        open={launchpadOpen}
        onClose={() => setLaunchpadOpen(false)}
        onLaunch={handleAppClick}
        desktopConfig={desktopConfig}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
      <BackgroundCaption background={backgroundImage} />
      <AuthPrompt
        open={authPromptOpen}
        appName="Studio"
        appIconColor="linear-gradient(135deg, #FF2D55, #C9215B)"
        passphrase={siteConfig?.studio?.passphrase || "let-me-in"}
        onAllow={handleAuthAllow}
        onCancel={handleAuthCancel}
      />
    </div>
  );
}

export default Desktop;
