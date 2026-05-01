import { useSyncExternalStore, useCallback } from "react";
import * as content from "../../data/content";
import { readOverlay, subscribe } from "../utils/contentOverlay";

export const useStudioContent = (key) => {
  const subscribeFn = useCallback((listener) => subscribe(listener), []);
  const getSnapshot = useCallback(() => {
    const overlay = readOverlay();
    return key in overlay ? overlay[key] : content[key];
  }, [key]);
  return useSyncExternalStore(subscribeFn, getSnapshot, getSnapshot);
};
