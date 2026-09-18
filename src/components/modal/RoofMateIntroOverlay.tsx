import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";
import { clsx } from "clsx";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { devLog } from "../../utils/devLog";

interface RoofMateIntroOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoofMateIntroOverlay({
  isOpen,
  onClose,
}: RoofMateIntroOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted to try autoplay with sound
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Show overlay when opened (no sessionStorage check - always show!)
  useEffect(() => {
    if (isOpen) {
      devLog('[RoofMate Intro] Opening overlay');
      setIsVisible(true);
      setIsFinished(false);
    }
  }, [isOpen]);

  // Attempt to play video when visible
  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    const video = videoRef.current;
    devLog('[RoofMate Intro] Video element ready, attempting play', {
      src: video.src,
      readyState: video.readyState,
      networkState: video.networkState
    });

    // Small delay to ensure video element is fully mounted
    const timer = setTimeout(() => {
      // Try unmuted first
      video.muted = false;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            devLog('[RoofMate Intro] Video autoplay started successfully (unmuted)');
            setIsMuted(false);
          })
          .catch((error) => {
            console.warn('[RoofMate Intro] Unmuted autoplay blocked, trying muted:', error.message);
            // If autoplay fails, try muted
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => devLog('[RoofMate Intro] Video playing (muted)'))
              .catch(err => {
                console.error('[RoofMate Intro] Muted autoplay also failed:', err.message);
              });
          });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      setIsFinished(false);
      setIsMuted(false);
    }
  }, [isOpen]);

  const handleSkip = () => {
    devLog('[RoofMate Intro] User clicked skip');
    // Stop video if playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsFinished(true);
    // Fade out then close
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleVideoEnded = () => {
    devLog('[RoofMate Intro] Video ended naturally');
    setIsFinished(true);
    // Fade out then close
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      devLog('[RoofMate Intro] Mute toggled:', newMutedState);
    }
  };

  if (!isOpen || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.98)",
          }}
        >
          {/* Dark vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
            }}
          />

          {/* Video container */}
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.95, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? {}
                : isFinished
                  ? { scale: 0.95, opacity: 0 }
                  : { scale: 1, opacity: 1 }
            }
            exit={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-[95vw] flex items-center justify-center"
            style={{
              maxHeight: "90vh",
            }}
          >
            <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "90vh" }}>
              <video
                ref={videoRef}
                src="/teasers/roofmate.mp4"
                className="w-full h-full object-contain bg-black"
                autoPlay
                playsInline
                preload="auto"
                onEnded={handleVideoEnded}
                onLoadStart={() => devLog('[RoofMate Intro] Video load started')}
                onLoadedData={() => devLog('[RoofMate Intro] Video data loaded')}
                onError={(e) => console.error('[RoofMate Intro] Video error:', e)}
                style={{ display: 'block' }}
              >
                <source src="/teasers/roofmate.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className={clsx(
              "absolute bottom-20 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-2 px-5 py-2.5 rounded-full",
              "bg-white/10 hover:bg-white/20 backdrop-blur-md",
              "border border-white/30 hover:border-white/50",
              "text-white text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Sound On</span>
              </>
            )}
          </button>

          {/* Close/Skip button */}
          <button
            onClick={handleSkip}
            className={clsx(
              "absolute top-4 right-4 z-10 p-3 rounded-lg transition-all duration-200",
              "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
              "border border-white/20 hover:border-white/30",
              "text-white",
              "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
            aria-label="Skip intro"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}