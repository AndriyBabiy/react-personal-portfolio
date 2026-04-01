import { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import Window from "./components/Window";
import PDFViewer from "./components/PDFViewer";
import VideoPlayer from "./components/VideoPlayer";
import ProjectsApp from "./components/ProjectsApp";
import AboutApp from "./components/AboutApp";
import ContactApp from "./components/ContactApp";
import "./Desktop.css";

const WINDOW_SIZES = {
  cv: { width: 700, height: 500 },
  video: { width: 720, height: 460 },
  projects: { width: 520, height: 480 },
  about: { width: 480, height: 560 },
  contact: { width: 440, height: 400 },
};

function Desktop() {
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(
    "/backgrounds/IMG_2659.AVIF"
  );

  useEffect(() => {
    if (backgroundImage.startsWith("/")) {
      const img = new Image();
      img.onerror = () => {
        setBackgroundImage("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  const changeBackground = () => {
    const backgrounds = [
      "/backgrounds/IMG_2659.AVIF",
      "/backgrounds/IMG_2658.AVIF",
      "/backgrounds/default.jpg",
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    ];
    const currentIndex = backgrounds.indexOf(backgroundImage);
    const nextIndex = (currentIndex + 1) % backgrounds.length;
    setBackgroundImage(backgrounds[nextIndex]);
  };

  const handleAppClick = (app) => {
    // Study.ie opens in a new tab — not a window
    if (app.id === "studyie") {
      window.open("https://study.ie", "_blank", "noopener,noreferrer");
      return;
    }

    // If window is already open, bring it to front
    const existingWindow = openWindows.find((w) => w.id === app.id);
    if (existingWindow) {
      setActiveWindowId(app.id);
      return;
    }

    const size = WINDOW_SIZES[app.id] || { width: 600, height: 400 };
    const offset = openWindows.length * 30;
    const newWindow = {
      id: app.id,
      title: app.name,
      app: app,
      position: {
        x: 120 + offset,
        y: 60 + offset,
      },
      size,
    };
    setOpenWindows([...openWindows, newWindow]);
    setActiveWindowId(app.id);
  };

  const handleCloseWindow = (windowId) => {
    setOpenWindows(openWindows.filter((w) => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  };

  const handleWindowFocus = (windowId) => {
    setActiveWindowId(windowId);
  };

  const renderWindowContent = (app) => {
    switch (app.id) {
      case "cv":
        return <PDFViewer />;
      case "video":
        return <VideoPlayer />;
      case "projects":
        return <ProjectsApp />;
      case "about":
        return <AboutApp />;
      case "contact":
        return <ContactApp />;
      default:
        return null;
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
    >
      <TopBar onBackgroundChange={changeBackground} />
      <div className="desktop">
        {openWindows.map((win) => (
          <Window
            key={win.id}
            title={win.title}
            onClose={() => handleCloseWindow(win.id)}
            onFocus={() => handleWindowFocus(win.id)}
            initialPosition={win.position}
            initialSize={win.size}
            isActive={activeWindowId === win.id}
          >
            {renderWindowContent(win.app)}
          </Window>
        ))}
      </div>
      <Sidebar onAppClick={handleAppClick} openWindowIds={openWindows.map(w => w.id)} />
    </div>
  );
}

export default Desktop;
