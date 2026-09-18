import { useMediaQuery } from "./useMediaQuery";

/**
 * Desktop detection for the entry gate.
 *
 * Two conditions, both required:
 *   1. Viewport is at least 1024px wide.
 *   2. The primary pointer is fine (mouse/trackpad), not coarse (finger).
 *
 * The pointer test is what keeps a 1180px iPad in portrait out of the intro —
 * the cinematic gate wants a keyboard (it is driven by Enter) and a cursor.
 */
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
