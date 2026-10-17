/**
 * Resets scroll position on route change.
 *
 * The document is what scrolls, so this is `window.scrollTo` rather than a
 * lookup for an inner container. Two routes opt out:
 *
 *   - The story route owns a snap scroller and manages its own position.
 *   - **Any route entered while a modal holds the scroll lock.** The lock
 *     clamps `<html>` and remembers an offset to restore on close; scrolling
 *     underneath it would make that restore land somewhere the reader never
 *     was.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollLockManager } from "../../utils/scrollLockManager";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (scrollLockManager.getState().isLocked) return;
    if (location.pathname === "/story") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}
