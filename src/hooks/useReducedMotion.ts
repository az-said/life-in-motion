import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook to detect and respect prefers-reduced-motion.
 *
 * Reads the live value during render, so a reduced-motion visitor never sees a
 * single frame of animation before the preference is applied.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Get motion props that respect reduced motion preferences
 */
export function getReducedMotionProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      transition: { duration: 0 },
      initial: false,
      animate: { opacity: 1 },
    };
  }
  return {};
}

