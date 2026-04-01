import { useState, useRef, useEffect } from 'react';
import './Window.css';

const Window = ({
  title,
  children,
  onClose,
  onFocus,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  isActive = false,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [maximized, setMaximized] = useState(false);
  const windowRef = useRef(null);

  const handleMouseDownOnWindow = () => {
    onFocus?.();
  };

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return;
    onFocus?.();
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    onFocus?.();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging && !maximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: Math.max(28, e.clientY - dragOffset.y),
        });
      }
      if (isResizing && !maximized) {
        setSize({
          width: Math.max(300, resizeStart.width + (e.clientX - resizeStart.x)),
          height: Math.max(200, resizeStart.height + (e.clientY - resizeStart.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, maximized]);

  const handleMaximize = () => {
    setMaximized(!maximized);
  };

  const windowStyle = maximized
    ? {
        position: 'fixed',
        top: '28px',
        left: '0',
        width: '100vw',
        height: 'calc(100vh - 28px)',
        zIndex: isActive ? 5000 : 1000,
      }
    : {
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isActive ? 5000 : 1000,
      };

  return (
    <div
      ref={windowRef}
      className={`window ${maximized ? 'maximized' : ''} ${isActive ? 'active' : 'inactive'}`}
      style={windowStyle}
      onMouseDown={handleMouseDownOnWindow}
    >
      <div className="window-header" onMouseDown={handleHeaderMouseDown}>
        <div className="window-controls">
          <button className="window-control close" onClick={onClose} aria-label="Close window" />
          <button className="window-control minimize" aria-label="Minimize window" />
          <button className="window-control maximize" onClick={handleMaximize} aria-label="Maximize window" />
        </div>
        <div className="window-title">{title}</div>
      </div>
      <div className="window-content">
        {children}
      </div>
      {!maximized && (
        <div className="resize-handle" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  );
};

export default Window;
