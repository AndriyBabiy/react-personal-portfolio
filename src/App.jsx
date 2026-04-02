import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import DesktopPage from "./pages/DesktopPage";
import EditorPage from "./pages/EditorPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/desktop" element={<DesktopPage />} />
      <Route path="/edit" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
