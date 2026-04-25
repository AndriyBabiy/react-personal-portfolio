import { useEffect, useRef } from "react";
import "./ContextMenu.css";

const ContextMenu = ({ x, y, items, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const style = { left: x, top: y };

  return (
    <div ref={ref} className="context-menu" style={style} role="menu">
      {items.map((item, i) =>
        item.divider ? (
          <div key={`divider-${i}`} className="context-menu-divider" aria-hidden="true" />
        ) : (
          <button
            key={item.label}
            type="button"
            className="context-menu-item"
            onClick={() => {
              item.onSelect?.();
              onClose?.();
            }}
            role="menuitem"
          >
            {item.label}
            {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
};

export default ContextMenu;
