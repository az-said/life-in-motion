import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface MobileScrollAffordanceProps {
  scrollElRef: React.RefObject<HTMLDivElement | null>;
  activeSceneIndex: number;
}

/**
 * Scroll affordance for the Story page: a bottom fade, a bouncing chevron and
 * a one-time "Swipe up" label.
 *
 * - Shown at every width, not just mobile.
 * - Reads the story's own scroll container, not the window.
 */
export default function MobileScrollAffordance({
  scrollElRef,
  activeSceneIndex,
}: MobileScrollAffordanceProps) {
  const [hasMoreContentBelow, setHasMoreContentBelow] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Derived, not stored. This was state written from an effect, which meant an
  // extra render the moment the reader reached scene 1.
  const showSwipeUpLabel = activeSceneIndex < 1;

  // Listen to scroll container to determine if at bottom
  useEffect(() => {
    const scrollEl = scrollElRef.current;
    if (!scrollEl) return;

    const checkScrollPosition = () => {
      // Calculate if we're near the bottom (within 40px threshold)
      const scrollTop = scrollEl.scrollTop;
      const clientHeight = scrollEl.clientHeight;
      const scrollHeight = scrollEl.scrollHeight;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 40;

      setHasMoreContentBelow(!atBottom);
    };

    // Check initial position
    checkScrollPosition();

    // Listen to scroll events on the actual story scroll container
    scrollEl.addEventListener("scroll", checkScrollPosition, { passive: true });
    scrollEl.addEventListener("resize", checkScrollPosition, { passive: true });

    return () => {
      scrollEl.removeEventListener("scroll", checkScrollPosition);
      scrollEl.removeEventListener("resize", checkScrollPosition);
    };
  }, [scrollElRef]);

  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-[9999]">
      {/* Persistent bottom fade gradient - visible when hasMoreContentBelow */}
      {/* Gradient extends upward from bottom, accounting for safe area */}
      {hasMoreContentBelow && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '120px',
            background: `
              linear-gradient(to top,
                rgba(0, 0, 0, 0.55) 0%,
                rgba(0, 0, 0, 0.2) 40%,
                rgba(0, 0, 0, 0.1) 70%,
                transparent 100%
              )
            `,
            // Extend gradient into safe area so it fills bottom completely
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Chevron indicator - always visible when hasMoreContentBelow */}
      {/* Positioned above safe area so it's visible */}
      {hasMoreContentBelow && (
        <motion.div
          initial={false}
          animate={prefersReducedMotion ? {} : {
            y: [0, -8, 0],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
          }}
          aria-hidden="true"
        >
          <ChevronDown 
            className="w-5 h-5 text-[rgb(var(--fg-0))] opacity-80"
            strokeWidth={2.5}
          />
        </motion.div>
      )}

      {/* "Swipe up" text label - shows until next scene reached */}
      {/* Positioned above safe area so it's visible */}
      {showSwipeUpLabel && hasMoreContentBelow && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4 }}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 42px)',
          }}
          aria-hidden="true"
        >
          <span className="text-xs text-[rgb(var(--fg-1))] opacity-90 font-medium tracking-wide">
            Swipe up
          </span>
        </motion.div>
      )}
    </div>
  );
}

