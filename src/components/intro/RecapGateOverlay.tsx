/**
 * RecapGateOverlay - One-time recap gate overlay with Cursor-style design
 * 
 * Two phases:
 * 1. RECAPPHASE: left-aligned copy + timeline visualization + CTA
 * 2. WELCOMEPHASE: centered logo in white circle + type "Welcome to my world" slowly
 * 
 * After WELCOMEPHASE completes, fades out overlay and reveals Story underneath.
 * 
 * VERIFICATION CHECKLIST:
 * ✅ Overlay unmounts cleanly after completion (AnimatePresence handles exit)
 * ✅ Story remains unchanged (StoryShell renders behind overlay at z-index separation)
 * ✅ Skip sets localStorage immediately before fade-out
 * ✅ Mobile performance ok (minimal animations, proper cleanup)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { clsx } from "clsx";
import RecapTimeline from "./RecapTimeline";
import { devLog } from "../../utils/devLog";

interface RecapGateOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  onMountChange?: (mounted: boolean) => void;
}

type Phase = "RECAP" | "WELCOME";

export default function RecapGateOverlay({ onComplete, onSkip, onMountChange }: RecapGateOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [shouldShow, setShouldShow] = useState(true);
  const [phase, setPhase] = useState<Phase>("RECAP");
  const [welcomeText, setWelcomeText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const WELCOME_TEXT = "Welcome to my world";
  const TYPING_SPEED_MS = 100; // Slow typing speed

  useEffect(() => {
    devLog("[RecapGateOverlay] MOUNTED");
    onMountChange?.(true);
    return () => {
      devLog("[RecapGateOverlay] UNMOUNTED");
      onMountChange?.(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onMountChange]);



  // Handle RECAP phase CTA click - transition to WELCOME phase
  const handleRecapCTA = useCallback(() => {
    setPhase("WELCOME");
  }, []);

  // Blinking cursor animation
  useEffect(() => {
    if (phase !== "WELCOME" || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [phase, prefersReducedMotion]);

  // Typewriter effect for WELCOME phase
  useEffect(() => {
    if (phase !== "WELCOME") {
      return;
    }
  
    if (prefersReducedMotion) {
      setWelcomeText(WELCOME_TEXT);
      setIsTyping(false);
      // Navigate immediately - AnimatePresence will handle exit animation
      onComplete();
      return;
    }
  
    setIsTyping(true);
    charIndexRef.current = 0;
    setWelcomeText("");
  
    const typeNextChar = () => {
      if (charIndexRef.current >= WELCOME_TEXT.length) {
        setIsTyping(false);
        // Navigate immediately after typing completes
        onComplete();
        return;
      }
  
      const char = WELCOME_TEXT[charIndexRef.current];
      setWelcomeText((prev) => prev + char);
      charIndexRef.current++;
  
      timeoutRef.current = setTimeout(typeNextChar, TYPING_SPEED_MS);
    };
  
    timeoutRef.current = setTimeout(typeNextChar, 800);
  
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [phase, prefersReducedMotion, onComplete]);

  const handleSkip = () => {
    // Immediately set localStorage via onSkip (must happen before any fade-out)
    onSkip();
    // Trigger exit animation - AnimatePresence handles fade-out
    setShouldShow(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "Enter" && phase === "RECAP") {
        e.preventDefault();
        handleRecapCTA();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleRecapCTA]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="recap-gate-overlay"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, filter: "blur(8px)" }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.8,
            ease: "easeInOut",
          }}
          className="fixed inset-0 z-[300]"
          style={{
            background: "rgb(8, 8, 10)", // near-black
          }}
        >
          {/* Subtle vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Faint vertical grid lines with subtle parallax */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 1px, transparent 1px, transparent 80px)",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "2% 0%", "0% 0%"],
              }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear",
              }}
              aria-hidden="true"
            />
          )}
          {prefersReducedMotion && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 1px, transparent 1px, transparent 80px)",
              }}
              aria-hidden="true"
            />
          )}

          {/* Optional faint noise overlay */}
          <div className="absolute inset-0 noise-overlay opacity-[0.02]" aria-hidden="true" />

          {/* Top-right: Skip button (minimal, just "esc") */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={handleSkip}
              className={clsx(
                "px-2 py-1 text-xs font-medium transition-opacity duration-200 ease-out",
                "text-[rgb(var(--fg-1))] hover:text-[rgb(var(--fg-0))]",
                "opacity-50 hover:opacity-100",
                "focus:outline-none focus:ring-1 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-transparent rounded"
              )}
              aria-label="Skip intro (ESC)"
            >
              esc
            </button>
          </div>

          {/* RECAP Phase */}
          {phase === "RECAP" && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {/* Top-left text block */}
              <div
                className="absolute top-8 left-8 md:top-12 md:left-14"
                style={{
                  maxWidth: "560px",
                  paddingLeft: "clamp(24px, 3.5vw, 56px)",
                  paddingTop: "clamp(32px, 3vw, 48px)",
                }}
              >
                <div className="space-y-4 text-left">
                  {/* Line 1 */}
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    className="text-[28px] leading-[1.4] font-medium text-[rgb(var(--fg-0))]"
                    style={{ fontSize: "clamp(24px, 2vw, 34px)" }}
                  >
                    Said,
                  </motion.div>
                  {/* Line 2 */}
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="text-[28px] leading-[1.4] font-medium text-[rgb(var(--fg-0))]"
                    style={{ fontSize: "clamp(24px, 2vw, 34px)" }}
                  >
                    Life has been in motion.
                  </motion.div>
                  {/* Line 3 */}
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="text-[18px] leading-[1.6] text-[rgb(var(--fg-1))]"
                    style={{ fontSize: "clamp(16px, 1.25vw, 20px)" }}
                  >
                    Each moment shapes the path forward.
                  </motion.div>
                  {/* Line 4 */}
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    className="text-[18px] leading-[1.6] text-[rgb(var(--fg-1))]"
                    style={{ fontSize: "clamp(16px, 1.25vw, 20px)" }}
                  >
                    Ready to take a look back?
                  </motion.div>
                </div>

                {/* CTA button near text block */}
                <motion.button
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                  onClick={handleRecapCTA}
                  className={clsx(
                    "mt-8 px-6 py-3 rounded text-base font-medium transition-all duration-200 ease-out",
                    "bg-white/10 hover:bg-white/15 active:bg-white/20",
                    "border border-white/20 hover:border-white/30",
                    "text-[rgb(var(--fg-0))]",
                    "hover:-translate-y-0.5 active:translate-y-0",
                    "hover:shadow-[0_4px_12px_rgba(120,220,255,0.2)]",
                    "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
                  )}
                  aria-label="Enter"
                >
                  Enter
                </motion.button>
              </div>

              {/* Timeline visualization - center area */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ paddingTop: "clamp(15vh, 20vh, 25vh)", paddingBottom: "clamp(15vh, 20vh, 25vh)" }}
              >
                <div className="w-full max-w-6xl px-4 md:px-8 pointer-events-auto">
                  <RecapTimeline />
                </div>
              </motion.div>

              {/* Hint text near bottom-left (only in RecapPhase) */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute bottom-6 left-8 md:left-14 text-left z-10"
                style={{
                  paddingLeft: "clamp(24px, 3.5vw, 56px)",
                  marginBottom: "60px", // Space above timeline buttons
                }}
              >
                <div className="text-xs text-[rgb(var(--fg-1))] opacity-60 space-y-1">
                  <div>← → to explore</div>
                  <div>Enter to continue</div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* WELCOME Phase */}
          {phase === "WELCOME" && (
            <motion.div
              key="welcome-phase"
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-8">
                {/* Logo in white circle */}
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={prefersReducedMotion ? undefined : { 
                    opacity: 1, 
                    y: 0,
                  }}
                  transition={prefersReducedMotion ? {} : {
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="flex justify-center"
                >
                  <div 
                    className="rounded-full bg-white flex items-center justify-center"
                    style={{
                      width: "clamp(84px, 6.5vw, 104px)",
                      height: "clamp(84px, 6.5vw, 104px)",
                      padding: "20%",
                    }}
                  >
                    <img
                      src="/favicon.svg"
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </motion.div>

                {/* Typewriter text */}
                <div
                  className="text-center"
                  style={{
                    fontSize: "clamp(20px, 1.625vw, 26px)",
                    letterSpacing: "0.02em",
                    lineHeight: 1.5,
                  }}
                >
                  <span 
                    className="text-[rgb(var(--fg-0))] font-medium"
                    aria-live="polite" 
                    aria-atomic="false"
                  >
                    {welcomeText || "\u00A0"}
                  </span>
                  {isTyping && !prefersReducedMotion && (
                    <span
                      className={clsx(
                        "inline-block w-0.5 h-[1.2em] bg-[rgb(var(--fg-0))] ml-1 align-middle transition-opacity duration-300",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    >
                      {" "}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
}

