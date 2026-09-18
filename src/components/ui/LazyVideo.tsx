import { useState, useEffect, useRef, forwardRef } from "react";
import { clsx } from "clsx";

interface LazyVideoProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  onLoad?: () => void;
  onEnded?: () => void;
  preload?: "none" | "metadata" | "auto";
}

const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({
  src,
  className,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  controls = false,
  onLoad,
  onEnded,
  preload = "auto",
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  // Use forwarded ref or internal ref
  const videoRef = (ref as React.MutableRefObject<HTMLVideoElement | null>) || internalVideoRef;

  // Autoplay videos load immediately; the rest wait until they scroll near view.
  const shouldLoad = autoPlay || isInView;

  useEffect(() => {
    if (autoPlay) return;

    // The container is observed rather than the video, because the video only
    // mounts once loading has been triggered.
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [autoPlay]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-[rgb(var(--bg-1))] animate-pulse" />
      )}
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          controls={controls}
          preload={preload}
          onLoadedData={handleLoadedData}
          onEnded={onEnded}
          className={clsx(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
});

LazyVideo.displayName = "LazyVideo";

export default LazyVideo;

