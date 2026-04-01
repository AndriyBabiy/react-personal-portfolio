import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import DesktopPage from "./pages/DesktopPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/desktop" element={<DesktopPage />} />
    </Routes>
  );
}

export default App;
