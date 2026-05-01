import { useEffect, useRef, useState } from "react";
import "./BrowserApp.css";

const SANDBOX = "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox";
const HINT_DELAY_MS = 4500;

const formatHost = (url) => {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
};

const BrowserApp = ({ url, title }) => {
  const [iterKey, setIterKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hint, setHint] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    setHint(false);
    const t = setTimeout(() => setHint(true), HINT_DELAY_MS);
    return () => clearTimeout(t);
  }, [iterKey, url]);

  const openExternal = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const reload = () => setIterKey((k) => k + 1);

  return (
    <div className="browser-app" role="region" aria-label={title ? `${title} preview` : "Browser preview"}>
      <div className="browser-toolbar">
        <button
          type="button"
          className="browser-pop"
          onClick={openExternal}
          aria-label={`Open ${formatHost(url || "")} in your browser`}
          title="Open in browser"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>Open</span>
        </button>
        <div className="browser-url" aria-live="polite">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="browser-url-text">{formatHost(url || "")}</span>
        </div>
        <button
          type="button"
          className="browser-reload"
          onClick={reload}
          aria-label="Reload"
          title="Reload"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
      <div className="browser-frame">
        {url ? (
          <iframe
            key={iterKey}
            ref={iframeRef}
            src={url}
            title={title || formatHost(url)}
            sandbox={SANDBOX}
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="browser-empty">No URL.</div>
        )}
        {hint && !loaded && (
          <div className="browser-hint" role="note">
            <span>Some sites block embedding.</span>
            <button type="button" onClick={openExternal} className="browser-hint-link">
              Open in browser →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserApp;
