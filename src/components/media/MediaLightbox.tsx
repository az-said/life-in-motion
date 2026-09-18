import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import LazyImage from "../ui/LazyImage";
import LazyVideo from "../ui/LazyVideo";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollContainerLock } from "../../hooks/useScrollContainerLock";
import type { MediaItem } from "./mediaItems";

interface MediaLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Fullscreen lightbox for viewing media
 * Supports keyboard navigation (arrows, ESC) and swipe gestures
 */
export default function MediaLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  // Navigation is held as an offset from initialIndex so the visible slide stays
  // derived from props; mirroring initialIndex into state required an effect.
  const [navOffset, setNavOffset] = useState(0);
  const currentIndex =
    items.length > 0
      ? (((initialIndex + navOffset) % items.length) + items.length) % items.length
      : initialIndex;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const minSwipeDistance = 50;

  // Lock scroll when lightbox is open
  useScrollContainerLock(isOpen);

  // Navigation functions (defined before useEffect that uses them)
  const goToPrevious = useCallback(() => {
    if (items.length <= 1) return;
    setNavOffset((prev) => prev - 1);
  }, [items.length]);

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    setNavOffset((prev) => prev + 1);
  }, [items.length]);

  // Drop accumulated navigation on the way out, so the next open starts at
  // whatever initialIndex it is given.
  useEffect(() => {
    if (!isOpen) return;
    return () => setNavOffset(0);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || items.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, onClose, goToPrevious, goToNext]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    if (items.length <= 1) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (items.length <= 1) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (items.length <= 1 || !touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen || !items[currentIndex]) return null;

  const currentItem = items[currentIndex];

  const lightboxContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Lightbox content */}
          <motion.div
            ref={lightboxRef}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 md:p-8 lg:p-12 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label="Media lightbox"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={clsx(
                "absolute top-4 right-4 md:top-6 md:right-6 z-10",
                "flex items-center justify-center",
                "w-10 h-10 md:w-12 md:h-12 rounded-full",
                "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
                "border border-white/20 hover:border-white/30",
                "text-white transition-all duration-200",
                "pointer-events-auto",
                "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
              )}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Navigation arrows (desktop) */}
            {items.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className={clsx(
                    "absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10",
                    "hidden lg:flex items-center justify-center",
                    "w-12 h-12 rounded-full",
                    "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
                    "border border-white/20 hover:border-white/30",
                    "text-white transition-all duration-200",
                    "pointer-events-auto",
                    "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
                  )}
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNext}
                  className={clsx(
                    "absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10",
                    "hidden lg:flex items-center justify-center",
                    "w-12 h-12 rounded-full",
                    "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
                    "border border-white/20 hover:border-white/30",
                    "text-white transition-all duration-200",
                    "pointer-events-auto",
                    "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
                  )}
                  aria-label="Next media"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Media container */}
            <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center pointer-events-auto">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {currentItem.type === "video" ? (
                    <div className="relative w-full h-full max-w-full max-h-full">
                      <LazyVideo
                        src={currentItem.src}
                        className="w-full h-full max-w-full max-h-full object-contain"
                        autoPlay={currentItem.autoplay ?? true}
                        loop={currentItem.loop ?? true}
                        muted
                        playsInline
                        controls
                      />
                    </div>
                  ) : (
                    <LazyImage
                      src={currentItem.src}
                      alt={currentItem.alt || `Media ${currentIndex + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Counter (desktop) */}
            {items.length > 1 && (
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-sm text-white pointer-events-none">
                {currentIndex + 1} / {items.length}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render in portal
  return createPortal(lightboxContent, document.body);
}

