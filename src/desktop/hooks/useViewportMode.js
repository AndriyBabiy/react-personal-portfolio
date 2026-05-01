import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

const detectMode = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "desktop";
  return window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
};

export const useViewportMode = () => {
  const [mode, setMode] = useState(detectMode);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (event) => setMode(event.matches ? "mobile" : "desktop");
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return mode;
};
