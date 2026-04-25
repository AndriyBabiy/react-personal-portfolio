const STORAGE_KEY = "portfolio-os:state:v1";

const DEFAULT_STATE = {
  openWindows: [],
  activeWindowId: null,
  iconPositions: {},
  backgroundImage: null,
};

export const loadState = () => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
};

let saveTimer = null;
export const saveState = (patch) => {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const current = loadState();
      const next = { ...current, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota exceeded or private mode — silently skip
    }
  }, 150);
};

export const clearState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
};
