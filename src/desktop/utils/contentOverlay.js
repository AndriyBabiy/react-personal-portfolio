const STORAGE_KEY = "portfolio-os:studio.overlay:v1";
const EVENT_NAME = "studio-content-changed";

export const OVERLAY_KEYS = [
  "profile",
  "projects",
  "blogPosts",
  "skills",
  "siteConfig",
  "desktopConfig",
];

let cachedRaw = null;
let cachedOverlay = Object.freeze({});

export const readOverlay = () => {
  if (typeof window === "undefined") return cachedOverlay;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedOverlay;
    cachedRaw = raw;
    if (!raw) {
      cachedOverlay = Object.freeze({});
      return cachedOverlay;
    }
    const parsed = JSON.parse(raw);
    cachedOverlay = parsed && typeof parsed === "object" ? Object.freeze(parsed) : Object.freeze({});
    return cachedOverlay;
  } catch {
    cachedOverlay = Object.freeze({});
    return cachedOverlay;
  }
};

const writeOverlay = (next) => {
  if (typeof window === "undefined") return;
  try {
    if (!next || Object.keys(next).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // quota exceeded or private mode — silently skip
  }
};

export const setOverlayKey = (key, value) => {
  if (!OVERLAY_KEYS.includes(key)) return;
  const current = readOverlay();
  writeOverlay({ ...current, [key]: value });
};

export const clearOverlayKey = (key) => {
  const current = readOverlay();
  if (!(key in current)) return;
  const next = { ...current };
  delete next[key];
  writeOverlay(next);
};

export const clearOverlay = () => writeOverlay({});

export const subscribe = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) callback();
  });
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
};

export const applyOverlay = (key, base) => {
  const overlay = readOverlay();
  return key in overlay ? overlay[key] : base;
};
