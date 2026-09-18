import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { extractYouTubeId } from "./extractYouTubeId";

interface YouTubeEmbedProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubeEmbed({
  videoId,
  isOpen,
  onClose,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract ID if full URL provided
  const id = extractYouTubeId(videoId) || videoId;

  useEffect(() => {
    if (!isOpen) return;

    // Small delay for smooth animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => {
      clearTimeout(timer);
      setIsLoaded(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render YouTube embed in portal at document.body level
  const embedContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[102] flex items-center justify-center p-4 md:p-8 pointer-events-auto"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto" />

          {/* Video container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={clsx(
                "absolute top-4 right-4 z-10 p-2 rounded-md transition-colors",
                "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
                "border border-white/20 hover:border-white/30",
                "text-white",
                "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
              )}
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>

            {/* YouTube iframe - lazy loaded */}
            {isLoaded && (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(embedContent, document.body) : null;
}

