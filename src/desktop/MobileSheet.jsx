import { useEffect } from "react";
import "./MobileSheet.css";

const MobileSheet = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label={title || "App"}>
      <div className="mobile-sheet-handle" aria-hidden="true" />
      <header className="mobile-sheet-header">
        <button type="button" className="mobile-sheet-done" onClick={onClose}>
          Done
        </button>
        <div className="mobile-sheet-title">{title}</div>
        <span className="mobile-sheet-spacer" aria-hidden="true" />
      </header>
      <div className="mobile-sheet-content">{children}</div>
    </div>
  );
};

export default MobileSheet;
