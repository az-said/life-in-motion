import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { clsx } from "clsx";
import LazyImage from "../ui/LazyImage";
import LazyVideo from "../ui/LazyVideo";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import MediaLightbox from "./MediaLightbox";
import type { MediaItem } from "./mediaItems";

interface MediaCarouselProps {
  /** Array of media items to display */
  items: MediaItem[];
  /** Additional className for the container */
  className?: string;
  /** Show navigation arrows on desktop (default: true) */
  showArrows?: boolean;
  /** Auto-play interval in milliseconds (0 = disabled) */
  autoplay?: number;
  /** Starting index (default: 0) */
  initialIndex?: number;
  /** Enable lightbox (default: true) */
  enableLightbox?: boolean;
  /** Full-bleed mode: image fills container without padding/aspect ratio constraints (default: false) */
  isFullBleed?: boolean;
}


/**
 * Professional media carousel with navigation arrows, dots, swipe support, and keyboard controls
 * Uses fixed 16:9 aspect ratio with responsive max-height constraints
 */
export default function MediaCarousel({
  items,
  className,
  showArrows = true,
  autoplay = 0,
  initialIndex = 0,
  enableLightbox = true,
  isFullBleed = false,
}: MediaCarouselProps) {
  // For RoofMate, start with demo video (index 1 if it exists)
  const roofMateDemoIndex = items.findIndex(item => 
    item.type === "video" && 
    (item.src.includes("roofmate.MP4") || item.src.includes("roofmate.mp4")) &&
    item.muted === false
  );
  const startIndex = roofMateDemoIndex >= 0 ? roofMateDemoIndex : initialIndex;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mobileControlsVisible, setMobileControlsVisible] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hoverExpand, setHoverExpand] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  // Reset autoplay timer helper (defined first as it's used by navigation functions)
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    if (autoplay > 0 && items.length > 1 && !prefersReducedMotion) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoplay);
    }
  }, [autoplay, items.length, prefersReducedMotion]);

  // Navigation functions (defined before useEffect that uses them)
  const goToPrevious = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    resetAutoplay();
  }, [items.length, resetAutoplay]);

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
    resetAutoplay();
  }, [items.length, resetAutoplay]);

  const goToIndex = useCallback((index: number) => {
    if (items.length <= 1 || index < 0 || index >= items.length) return;
    setCurrentIndex(index);
    resetAutoplay();
  }, [items.length, resetAutoplay]);

  // Pause autoplay on hover/touch
  const handleMouseEnter = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    resetAutoplay();
  }, [resetAutoplay]);

  // Handle keyboard navigation (now defined after goToPrevious/goToNext)
  useEffect(() => {
    if (items.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
    }
  }, [goToPrevious, goToNext, items.length]);

  // Auto-play functionality
  useEffect(() => {
    if (autoplay > 0 && items.length > 1 && !prefersReducedMotion) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoplay);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [autoplay, items.length, prefersReducedMotion]);

  // Handle mobile tap-to-reveal controls
  const showMobileControls = useCallback(() => {
    setMobileControlsVisible(true);
    
    // Clear existing timeout
    if (mobileControlsTimeoutRef.current) {
      clearTimeout(mobileControlsTimeoutRef.current);
    }
    
    // Hide after 3 seconds
    mobileControlsTimeoutRef.current = setTimeout(() => {
      setMobileControlsVisible(false);
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mobileControlsTimeoutRef.current) {
        clearTimeout(mobileControlsTimeoutRef.current);
      }
    };
  }, []);

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

  // Handle click/tap on media
  const handleMediaClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on a button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    // On mobile: reveal controls
    if (window.innerWidth < 1024) {
      showMobileControls();
    }

    // Open lightbox if enabled
    if (enableLightbox && items.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const currentItem = items[currentIndex];
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle smart image fitting for vertical images
  useEffect(() => {
    if (currentItem?.type !== "image" || !imageContainerRef.current) {
      return;
    }

    const img = imageContainerRef.current.querySelector("img") as HTMLImageElement | null;
    const lazyImageWrapper = imageContainerRef.current.querySelector("div.relative") as HTMLElement | null;
    if (!img || !lazyImageWrapper) return;

    const handleLoad = () => {
      // Wait a bit for natural dimensions to be available
      setTimeout(() => {
        if (!img.naturalHeight || !img.naturalWidth) return;
        
        const isVertical = img.naturalHeight > img.naturalWidth * 1.2; // 20% threshold
        const container = imageContainerRef.current;
        if (!container) return;
        
        if (isVertical) {
          // For vertical images, use contain to show full image
          lazyImageWrapper.style.width = "auto";
          lazyImageWrapper.style.height = "auto";
          lazyImageWrapper.style.maxWidth = "100%";
          lazyImageWrapper.style.maxHeight = "none";
          img.style.objectFit = "contain";
          img.style.objectPosition = "top center";
          img.style.width = "auto";
          img.style.height = "auto";
          img.style.maxWidth = "100%";
          img.style.maxHeight = "none";
          
          // Check if image is taller than container and needs scrolling
          requestAnimationFrame(() => {
            const containerHeight = container.clientHeight;
            const imageHeight = lazyImageWrapper.offsetHeight;
            
            // Enable scrolling if needed
            if (imageHeight > containerHeight) {
              container.style.overflowY = "auto";
              container.style.overflowX = "hidden";
            } else {
              container.style.overflowY = "hidden";
            }
          });
        } else {
          // For horizontal images, use cover to fill container
          lazyImageWrapper.style.width = "100%";
          lazyImageWrapper.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.objectPosition = "center";
          img.style.width = "100%";
          img.style.height = "100%";
          container.style.overflowY = "hidden";
        }
      }, 150);
    };

    // Check if already loaded
    if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad, { once: true });
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [currentItem?.src, currentItem?.type, currentIndex]);

  if (items.length === 0) {
    return (
      <div
        className={clsx(
          "relative",
          isFullBleed ? "w-full h-full" : "w-full aspect-[16/9] max-h-[44vh] sm:max-h-[min(56vh,520px)] rounded-2xl",
          "overflow-hidden",
          "bg-gradient-to-br from-[rgb(var(--bg-1))] to-[rgb(var(--bg-0))]",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-[rgb(var(--fg-1))] opacity-60">No media available</p>
        </div>
      </div>
    );
  }


  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative group",
        // Full-bleed mode: fill container completely, no aspect ratio constraints
        isFullBleed ? (
          "w-full h-full"
        ) : (
          // Fixed aspect ratio container with max-height constraints (default)
          "w-full aspect-[16/9] max-h-[44vh] sm:max-h-[min(56vh,520px)] rounded-2xl"
        ),
        "overflow-hidden",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Media carousel"
      aria-roledescription="carousel"
    >
      {/* Main media area - absolute positioned to fill container */}
      <div 
        className={clsx(
          "absolute inset-0 w-full h-full cursor-pointer",
          isFullBleed && "rounded-none" // Remove radius in full-bleed mode (handled by parent)
        )}
        onClick={handleMediaClick}
        onMouseEnter={() => enableLightbox && setHoverExpand(true)}
        onMouseLeave={() => setHoverExpand(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={
              prefersReducedMotion
                ? {}
                : { duration: 0.18, ease: [0.4, 0, 0.2, 1] }
            }
            className="absolute inset-0 w-full h-full"
          >
            {currentItem.type === "video" ? (
              <LazyVideo
                src={currentItem.src}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay={currentItem.autoplay ?? true}
                loop={currentItem.loop ?? true}
                muted={currentItem.muted !== false} // Default to muted unless explicitly set to false
                playsInline
              />
            ) : (
              <div 
                ref={imageContainerRef} 
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "rgb(var(--bg-1))" }}
              >
                <LazyImage
                  src={currentItem.src}
                  alt={currentItem.alt || `Media ${currentIndex + 1}`}
                  className="w-full h-full"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Expand hint - Desktop hover */}
      {enableLightbox && (
        <motion.div
          initial={false}
          animate={{ opacity: hoverExpand ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            "absolute top-4 right-4 z-10",
            "hidden lg:flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-black/60 backdrop-blur-sm",
            "border border-white/20",
            "text-white pointer-events-none",
            "transition-opacity duration-200"
          )}
          aria-hidden="true"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.div>
      )}

      {/* Expand hint - Mobile button */}
      {enableLightbox && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className={clsx(
            "absolute top-3 right-3 z-10",
            "lg:hidden flex items-center justify-center",
            "w-9 h-9 rounded-full",
            "bg-black/50 backdrop-blur-sm",
            "border border-white/20",
            "text-white transition-all duration-200",
            "opacity-70 hover:opacity-100 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
            "touch-manipulation"
          )}
          aria-label="Expand media"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Navigation arrows */}
      {showArrows && items.length > 1 && (
        <>
          {/* Desktop arrows (hover-to-reveal) */}
          <button
            onClick={goToPrevious}
            className={clsx(
              "absolute left-4 top-1/2 -translate-y-1/2 z-10",
              "hidden lg:flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
              "border border-white/20 hover:border-white/30",
              "text-white transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Previous media"
            aria-controls="carousel-content"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className={clsx(
              "absolute right-4 top-1/2 -translate-y-1/2 z-10",
              "hidden lg:flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
              "border border-white/20 hover:border-white/30",
              "text-white transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Next media"
            aria-controls="carousel-content"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Mobile arrows (always visible, subtle, tap-to-reveal) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className={clsx(
              "absolute left-3 top-1/2 -translate-y-1/2 z-10",
              "lg:hidden flex items-center justify-center",
              "min-w-[44px] min-h-[44px] w-11 h-11 rounded-full",
              "bg-black/30 backdrop-blur-md",
              "border border-white/10",
              "text-white transition-all duration-300",
              mobileControlsVisible ? "opacity-80" : "opacity-40",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
              "active:scale-95",
              "touch-manipulation"
            )}
            aria-label="Previous media"
            aria-controls="carousel-content"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className={clsx(
              "absolute right-3 top-1/2 -translate-y-1/2 z-10",
              "lg:hidden flex items-center justify-center",
              "min-w-[44px] min-h-[44px] w-11 h-11 rounded-full",
              "bg-black/30 backdrop-blur-md",
              "border border-white/10",
              "text-white transition-all duration-300",
              mobileControlsVisible ? "opacity-80" : "opacity-40",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
              "active:scale-95",
              "touch-manipulation"
            )}
            aria-label="Next media"
            aria-controls="carousel-content"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots pagination */}
      {items.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
          role="tablist"
          aria-label="Carousel pagination"
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={clsx(
                "w-2 h-2 rounded-full transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent",
                currentIndex === index
                  ? "w-8 bg-white"
                  : "bg-white/40 hover:bg-white/60"
              )}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Go to slide ${index + 1}`}
              aria-controls="carousel-content"
            />
          ))}
        </div>
      )}

      {/* Media counter (optional, for accessibility) */}
      {items.length > 1 && (
        <div
          className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentIndex + 1} / {items.length}
        </div>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <MediaLightbox
          items={items}
          initialIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}

