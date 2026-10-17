import type { ReactNode } from "react";
import { clsx } from "clsx";
import LazyImage from "./ui/LazyImage";
import LazyVideo from "./ui/LazyVideo";
import TopScrim from "./ui/TopScrim";

interface HeroMediaProps {
  /** Image source URL */
  imageSrc?: string;
  /** Video source URL */
  videoSrc?: string;
  /** Alt text for image */
  alt?: string;
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: string;
  /** Max height on desktop (default: clamp(44vh, 520px, 56vh)) */
  maxHeightDesktop?: string;
  /** Additional className for container */
  className?: string;
  /** Content that overlays the media */
  children?: ReactNode;
  /** Whether to show rounded corners (default: true) */
  rounded?: boolean;
}

/**
 * HeroMedia - Reusable hero media component with consistent styling
 * 
 * Features:
 * - Responsive aspect-ratio with object-fit
 * - Top blend overlay (gradient + soft shadow) for header transition
 * - Bottom blend for content overlay
 * - Zero layout shift on resize
 * - Mobile-optimized (100svh-aware)
 */
export default function HeroMedia({
  imageSrc,
  videoSrc,
  alt = "",
  aspectRatio = "16/9",
  maxHeightDesktop = "clamp(44vh, 520px, 56vh)",
  className,
  children,
  rounded = true,
}: HeroMediaProps) {
  if (!imageSrc && !videoSrc) {
    return null;
  }

  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden",
        "hero-media-container",
        rounded && "rounded-2xl",
        className
      )}
      style={{
        aspectRatio,
        maxHeight: `max(${maxHeightDesktop}, 40svh)`, // Mobile: at least 40svh, desktop: use maxHeightDesktop
        minHeight: "clamp(300px, 40svh, 600px)", // Ensure readable size on all devices
      }}
    >
      {/* Media Container */}
      <div className="absolute inset-0 w-full h-full">
        {videoSrc ? (
          <LazyVideo
            src={videoSrc}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : imageSrc ? (
          <LazyImage
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Top Scrim - Subtle header/media blending */}
        <TopScrim />

        {/* Bottom blend, so white caption text stays legible over whatever the
            lower third of the photograph happens to be.

            `--scrim` rather than `--vignette`, and the distinction matters: the
            vignette token frames the *page* and goes almost to nothing on the
            paper ground, where this darkens an *image* and has to stay dark in
            both themes. Lightening it would leave the text sitting on bare
            photography. */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 md:h-40 pointer-events-none z-10"
          style={{
            background: `
              linear-gradient(to top,
                rgb(var(--scrim) / 0.6) 0%,
                rgb(var(--scrim) / 0.4) 30%,
                rgb(var(--scrim) / 0.2) 60%,
                transparent 100%
              )
            `,
          }}
          aria-hidden="true"
        />

        {/* Corner falloff, for depth. Same reasoning as above. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 0%, rgb(var(--scrim) / 0.3) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content Overlay */}
      {children && (
        <div className="relative z-20 w-full h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

