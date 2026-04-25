import { useEffect, useRef, useState } from "react";
import "./DesktopIcons.css";

const DEFAULT_DESKTOP_ICONS = [
  {
    id: "studyie",
    name: "Study.ie",
    iconPath: "/uploads/apps/studyie.svg",
    externalUrl: "https://study.ie",
  },
];

const GRID_SIZE = 104;
const ICON_W = 88;
const ICON_H = 90;
const DRAG_THRESHOLD = 4;

const snap = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const defaultPositionFor = (index) => ({
  right: 16 + index * GRID_SIZE,
  y: 40 + index * GRID_SIZE,
});

const clampPosition = (pos, rect) => {
  const right = Math.max(16, Math.min(rect.width - ICON_W - 16, pos.right));
  const y = Math.max(8, Math.min(rect.height - ICON_H - 16, pos.y));
  return { right, y };
};

const DesktopIcons = ({ onOpen, desktopConfig, positions = {}, onPositionChange }) => {
  const icons = desktopConfig?.desktopIcons || DEFAULT_DESKTOP_ICONS;
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const suppressClickRef = useRef(false);

  const handleActivate = (icon) => {
    if (icon.externalUrl) {
      window.open(icon.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    onOpen?.(icon);
  };

  const handlePointerDown = (icon, index) => (e) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const current = positions[icon.id] || defaultPositionFor(index);
    const iconLeft = rect.width - ICON_W - current.right;
    const iconTop = current.y;
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    setDragging({
      id: icon.id,
      offsetX: pointerX - iconLeft,
      offsetY: pointerY - iconTop,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    });
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMove = (e) => {
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const iconLeft = pointerX - dragging.offsetX;
      const iconTop = pointerY - dragging.offsetY;
      const rightOffset = rect.width - ICON_W - iconLeft;
      const pos = clampPosition({ right: rightOffset, y: iconTop }, rect);
      const moved =
        Math.abs(e.clientX - dragging.startX) > DRAG_THRESHOLD ||
        Math.abs(e.clientY - dragging.startY) > DRAG_THRESHOLD;
      if (moved) {
        setDragging((d) => ({ ...d, moved: true, live: pos }));
      }
    };

    const handleUp = () => {
      if (dragging.moved) {
        suppressClickRef.current = true;
        if (dragging.live) {
          const snapped = {
            right: Math.max(16, snap(dragging.live.right - 16) + 16),
            y: Math.max(8, snap(dragging.live.y - 40) + 40),
          };
          onPositionChange?.(dragging.id, snapped);
        }
      }
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.body.style.cursor = "grabbing";
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
    };
  }, [dragging, onPositionChange]);

  if (!icons.length) return null;

  return (
    <div className="desktop-icons-layer" ref={containerRef}>
      {icons.map((icon, index) => {
        const pos =
          dragging?.id === icon.id && dragging.live
            ? dragging.live
            : positions[icon.id] || defaultPositionFor(index);
        const style = {
          right: `${pos.right}px`,
          top: `${pos.y}px`,
        };
        const isDraggingThis = dragging?.id === icon.id && dragging.moved;
        return (
          <button
            key={icon.id}
            type="button"
            className={`desktop-icon ${isDraggingThis ? "dragging" : ""}`}
            style={style}
            onMouseDown={handlePointerDown(icon, index)}
            onClickCapture={(e) => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onClick={(e) => {
              if (dragging?.moved) {
                e.preventDefault();
                return;
              }
              handleActivate(icon);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate(icon);
              }
            }}
            aria-label={`Open ${icon.name}`}
          >
            <div className="desktop-icon-image">
              <img src={icon.iconPath} alt="" draggable={false} />
            </div>
            <span className="desktop-icon-label">{icon.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default DesktopIcons;
