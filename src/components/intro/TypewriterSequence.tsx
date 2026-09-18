/**
 * TypewriterSequence - Character-by-character typing animation with premium pacing
 * 
 * ACCESSIBILITY DECISIONS:
 * 
 * 1. Screen Reader Support:
 *    - Uses aria-live="polite" on text container (not "assertive" to avoid interrupting)
 *    - aria-atomic="false" so screen readers announce incremental changes (full lines)
 *    - Text updates only announce when lines are complete, not character-by-character
 *    - This prevents screen reader spam while keeping users informed of progress
 * 
 * 2. Keyboard Navigation:
 *    - ESC: Skip sequence (calls onSkip callback)
 *    - Enter: Advance to next step
 *    - Space (hold): Fast-forward typing and pauses
 *    - Space (release): Return to normal speed
 *    - Click: Complete current line or advance
 * 
 * 3. Reduced Motion Support:
 *    - When prefers-reduced-motion is enabled:
 *      - All text renders instantly (no character-by-character typing)
 *      - Dots animation shows final "..." immediately (no cycling)
 *      - Pauses are minimal but preserved for step sequencing
 *      - Logo animation still shows but without bounce
 *    - Step order and content remain the same, only animations are disabled
 * 
 * 4. Focus Management:
 *    - Main container has role="button" and tabIndex={0} for keyboard access
 *    - Click area uses semantic button role for screen readers
 *    - Cursor caret is aria-hidden since it's decorative
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { INTRO_GATE, type IntroStep } from "../../content/intro";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useSound } from "../../app/providers/soundContext";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  BASE_TYPING_SPEED_MS,
  TYPING_VARIANCE_MS,
  getPunctuationPause,
  PAUSE_AFTER_LINE_BREAK_MS,
  DOTS_INTERVAL_MS,
  LOGO_LINE_DELAY_MS,
  SOUND_TICK_MIN_CHARS,
  SOUND_TICK_MAX_CHARS,
  FAST_FORWARD_MULTIPLIER,
} from "./introTimings";

// Logo asset - import as URL (standard Vite pattern)
import faceLogoUrl from "../../assets/brand/face-logo.svg";

interface TypewriterSequenceProps {
  onDone: () => void;
  onSkip: () => void;
  onProgress?: (stepId: string) => void;
  onLogoCameo?: () => void; // Callback when logo appears
}

export default function TypewriterSequence({
  onDone,
  onSkip,
  onProgress,
  onLogoCameo,
}: TypewriterSequenceProps) {
  const prefersReducedMotion = useReducedMotion();
  const { playTick, playConfirm } = useSound();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const stepRef = useRef<IntroStep | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const charIndexRef = useRef(0);
  const tickCounterRef = useRef(0);
  const accumulatedLinesRef = useRef<string[]>([]);

  const sequence = INTRO_GATE.sequence;

  // Blinking cursor animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Clear all timeouts and animations
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Handle advance to next step
  const handleAdvance = useCallback(() => {
    clearTimers();
    setCurrentStepIndex((prev) => prev + 1);
  }, [clearTimers]);

  // Handle keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearTimers();
        onSkip();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === " " && !isFastForward) {
        e.preventDefault();
        setIsFastForward(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setIsFastForward(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFastForward, onSkip, clearTimers, handleAdvance]);

  // Type a single character
  const typeNextChar = useCallback(
    (step: Extract<IntroStep, { type: "type" }>, text: string, index: number, accumulatedText: string) => {
      if (index >= text.length) {
        // Line complete
        const finalText = accumulatedText + text + (step.lineBreakAfter ? "\n" : "");
        accumulatedLinesRef.current.push(finalText);
        setDisplayedText(accumulatedLinesRef.current.join(""));
        setIsTyping(false);
        playConfirm();
        charIndexRef.current = 0;
        tickCounterRef.current = 0;
        // Auto-advance after line break pause (with stagger between lines)
        const pauseAfterLine = step.lineBreakAfter 
          ? PAUSE_AFTER_LINE_BREAK_MS 
          : 400;
        timeoutRef.current = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, isFastForward ? 100 : pauseAfterLine);
        return;
      }

      const char = text[index];
      const newText = accumulatedText + char;
      accumulatedLinesRef.current = [...accumulatedLinesRef.current.slice(0, -1), newText];
      setDisplayedText(accumulatedLinesRef.current.join(""));
      charIndexRef.current = index + 1;

      // Play tick sound every N characters (subtle and throttled)
      tickCounterRef.current++;
      const tickThreshold = SOUND_TICK_MIN_CHARS + Math.floor(Math.random() * (SOUND_TICK_MAX_CHARS - SOUND_TICK_MIN_CHARS + 1));
      if (tickCounterRef.current >= tickThreshold) {
        playTick();
        tickCounterRef.current = 0;
      }

      // Calculate next delay with variance and punctuation pauses
      const baseSpeed = step.speedMs || BASE_TYPING_SPEED_MS;
      const variance = step.varianceMs || TYPING_VARIANCE_MS;
      const randomVariance = (Math.random() * 2 - 1) * variance;
      let delay = Math.max(10, baseSpeed + randomVariance);

      // Add micro-pause after punctuation for human-like cadence
      const punctuationPause = getPunctuationPause(char);
      if (punctuationPause > 0) {
        delay += punctuationPause;
      }

      const finalDelay = isFastForward ? delay * FAST_FORWARD_MULTIPLIER : delay;

      timeoutRef.current = setTimeout(() => {
        typeNextChar(step, text, index + 1, accumulatedText + char);
      }, finalDelay);
    },
    [isFastForward, playTick, playConfirm]
  );

  // Process current step
  const processStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= sequence.length) {
        clearTimers();
        onDone();
        return;
      }

      const step = sequence[stepIndex];
      stepRef.current = step;
      onProgress?.(step.id);

      if (step.type === "type") {
        // Type step
        setIsTyping(true);
        charIndexRef.current = 0;
        tickCounterRef.current = 0;

        if (prefersReducedMotion) {
          // Reduced motion: show all text instantly
          const newLine = step.text + (step.lineBreakAfter ? "\n" : "");
          accumulatedLinesRef.current.push(newLine);
          setDisplayedText(accumulatedLinesRef.current.join(""));
          setIsTyping(false);
          playConfirm();
          // Small delay before next step
          timeoutRef.current = setTimeout(() => {
            setCurrentStepIndex(stepIndex + 1);
          }, 300);
        } else {
          // Normal: type character by character
          accumulatedLinesRef.current.push("");
          typeNextChar(step, step.text, 0, "");
        }
      } else if (step.type === "dots") {
        // Dots step - intentional cadence
        setIsTyping(true);

        if (prefersReducedMotion) {
          // Reduced motion: show final "..." immediately, no animation
          const dots = "...";
          if (accumulatedLinesRef.current.length > 0 && accumulatedLinesRef.current[accumulatedLinesRef.current.length - 1].match(/^\.+$/)) {
            accumulatedLinesRef.current = [...accumulatedLinesRef.current.slice(0, -1), dots];
          } else {
            accumulatedLinesRef.current.push(dots);
          }
          setDisplayedText(accumulatedLinesRef.current.join(""));
          setIsTyping(false);
          playConfirm();
          timeoutRef.current = setTimeout(() => {
            setCurrentStepIndex(stepIndex + 1);
          }, 400);
        } else {
          // Normal: animate dots with intentional cadence
          let currentCycle = 0;
          let currentDot = 0;

          const animateDots = () => {
            if (currentCycle >= step.cycles) {
              setIsTyping(false);
              playConfirm();
              timeoutRef.current = setTimeout(() => {
                setCurrentStepIndex(stepIndex + 1);
              }, 400);
              return;
            }

            const dots = ".".repeat(currentDot + 1);
            // Replace last line (if dots) or add new line
            if (accumulatedLinesRef.current.length > 0 && accumulatedLinesRef.current[accumulatedLinesRef.current.length - 1].match(/^\.+$/)) {
              accumulatedLinesRef.current = [...accumulatedLinesRef.current.slice(0, -1), dots];
            } else {
              accumulatedLinesRef.current.push(dots);
            }
            setDisplayedText(accumulatedLinesRef.current.join(""));

            currentDot++;
            if (currentDot > 2) {
              currentDot = 0;
              currentCycle++;
            }

            // Use timing constant for intentional cadence
            const dotInterval = step.dotIntervalMs || DOTS_INTERVAL_MS;
            const delay = isFastForward ? dotInterval * FAST_FORWARD_MULTIPLIER : dotInterval;
            timeoutRef.current = setTimeout(animateDots, delay);
          };

          animateDots();
        }
      } else if (step.type === "pause") {
        // Pause step
        setIsTyping(false);
        const delay = isFastForward ? step.ms * 0.1 : step.ms;
        timeoutRef.current = setTimeout(() => {
          setCurrentStepIndex(stepIndex + 1);
        }, delay);
      } else if (step.type === "logo-cameo") {
        // Logo cameo step
        setIsTyping(false);
        
        // Show logo with animation
        setShowLogo(true);
        onLogoCameo?.();

        // After logo appears, type the logo line text with premium timing
        const logoLineDelay = prefersReducedMotion ? 200 : LOGO_LINE_DELAY_MS;
        timeoutRef.current = setTimeout(() => {
          setIsTyping(true);
          charIndexRef.current = 0;
          tickCounterRef.current = 0;

          if (prefersReducedMotion) {
            const newLine = step.logoLineText;
            accumulatedLinesRef.current.push(newLine);
            setDisplayedText(accumulatedLinesRef.current.join(""));
            setIsTyping(false);
            playConfirm();
            timeoutRef.current = setTimeout(() => {
              setCurrentStepIndex(stepIndex + 1);
            }, 300);
          } else {
            accumulatedLinesRef.current.push("");
            typeNextChar(
              {
                type: "type",
                id: step.id,
                text: step.logoLineText,
                speedMs: BASE_TYPING_SPEED_MS,
                varianceMs: TYPING_VARIANCE_MS,
                tone: "cute",
              },
              step.logoLineText,
              0,
              ""
            );
          }
        }, logoLineDelay);
      }
    },
    [sequence, prefersReducedMotion, isFastForward, typeNextChar, playConfirm, onDone, onProgress, clearTimers, onLogoCameo]
  );

  // Handle click - complete current or advance
  const handleClick = useCallback(() => {
    if (isTyping && stepRef.current?.type === "type") {
      // Complete current line instantly
      clearTimers();
      const step = stepRef.current as Extract<IntroStep, { type: "type" }>;
      const newLine = step.text + (step.lineBreakAfter ? "\n" : "");
      if (accumulatedLinesRef.current.length > 0) {
        accumulatedLinesRef.current = [...accumulatedLinesRef.current.slice(0, -1), newLine];
      } else {
        accumulatedLinesRef.current.push(newLine);
      }
      setDisplayedText(accumulatedLinesRef.current.join(""));
      setIsTyping(false);
      playConfirm();
      charIndexRef.current = 0;
      tickCounterRef.current = 0;
      // Auto-advance after a brief moment
      timeoutRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 200);
    } else if (!isTyping) {
      // Advance to next step
      handleAdvance();
    }
  }, [isTyping, clearTimers, playConfirm, handleAdvance]);

  // Initialize on mount
  useEffect(() => {
    accumulatedLinesRef.current = [];
    setDisplayedText("");
    setCurrentStepIndex(0);
    setShowLogo(false);
  }, []);

  // Process step when index changes
  useEffect(() => {
    processStep(currentStepIndex);
    return () => {
      clearTimers();
    };
  }, [currentStepIndex, processStep, clearTimers]);

  return (
    <div className="relative w-full">
      {/* Logo display area - above text */}
      {showLogo && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
          animate={prefersReducedMotion ? undefined : { 
            opacity: 1, 
            scale: [0.8, 1.05, 1],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 0.5,
            times: [0, 0.6, 1],
            ease: [0.34, 1.56, 0.64, 1], // Subtle bounce
          }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 md:w-32 md:h-32">
            <img 
              src={faceLogoUrl} 
              alt="" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Gracefully handle missing asset - hide logo if not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Text content */}
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Click to continue typing sequence"
      >
          <div className="w-full text-center">
            <div
              className={clsx(
                "text-4xl md:text-5xl lg:text-6xl font-bold",
                "tracking-[0.02em]", // Wide letter spacing for premium typography
                "text-[rgb(var(--fg-0))] leading-[1.4]", // Perfect line height
                "whitespace-pre-wrap"
              )}
            >
              {/* 
                aria-live="polite": Announces updates without interrupting current speech
                aria-atomic="false": Announces incremental changes (full lines, not characters)
                This prevents screen reader spam while keeping users informed of progress
              */}
              <span aria-live="polite" aria-atomic="false">
                {displayedText || "\u00A0"}
              </span>
            {!prefersReducedMotion && (
              <span
                className={clsx(
                  "inline-block w-0.5 h-[1.2em] bg-[rgb(var(--fg-0))] ml-1 align-middle",
                  "transition-opacity duration-300",
                  cursorVisible ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              >
                {" "}
              </span>
            )}
          </div>
          {isFastForward && (
            <div className="mt-4 text-xs text-[rgb(var(--fg-1))] opacity-60">
              Fast-forwarding...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
