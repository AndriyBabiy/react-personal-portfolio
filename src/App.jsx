import { useEffect } from "react";
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import DesktopPage from "./pages/DesktopPage";
import { siteConfig } from "./data/content";
import "./App.css";

function App() {
  useEffect(() => {
    if (siteConfig?.seo?.title) {
      document.title = siteConfig.seo.title;
    }
    if (siteConfig?.seo?.description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", siteConfig.seo.description);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/desktop" element={<DesktopPage />} />
    </Routes>
  );
}

export default App;
