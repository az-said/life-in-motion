import { useEffect } from "react";
import { scrollLockManager } from "../utils/scrollLockManager";

/**
 * Holds the document scroll lock for as long as `isLocked` is true.
 *
 * Delegates to the ref-counted `scrollLockManager`, so overlapping modals
 * cannot release each other's lock. The cleanup releases on unmount too —
 * a modal that unmounts while open (a route change, an error boundary) would
 * otherwise leave the page clamped with no way to unclamp it.
 *
 * @param isLocked - Whether this caller wants scrolling held.
 */
export function useScrollContainerLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      scrollLockManager.lock();
    } else {
      scrollLockManager.unlock();
    }

    // Cleanup on unmount - always unlock if component unmounts while locked
    return () => {
      if (isLocked) {
        scrollLockManager.unlock();
      }
    };
  }, [isLocked]);
}

