import { useState, useRef, useEffect } from "react";
import "./Window.css";

const MIN_W = 320;
const MIN_H = 220;

const EDGE_CURSORS = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

const Window = ({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  onGeometryChange,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  initialMaximized = false,
  isActive = false,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [maximized, setMaximized] = useState(initialMaximized);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeEdge, setResizeEdge] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState(null);
  const windowRef = useRef(null);

  useEffect(() => {
    onGeometryChange?.({ position, size, maximized });
  }, [position, size, maximized, onGeometryChange]);

  const handleMouseDownOnWindow = () => {
    onFocus?.();
  };

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest(".window-controls") || e.target.closest(".resize-handle")) return;
    if (maximized) return;
    onFocus?.();
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeMouseDown = (edge) => (e) => {
    e.stopPropagation();
    if (maximized) return;
    onFocus?.();
    setResizeEdge(edge);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      left: position.x,
      top: position.y,
    });
  };

  useEffect(() => {
    if (!isDragging && !resizeEdge) return;

    const handleMouseMove = (e) => {
      if (isDragging && !maximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: Math.max(28, e.clientY - dragOffset.y),
        });
      }
      if (resizeEdge && !maximized && resizeStart) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        let { width, height, left, top } = resizeStart;

        if (resizeEdge.includes("e")) width = Math.max(MIN_W, resizeStart.width + dx);
        if (resizeEdge.includes("s")) height = Math.max(MIN_H, resizeStart.height + dy);
        if (resizeEdge.includes("w")) {
          width = Math.max(MIN_W, resizeStart.width - dx);
          left = resizeStart.left + (resizeStart.width - width);
        }
        if (resizeEdge.includes("n")) {
          const newHeight = Math.max(MIN_H, resizeStart.height - dy);
          const newTop = resizeStart.top + (resizeStart.height - newHeight);
          height = newHeight;
          top = Math.max(28, newTop);
        }

        setSize({ width, height });
        setPosition({ x: left, y: top });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeEdge(null);
      setResizeStart(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = resizeEdge ? EDGE_CURSORS[resizeEdge] : "";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, [isDragging, resizeEdge, dragOffset, resizeStart, maximized]);

  const handleMaximize = () => {
    setMaximized((v) => !v);
  };

  const windowStyle = maximized
    ? {
        position: "fixed",
        top: "28px",
        left: "0",
        width: "100vw",
        height: "calc(100vh - 28px)",
        zIndex: isActive ? 5000 : 1000,
      }
    : {
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isActive ? 5000 : 1000,
      };

  const edges = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <div
      ref={windowRef}
      className={`window ${maximized ? "maximized" : ""} ${isActive ? "active" : "inactive"}`}
      style={windowStyle}
      onMouseDown={handleMouseDownOnWindow}
    >
      <div className="window-header" onMouseDown={handleHeaderMouseDown}>
        <div className="window-controls">
          <button className="window-control close" onClick={onClose} aria-label="Close window" />
          <button
            className="window-control minimize"
            onClick={onMinimize}
            aria-label="Minimize window"
          />
          <button
            className="window-control maximize"
            onClick={handleMaximize}
            aria-label={maximized ? "Restore window" : "Maximize window"}
          />
        </div>
        <div className="window-title">{title}</div>
      </div>
      <div className="window-content">{children}</div>
      {!maximized &&
        edges.map((edge) => (
          <div
            key={edge}
            className={`resize-handle resize-${edge}`}
            onMouseDown={handleResizeMouseDown(edge)}
            aria-hidden="true"
          >
            {(edge === "se" || edge === "sw") && (
              <svg className="resize-grip" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <line x1="2" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="6" y1="12" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="10" y1="12" x2="12" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
    </div>
  );
};

export default Window;
