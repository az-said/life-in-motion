/**
 * RidahSequence - Professional cinematic intro
 * 
 * Design Philosophy (based on Apple/Stripe):
 * - Text stays in ONE fixed position (no shifting up)
 * - Smooth opacity fades between lines (no abrupt changes)
 * - Breathing balloon at start, smooth expand animation
 * - Acts separated by clear pauses + user prompt
 * - All animations under 500ms for responsiveness
 * - Single focal point for user's eyes
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { RIDAH_INTRO_SEQUENCE, type RidahStep } from "../../content/ridahIntro";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import signature from "../../../public/images/signature/signature.png";

interface RidahSequenceProps {
  onComplete: () => void;
}

const GLOBAL_SPEED_MS = 34;
const GLOBAL_VARIANCE_MS = 18;
const KEYBOARD_SOUND_STORAGE_KEY = "ridahKeyboardSound";

type CompletedLine = { id: string; text: string; isNewlyCompleted?: boolean };

function getPunctuationPause(char: string, typedSoFar: string): number {
  if (char === "…") return 900;
  if (char === "." && typedSoFar.length >= 2 && typedSoFar.slice(-2) === "..") return 900;
  switch (char) {
    case ",":
      return 160;
    case ".":
      return 320;
    case "?":
      return 520;
    case "!":
      return 520;
    default:
      return 0;
  }
}

export default function RidahSequence({ onComplete }: RidahSequenceProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Phase management
  const [phase, setPhase] = useState<"breathe" | "typing" | "complete">("breathe");
  const [hasStarted, setHasStarted] = useState(false);
  
  // Reveal stage for breathe phase (0 = blank, 1 = photo, 2 = balloon, 3 = quote, 4 = hint text)
  const [revealStage, setRevealStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  
  // Pointer activity for controls visibility
  const [pointerActive, setPointerActive] = useState(false);
  const pointerActivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Typing state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAct, setCurrentAct] = useState<number | null>(null);
  const [currentLine, setCurrentLine] = useState("");
  const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  
  // Balloon state
  const [showBalloon, setShowBalloon] = useState(false);
  const [isIrisEntering, setIsIrisEntering] = useState(false);

  // Control dock state
  const [controlDockVisible, setControlDockVisible] = useState(false);
  const [controlDockOpacity, setControlDockOpacity] = useState(0.65);
  const [controlDockHovered, setControlDockHovered] = useState(false);
  const controlDockFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUIBlipTimeRef = useRef(0);

  // Portrait background state (wide screens only)
  const [isWideEnough, setIsWideEnough] = useState(false);

  // Sound state - default ON (UI), but only plays after first user action
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const lastTickTimeRef = useRef(0);
  const audioBuffersRef = useRef<{ [key: string]: AudioBuffer }>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentStepRef = useRef<RidahStep | null>(null);

  // Stable IDs for completed lines (prevents remount/layout jitter)
  const nextLineIdRef = useRef(0);

  /**
   * The single exit from this component.
   *
   * Two things can fire the handoff — the iris animation reporting completion,
   * and the timer below as a floor — so it has to be idempotent. Without the
   * latch a double call would re-enter the parent's transition and restart the
   * navigation timeout.
   */
  const handedOffRef = useRef(false);
  const handOff = useCallback(() => {
    if (handedOffRef.current) return;
    handedOffRef.current = true;
    onComplete();
  }, [onComplete]);

  /** Owned by the iris effect alone; clearTimers() must not be able to cancel it. */
  const irisHandoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== "undefined" && (window as any).AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Load audio buffers
  useEffect(() => {
    if (!soundEnabled) return;

    const loadAudio = async (filename: string) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const response = await fetch(`/audio/${filename}`);
        if (!response.ok) return;

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffersRef.current[filename] = audioBuffer;
      } catch {
        // silently fail
      }
    };

    loadAudio("tick_1.wav");
    loadAudio("tick_2.wav");
    loadAudio("enter.wav"); // Optional, for deeper UI sounds
  }, [soundEnabled, getAudioContext]);

  // Stop all active sounds
  const stopAllSounds = useCallback(() => {
    activeAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });
    activeAudioSourcesRef.current = [];
  }, []);

  // Play keyboard tick sound (typing only)
  const playTick = useCallback(
    (isPunctuation: boolean = false) => {
      if (!soundEnabled || !hasUserInteracted || prefersReducedMotion) return;

      const now = Date.now();
      const cooldown = 35 + Math.random() * 15;
      if (now - lastTickTimeRef.current < cooldown) return;

      // probability
      if (Math.random() > 0.65) return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
          return;
        }

        const availableTicks = ["tick_1.wav", "tick_2.wav"].filter((f) => audioBuffersRef.current[f]);
        if (availableTicks.length === 0) return;

        const chosenFile = availableTicks[Math.floor(Math.random() * availableTicks.length)];
        const buffer = audioBuffersRef.current[chosenFile];
        if (!buffer) return;

        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.playbackRate.value = 0.97 + Math.random() * 0.06;

        const baseVolume = isPunctuation ? 0.6 : 0.4;
        const volumeVariation = baseVolume * (0.85 + Math.random() * 0.3);
        gainNode.gain.value = Math.max(0.1, Math.min(1.0, volumeVariation));

        source.start(ctx.currentTime);

        activeAudioSourcesRef.current.push(source);
        source.onended = () => {
          activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter((s) => s !== source);
        };

        lastTickTimeRef.current = now;
      } catch {
        // silently fail
      }
    },
    [soundEnabled, hasUserInteracted, prefersReducedMotion, getAudioContext]
  );

  // Play UI blip sound (for all user input)
  const playUIBlip = useCallback(
    (isDeeper: boolean = false) => {
      if (!soundEnabled || !hasUserInteracted || prefersReducedMotion) return;

      const now = Date.now();
      const cooldown = 60 + Math.random() * 30; // 60-90ms cooldown
      if (now - lastUIBlipTimeRef.current < cooldown) return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
          return;
        }

        // Try to use enter.wav for deeper sounds, otherwise use tick
        const preferredFile = isDeeper ? "enter.wav" : null;
        const availableFiles = preferredFile && audioBuffersRef.current[preferredFile]
          ? [preferredFile]
          : ["tick_1.wav", "tick_2.wav"].filter((f) => audioBuffersRef.current[f]);
        
        if (availableFiles.length === 0) return;

        const chosenFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
        const buffer = audioBuffersRef.current[chosenFile];
        if (!buffer) return;

        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Slightly deeper pitch for UI blips
        source.playbackRate.value = isDeeper ? 0.92 + Math.random() * 0.04 : 0.95 + Math.random() * 0.06;
        gainNode.gain.value = 0.35 + Math.random() * 0.15; // Subtle volume

        source.start(ctx.currentTime);

        activeAudioSourcesRef.current.push(source);
        source.onended = () => {
          activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter((s) => s !== source);
        };

        lastUIBlipTimeRef.current = now;
      } catch {
        // silently fail
      }
    },
    [soundEnabled, hasUserInteracted, prefersReducedMotion, getAudioContext]
  );

  // Load sound preference (default ON)
  useEffect(() => {
    const saved = localStorage.getItem(KEYBOARD_SOUND_STORAGE_KEY);
    const shouldEnable = saved === null || saved === "1";
    setSoundEnabled(shouldEnable);
  }, []);

  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem(KEYBOARD_SOUND_STORAGE_KEY, newValue ? "1" : "0");
    if (!newValue) {
      stopAllSounds();
    } else {
      // Play blip when turning sound on
      playUIBlip(false);
    }
  }, [soundEnabled, stopAllSounds, playUIBlip]);

  // Helper to advance step (supports pause so roll-up has time to feel calm)
  const advanceStep = useCallback(
    (commitText?: string, clearCompleted = false, pauseDuration?: number) => {
    clearTimers();

    if (commitText) {
        const id = `line-${nextLineIdRef.current++}`;
        // Add line as newly completed so it stays white during transition
        setCompletedLines((prev) => {
          const updated = [...prev, { id, text: commitText, isNewlyCompleted: true }];
          return updated.slice(-3);
        });
        
        // After delay, mark as no longer newly completed so it can fade to grey
        setTimeout(() => {
          setCompletedLines((prev) => 
            prev.map(line => 
              line.id === id ? { ...line, isNewlyCompleted: false } : line
            )
          );
        }, prefersReducedMotion ? 600 : 1200);
    }

    if (clearCompleted) {
      setCompletedLines([]);
    }

    setCurrentLine("");
    setIsTyping(false);
    setWaitingForUser(false);

      const waitTime = pauseDuration || 0;
    timeoutRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, waitTime);
    },
    [clearTimers, prefersReducedMotion]
  );

  // Check if viewport is wide enough for portrait (min-width: 1100px and min-aspect-ratio: 4/3)
  useEffect(() => {
    const checkWideEnough = () => {
      const mediaQuery = window.matchMedia("(min-width: 1100px) and (min-aspect-ratio: 4/3)");
      setIsWideEnough(mediaQuery.matches);
    };

    checkWideEnough();
    const mediaQuery = window.matchMedia("(min-width: 1100px) and (min-aspect-ratio: 4/3)");
    mediaQuery.addEventListener("change", checkWideEnough);

    return () => {
      mediaQuery.removeEventListener("change", checkWideEnough);
    };
  }, []);

  // Reveal stage management for breathe phase
  useEffect(() => {
    if (phase !== "breathe" || hasStarted) {
      // Reset reveal stage when leaving breathe phase
      if (phase !== "breathe") {
        setRevealStage(0);
      }
      return;
    }

    // Skip stages for reduced motion
    if (prefersReducedMotion) {
      setRevealStage(4);
      setShowBalloon(true);
      return;
    }

    // Stage 0: blank paper (already set)
    setRevealStage(0);
    
    // Stage 1: show photo (200ms)
    const t1 = setTimeout(() => setRevealStage(1), 200);
    
    // Stage 2: show balloon + hint (900ms)
    const t2 = setTimeout(() => {
      setRevealStage(2);
      setShowBalloon(true);
    }, 900);
    
    // Stage 3: show quote lines (2000ms)
    const t3 = setTimeout(() => setRevealStage(3), 2000);
    
    // Stage 4: show hint text after all quotes finish
    // Quotes start at 2000ms, last quote (index 5) appears at 2000 + (5 * 700) = 5500ms
    // Plus fade duration of 400ms = 5900ms total, so show hint at 6000ms
    const t4 = setTimeout(() => setRevealStage(4), 6000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [phase, hasStarted, prefersReducedMotion]);

  // Pointer activity tracking for controls visibility
  useEffect(() => {
    const handlePointerActivity = () => {
      setPointerActive(true);
      
      // Clear existing timeout
      if (pointerActivityTimeoutRef.current) {
        clearTimeout(pointerActivityTimeoutRef.current);
      }
      
      // Reset after 1200ms of inactivity
      pointerActivityTimeoutRef.current = setTimeout(() => {
        setPointerActive(false);
      }, 1200);
    };

    window.addEventListener("mousemove", handlePointerActivity);
    window.addEventListener("touchstart", handlePointerActivity);
    
    return () => {
      window.removeEventListener("mousemove", handlePointerActivity);
      window.removeEventListener("touchstart", handlePointerActivity);
      if (pointerActivityTimeoutRef.current) {
        clearTimeout(pointerActivityTimeoutRef.current);
      }
    };
  }, []);


  // Control dock: show on pointer activity OR after reveal stage 2
  useEffect(() => {
    const controlsVisible = pointerActive || revealStage >= 2;
    
    if (controlsVisible) {
      setControlDockVisible(true);
      setControlDockOpacity(0.65);
      
      // Reset inactivity timer
      if (controlDockFadeTimeoutRef.current) {
        clearTimeout(controlDockFadeTimeoutRef.current);
      }
      
      // Only auto-hide if not in breathe phase or if pointer is inactive
      if (phase !== "breathe" || !pointerActive) {
        const inactivityDelay = 1200 + Math.random() * 400;
        controlDockFadeTimeoutRef.current = setTimeout(() => {
          if (!controlDockHovered && !pointerActive) {
            setControlDockOpacity(0.08);
            setTimeout(() => {
              if (!controlDockHovered && !pointerActive) {
                setControlDockVisible(false);
              }
            }, 300);
          }
        }, inactivityDelay);
      }
    } else {
      // Hide controls if not visible
      setControlDockVisible(false);
      setControlDockOpacity(0);
    }
  }, [pointerActive, revealStage, phase, controlDockHovered]);

  // Keep dock visible when hovered/focused
  useEffect(() => {
    if (controlDockHovered) {
      setControlDockVisible(true);
      setControlDockOpacity(0.65);
      if (controlDockFadeTimeoutRef.current) {
        clearTimeout(controlDockFadeTimeoutRef.current);
        controlDockFadeTimeoutRef.current = null;
      }
    }
  }, [controlDockHovered]);

  // Type character by character
  const typeText = useCallback(
    (step: RidahStep, text: string, index: number) => {
      if (step.type !== "type") return;
      
      if (index >= text.length) {
        setCurrentLine(text);
        setIsTyping(false);
        
        // Keep line white for a moment before advancing
        const whiteHoldDuration = prefersReducedMotion ? 600 : 1000;
        
        if (step.actEnd) {
          const pauseDuration = prefersReducedMotion ? 800 : 1200;
          timeoutRef.current = setTimeout(() => setWaitingForUser(true), pauseDuration);
        } else {
          const pauseDuration = Math.max(900, step.pauseAfterMs || 1200);
          // Add white hold duration before advancing
          timeoutRef.current = setTimeout(() => {
            advanceStep(text, false, pauseDuration);
          }, whiteHoldDuration);
        }
        return;
      }

      const char = text[index];
      const newText = text.slice(0, index + 1);
      const typedSoFar = text.slice(0, index);

      setCurrentLine(newText);

      const isPunctuation = /[.,!?;:…]/.test(char);
      playTick(isPunctuation);

      const baseSpeed = step.speedMs || GLOBAL_SPEED_MS;
      const variance = step.varianceMs || GLOBAL_VARIANCE_MS;
      const randomVariance = (Math.random() * 2 - 1) * variance;
      let delay = Math.max(10, baseSpeed + randomVariance);

      const punctuationPause = getPunctuationPause(char, typedSoFar);
      if (punctuationPause > 0) delay += punctuationPause;

      rafRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          typeText(step, text, index + 1);
        }, delay);
      });
    },
    [prefersReducedMotion, advanceStep, playTick]
  );

  // Process current step
  const processStep = useCallback(() => {
    if (phase !== "typing") return;
    if (currentStepIndex >= RIDAH_INTRO_SEQUENCE.length) {
      setPhase("complete");
      return;
    }

    setCurrentLine("");

    const step = RIDAH_INTRO_SEQUENCE[currentStepIndex];
    currentStepRef.current = step;

    if (step.type === "type") {
      if (currentAct !== null && step.act !== currentAct) {
        setCurrentLine("");
        setCompletedLines([]);
        setWaitingForUser(false);
        
        timeoutRef.current = setTimeout(() => {
          setCurrentAct(step.act);
          setIsTyping(true);

          if (prefersReducedMotion) {
            setCurrentLine(step.text || "");
            setIsTyping(false);

            if (step.actEnd) {
              timeoutRef.current = setTimeout(() => setWaitingForUser(true), 1500);
            } else {
              timeoutRef.current = setTimeout(() => {
                advanceStep(step.text || "");
              }, Math.max(600, step.pauseAfterMs || 800));
            }
          } else {
            typeText(step, step.text || "", 0);
          }
        }, prefersReducedMotion ? 500 : 800);

        return;
      }
      
      if (currentAct === null) setCurrentAct(step.act);
      
      clearTimers();
      setWaitingForUser(false);
      setIsTyping(true);

      if (prefersReducedMotion) {
        setCurrentLine(step.text || "");
        setIsTyping(false);

        if (step.actEnd) {
          timeoutRef.current = setTimeout(() => setWaitingForUser(true), 1500);
        } else {
          timeoutRef.current = setTimeout(() => {
            advanceStep(step.text || "");
          }, Math.max(600, step.pauseAfterMs || 800));
        }
      } else {
        typeText(step, step.text || "", 0);
      }
    } else if (step.type === "breathe") {
      setCurrentLine("");
      setShowBalloon(true);
      timeoutRef.current = setTimeout(() => setWaitingForUser(true), 500);
    }
  }, [phase, currentStepIndex, currentAct, prefersReducedMotion, typeText, clearTimers, advanceStep]);

  // Process step when index changes
  useLayoutEffect(() => {
    if (phase === "typing") {
      clearTimers();
      processStep();
    }
    return () => clearTimers();
  }, [phase, currentStepIndex, processStep, clearTimers]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show dock on Escape or Tab (keyboard navigation)
      if (e.key === "Escape" || e.key === "Tab") {
        setControlDockVisible(true);
        setControlDockOpacity(0.65);
        if (controlDockFadeTimeoutRef.current) {
          clearTimeout(controlDockFadeTimeoutRef.current);
          controlDockFadeTimeoutRef.current = null;
        }
      if (e.key === "Escape") {
          e.preventDefault();
        }
        return;
      }

      if (e.key !== "Enter" && e.key !== " " && e.key !== "ArrowDown") return;

      if (!hasUserInteracted) setHasUserInteracted(true);
      e.preventDefault();

      // Breathe phase - start immersive balloon enter
      if (phase === "breathe" && !hasStarted) {
        // Play UI blip for Enter key
        playUIBlip(true);
        
        clearTimers();
        setHasStarted(true);
        setIsIrisEntering(true);
        setShowBalloon(true); // ensure it's present during enter
        
        // Text fades first (450-650ms), then balloon expands
        // This is handled in the balloon animation below
        return;
      }

      if (phase === "typing") {
        const currentStep = currentStepRef.current;
        if (!currentStep) return;

        if (currentStep.type === "breathe" && waitingForUser) {
          clearTimers();
          setShowBalloon(false);

          timeoutRef.current = setTimeout(handOff, prefersReducedMotion ? 400 : 1200);
          return;
        }

        // Enter while typing: finish current line instantly (no skipping)
        if (isTyping && currentStep.type === "type") {
          playUIBlip(true);
          clearTimers();
          setCurrentLine(currentStep.text || "");
          setIsTyping(false);
          
          if (currentStep.actEnd) {
            timeoutRef.current = setTimeout(() => setWaitingForUser(true), 1500);
          } else {
            timeoutRef.current = setTimeout(() => {
              advanceStep(currentStep.text || "");
            }, 600);
          }
          return;
        }

        // Enter when done: if last act, go directly to main site; otherwise advance ONE step
        if (waitingForUser && currentStep.actEnd) {
          playUIBlip(true);
          // Check if this is the last act (act 6 is the final act after deleting act 5)
          const isLastAct = currentStep.act === 6;
          if (isLastAct) {
            // Last act: go directly to main site, skip breathe step
            clearTimers();
            handOff();
            return;
          }
          // Not last act: advance to next step normally
          advanceStep(undefined, true);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    phase,
    hasStarted,
    isTyping,
    waitingForUser,
    handOff,
    clearTimers,
    advanceStep,
    hasUserInteracted,
    prefersReducedMotion,
    playUIBlip,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimers();
      if (controlDockFadeTimeoutRef.current) {
        clearTimeout(controlDockFadeTimeoutRef.current);
        controlDockFadeTimeoutRef.current = null;
      }
      if (pointerActivityTimeoutRef.current) {
        clearTimeout(pointerActivityTimeoutRef.current);
        pointerActivityTimeoutRef.current = null;
      }
      stopAllSounds();
    };
  }, [clearTimers, stopAllSounds]);

  // White background for breathe phase only (black expands over it during iris)
  const isLightChrome = phase === "breathe" && !isIrisEntering;
  
  // Show portrait on white breathe page (wide screens only)
  const showPortrait = phase === "breathe" && !hasStarted && isWideEnough;

  // Values quote for breathe page - structured for clarity
  const VALUES_QUOTE = [
    "Think big.",
    "Act with integrity.",
    "Embrace teamwork.",
    "Lead by example.",
    "Strive for excellence.",
    "Treat everyone with respect and equality."
  ];

  // Click marks user interaction (for sound policy) and plays blip.
  // It also starts the gate: people click before they read "press Enter", and a
  // landing page whose only exit is a keyboard shortcut is a landing page people
  // leave. Touch devices never reach this screen (see EntryPage), but trackpad
  // users on laptops absolutely click first.
  const handleClick = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    } else {
      // Play blip on click (after first interaction)
      playUIBlip(false);
    }

    if (phase === "breathe" && !hasStarted && revealStage >= 2) {
      clearTimers();
      setHasStarted(true);
      setIsIrisEntering(true);
      setShowBalloon(true);
    }
  }, [hasUserInteracted, playUIBlip, phase, hasStarted, revealStage, clearTimers]);

  // Iris enter timing - text fades first, then balloon expands
  const textFadeDuration = prefersReducedMotion ? 0.3 : 0.6; // 500-700ms
  const irisDuration = prefersReducedMotion ? 0.6 : 1.2; // 1000-1400ms
  const irisScale = 50; // Large enough to cover viewport

  /**
   * Hand off to the dashboard once the iris has covered the viewport.
   *
   * This is a timer rather than a pure `onAnimationComplete` handoff because
   * the callback is not a guarantee: the iris starts from a `repeat: Infinity`
   * breathing keyframe, and when that animation is replaced mid-flight Framer
   * treats it as an interruption and can skip the completion callback. The
   * result was a visitor stranded on a black screen at `/` — the iris had
   * expanded to fill the window and nothing ever navigated.
   *
   * So the timer is the contract and `onAnimationComplete` is the fast path;
   * whichever wins, `handOff` is latched. The duration mirrors the animation
   * exactly (text fade, then expansion) plus a frame of slack.
   */
  useEffect(() => {
    if (!isIrisEntering) return;

    const coverMs = (textFadeDuration + irisDuration) * 1000 + 120;
    irisHandoffTimerRef.current = setTimeout(handOff, coverMs);

    return () => {
      if (irisHandoffTimerRef.current) {
        clearTimeout(irisHandoffTimerRef.current);
        irisHandoffTimerRef.current = null;
      }
    };
  }, [isIrisEntering, textFadeDuration, irisDuration, handOff]);

  // Controls visibility condition
  const controlsVisible = pointerActive || revealStage >= 2;

  return (
    <div
      className="fixed inset-0 overflow-hidden h-screen"
      style={{
        backgroundColor: isLightChrome && !isIrisEntering ? "white" : "black",
      }}
      onClick={handleClick}
    >
      {/* Page fade overlay for breathe phase - ensures no first-frame flash */}
      {/* Starts at opacity 1 (covering) and fades to 0 (revealing) */}
      {phase === "breathe" && !hasStarted && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.3 : 1.0, 
            ease: "easeOut",
            delay: prefersReducedMotion ? 0 : 0.1,
          }}
          style={{
            backgroundColor: "white",
            willChange: "opacity",
          }}
        />
      )}
      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Paper grain texture - only on white breathe screen for premium feel */}
      {isLightChrome && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23grain)' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      )}

      {/* Vignette - only show in dark mode */}
      {!isLightChrome && (
      <motion.div
        className="absolute inset-0"
          animate={
            prefersReducedMotion
              ? {}
              : {
          background: [
            "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)",
            "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)",
            "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)",
          ],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
                }
          }
        />
      )}

      {/* Grain texture overlay - only in dark mode */}
      {!isLightChrome && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23grain)' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      )}

      {/* Portrait right-side panel - only on white breathe page, wide screens only */}
      {showPortrait && revealStage >= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.2 : 0.7, 
            ease: "easeOut" 
          }}
          className="absolute right-0 top-0 bottom-0 pointer-events-none z-[2]"
          style={{
            width: "clamp(320px, 30vw, 520px)",
            willChange: "opacity",
            // Container has no background, no border, no seam
          }}
        >
          <img
            src="/images/portrait-half.jpg"
            alt=""
            className="w-full h-full"
            style={{
              display: "block",
              objectFit: "contain",
              objectPosition: "center right",
              opacity: 0.98,
              filter: "contrast(1.02) saturate(1.0)",
              // Left fade: smooth gradient with multiple stops for seamless blend
              // Fades from fully transparent (left) to fully opaque (right) over ~50px
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 2%, rgba(0, 0, 0, 0.3) 5%, rgba(0, 0, 0, 0.5) 8%, rgba(0, 0, 0, 0.7) 12%, rgba(0, 0, 0, 0.85) 18%, black 25%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 2%, rgba(0, 0, 0, 0.3) 5%, rgba(0, 0, 0, 0.5) 8%, rgba(0, 0, 0, 0.7) 12%, rgba(0, 0, 0, 0.85) 18%, black 25%)",
              // Enable hardware acceleration for smooth rendering
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
            aria-hidden="true"
          />
          {/* Left-side overlay gradient - blends photo into white background on the left */}
          {/* This overlay ensures smooth blend even if mask has issues */}
          <div
            className="absolute top-0 bottom-0 left-0 pointer-events-none z-[3]"
            style={{
              width: "clamp(40px, 25%, 80px)", // Wider fade for smoother blend (40-80px)
              background: "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 15%, rgba(255,255,255,0.8) 35%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.2) 85%, transparent 100%)",
            }}
          />
        </motion.div>
      )}

      {/* Subtle warm ember glow at bottom - optimistic warmth */}
      {!isLightChrome && (
        <div className="absolute inset-x-0 bottom-0 h-[40vh] pointer-events-none z-[5]">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(60% 60% at 50% 100%, rgba(255,180,90,0.10) 0%, rgba(0,0,0,0) 70%)",
            }}
            animate={{ 
              opacity: prefersReducedMotion ? 0.4 : [0.35, 0.55, 0.35],
            }}
            transition={
              prefersReducedMotion
                ? {}
                : {
                    duration: 16,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
            }
          />
        </div>
      )}

      {/* Balloon / Iris */}
      <AnimatePresence initial={false}>
        {(showBalloon || isIrisEntering) && revealStage >= 2 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.35, ease: "easeOut" }}
          >
            {/* This outer motion is the ONLY scaler (professional & stable) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{
                opacity: 1,
                scale: isIrisEntering
                  ? irisScale
                  : prefersReducedMotion
                  ? 1
                  : [1, 1.08, 1],
              }}
              transition={
                isIrisEntering
                  ? { 
                      duration: irisDuration, 
                      ease: "easeInOut",
                      delay: textFadeDuration, // Start expanding AFTER text is completely gone
                    }
                  : prefersReducedMotion
                  ? { duration: 0.3 }
                  : {
                      opacity: { duration: 0.7, ease: "easeOut" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }
              }
              onAnimationComplete={() => {
                if (!isIrisEntering) return;

                // --- Ridah typing act: DISABLED 2026-09-18 ---------------------
                // The black-screen typewriter monologue was written for
                // admissions. A recruiter with a QR code and thirty seconds will
                // not sit through six acts of prose, and the gate was costing us
                // the page. The breathe screen stays — it is the memorable part
                // and it costs one keypress — and the iris now hands straight off
                // to the dashboard.
                //
                // The sequence itself is untouched in src/content/ridahIntro.ts
                // and the whole typing machinery below is still live code. To
                // bring it back, restore these three lines and delete the
                // onComplete() call:
                //
                //   setPhase("typing");
                //   setIsIrisEntering(false);
                //   setShowBalloon(false);
                // ----------------------------------------------------------------
                //
                // Fast path only. The timer in the iris effect above is what
                // actually guarantees the handoff; this just skips the slack
                // when Framer does report completion.
                handOff();
              }}
              style={{ 
                transformOrigin: "center center",
                willChange: "transform, opacity",
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "clamp(256px, 20vw, 320px)",
                  height: "clamp(256px, 20vw, 320px)",
                  backgroundColor: isIrisEntering ? "black" : (isLightChrome ? "black" : "transparent"),
                  border: isIrisEntering
                    ? "0px solid transparent"
                    : isLightChrome
                    ? "2px solid rgba(0,0,0,0.22)"
                    : "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: isIrisEntering
                    ? "0 0 40px rgba(0, 0, 0, 0.3)"
                    : isLightChrome
                    ? "0 0 40px rgba(0, 0, 0, 0.22)"
                    : "0 0 40px rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* "breathe" text fades FIRST (500-700ms), then balloon expands */}
                <motion.span
                  className="text-2xl md:text-3xl font-light tracking-wider"
                  initial={false}
                  animate={{ opacity: isIrisEntering ? 0 : 1 }}
                  transition={{
                    duration: textFadeDuration,
                    delay: 0,
                    ease: "easeOut",
                  }}
                  style={{
                    color: isLightChrome ? "white" : "rgba(255, 255, 255, 0.8)",
                  }}
                >
                breathe
                </motion.span>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text content - FIXED POSITION with locked width */}
      <div 
        className="absolute introSerif z-10"
        style={{
          left: "6%",
          top: "18%",
          width: "min(860px, 92vw)", // Increased width for natural wrapping
          maxWidth: "min(860px, 92vw)", // Locked width to prevent jitter
          // keep a stable "reading block" so width/layout feels locked
          willChange: "transform, opacity",
        }}
      >
        {/* Completed lines (stable keys, smooth layout, no wrapping) */}
        <AnimatePresence mode="popLayout">
          {completedLines.map((line) => (
          <motion.div
              key={line.id}
              layout
              initial={{ opacity: 0.92, y: 0 }}
              animate={{ 
                opacity: line.isNewlyCompleted ? 0.92 : 0.55, // Stay white if newly completed, then lighter grey
                y: -2 
              }} // Tiny drift only
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: {
                  duration: prefersReducedMotion ? 0.25 : 0.55,
                  ease: "easeInOut",
                },
              }}
              transition={{
                opacity: { 
                  duration: line.isNewlyCompleted 
                    ? (prefersReducedMotion ? 0.4 : 1.2) // Slow fade to grey for newly completed
                    : (prefersReducedMotion ? 0.2 : 0.45), 
                  ease: "easeOut",
                  delay: line.isNewlyCompleted ? (prefersReducedMotion ? 0.3 : 0.8) : 0 // Delay before fading to grey
                },
                y: { duration: prefersReducedMotion ? 0.25 : 0.7, ease: "easeOut" },
                layout: { duration: prefersReducedMotion ? 0.25 : 0.7, ease: "easeOut" },
              }}
              className="font-light mb-3"
            style={{
                fontSize: "clamp(22px, 2.0vw, 34px)",
                lineHeight: 1.28,
                letterSpacing: "-0.012em",
                color: line.isNewlyCompleted 
                  ? "rgba(255, 255, 255, 0.92)" // Stay white when newly completed
                  : "rgba(255, 255, 255, 0.55)", // Lighter grey for better visibility
                whiteSpace: "normal", // Allow natural wrapping
                overflowWrap: "anywhere", // Break words if necessary
                wordBreak: "normal",
                fontVariantLigatures: "none", // Stable font rendering
              }}
            >
              {line.text}
          </motion.div>
        ))}
        </AnimatePresence>
        
        {/* Current line (NO key, no remount, stable width, no wrapping) */}
        <motion.div
          initial={false}
          animate={{
            opacity: phase === "typing" && currentLine ? 1 : 0,
          }}
          transition={{ duration: prefersReducedMotion ? 0.08 : 0.16, ease: "easeOut" }}
          className="font-light"
          style={{
            fontSize: "clamp(22px, 2.0vw, 34px)",
            lineHeight: 1.28,
            letterSpacing: "-0.012em",
            color: "rgba(255, 255, 255, 0.92)",
            minHeight: "1.3em", // prevents "width/measure" jitter feeling
            whiteSpace: "normal", // Allow natural wrapping
            overflowWrap: "anywhere", // Break words if necessary
            wordBreak: "normal",
            fontVariantLigatures: "none", // Stable font rendering
          }}
        >
          {currentLine}
          {currentLine && !prefersReducedMotion && isTyping && (
            <span
              className="inline-block w-[2px] h-[0.9em] ml-[2px] align-middle"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      </div>

      {/* Values quote - top-left, breathe page only - staggered reveal */}
      <AnimatePresence initial={false}>
        {phase === "breathe" && !hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealStage >= 3 ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.2 : 0.4, 
              ease: "easeOut" 
            }}
            className="absolute top-7 left-7 hidden md:block z-[5]"
            style={{
              maxWidth: "360px",
              willChange: "opacity",
            }}
          >
            <div 
              className="text-sm font-light tracking-wider introSerif"
              style={{ 
                color: "rgba(0, 0, 0, 0.35)",
                lineHeight: 1.7,
                letterSpacing: "-0.01em",
              }}
            >
              {VALUES_QUOTE.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealStage >= 3 ? 1 : 0 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : (index * 0.7),
                    duration: prefersReducedMotion ? 0.2 : 0.4,
                    ease: "easeOut"
                  }}
                  style={{
                    marginBottom: index < VALUES_QUOTE.length - 1 ? "0.65em" : "0",
                    willChange: "opacity",
                  }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature - bottom-left, breathe screen only */}
      {phase === "breathe" && !hasStarted && (
        <motion.img
          src={signature}
          alt="Said signature"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.3 : 0.6,
            delay: prefersReducedMotion ? 0.3 : 1.0,
            ease: "easeOut",
          }}
          className="fixed left-8 bottom-8 z-20 hidden lg:block pointer-events-none select-none"
          style={{
            height: "auto",
            width: "clamp(120px, 8vw, 180px)",
            willChange: "opacity, transform",
            border: "none",
            outline: "none",
            boxShadow: "none",
            filter: "none",
            imageRendering: "auto",
          }}
          aria-hidden="true"
        />
      )}

      {/* Hint text - fades out during iris enter - only show after all quotes finish (revealStage >= 4) */}
      <AnimatePresence initial={false}>
        {((phase === "breathe" && showBalloon && !hasStarted && revealStage >= 4) || waitingForUser) ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isIrisEntering ? 0 : 1, 
              y: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isIrisEntering ? textFadeDuration : (prefersReducedMotion ? 0.15 : 0.3), 
              ease: "easeOut" 
            }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-sm font-light tracking-wider introSerif"
            style={{
              color: isLightChrome ? "rgba(0, 0, 0, 0.35)" : "rgba(255, 255, 255, 0.28)",
              willChange: "opacity, transform",
            }}
          >
            {phase === "breathe" && !hasStarted
              ? "take a breath • press Enter or click"
              : waitingForUser && currentStepRef.current?.type === "breathe"
              ? "press Enter to continue"
              : "press Enter"}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Bottom hint text for typing phase (black screen) - shows on pointer activity */}
      <AnimatePresence initial={false}>
        {phase === "typing" && pointerActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.15 : 0.3, 
              ease: "easeOut" 
            }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-sm font-light tracking-wider introSerif"
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              willChange: "opacity, transform",
            }}
          >
            press Enter to advance
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Dock - top-right, shows on pointer activity OR after reveal stage 2 */}
      <AnimatePresence initial={false}>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ 
              opacity: controlDockVisible ? controlDockOpacity : 0,
              y: 0,
            }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-0 right-0 z-20 flex items-center gap-3 p-4 md:p-5"
            // Stop the dock from bubbling into the root click handler, which
            // would otherwise fire the iris when someone hits Skip or Sound.
            onClick={(e) => e.stopPropagation()}
            style={{
              pointerEvents: controlsVisible ? "auto" : "none",
              willChange: "opacity, transform",
            }}
            onMouseEnter={() => setControlDockHovered(true)}
            onMouseLeave={() => setControlDockHovered(false)}
            onFocus={() => {
              setControlDockHovered(true);
              setControlDockVisible(true);
              setControlDockOpacity(1);
            }}
            onBlur={() => setControlDockHovered(false)}
          >
            <button
              onClick={() => {
                toggleSound();
                playUIBlip(true);
              }}
              className="relative flex items-center gap-2 px-3 py-2 min-h-[36px] md:min-h-[40px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md group"
              style={{
                color: isLightChrome 
                  ? "rgba(0, 0, 0, 0.7)" 
                  : (phase === "typing" && pointerActive 
                    ? "rgba(255, 255, 255, 1)" 
                    : "rgba(255, 255, 255, 0.7)"),
                border: isLightChrome 
                  ? "1px solid rgba(0, 0, 0, 0.15)" 
                  : (phase === "typing" && pointerActive
                    ? "1px solid rgba(255, 255, 255, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.15)"),
                backgroundColor: isLightChrome 
                  ? "rgba(0, 0, 0, 0.02)" 
                  : (phase === "typing" && pointerActive
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.02)"),
                opacity: controlDockOpacity,
              }}
              aria-label={soundEnabled ? "Disable keyboard sound" : "Enable keyboard sound"}
              title="Sound"
            >
              {soundEnabled ? (
                <Volume2 size={18} strokeWidth={1.5} />
              ) : (
                <VolumeX size={18} strokeWidth={1.5} />
              )}
              <span className="text-sm font-light tracking-wider introSerif hidden sm:inline">
                Sound
              </span>
              {/* Tiny label on hover (mobile fallback) */}
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs font-light tracking-wider introSerif opacity-0 group-hover:opacity-100 sm:group-hover:opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                style={{
                  color: isLightChrome ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
                }}
              >
                Sound
              </span>
            </button>

            <button
              onClick={() => {
                playUIBlip(true);
                handOff();
              }}
              className="flex items-center px-3 py-2 min-h-[36px] md:min-h-[40px] text-sm font-light tracking-wider introSerif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md"
              style={{
                color: isLightChrome 
                  ? "rgba(0, 0, 0, 0.7)" 
                  : (phase === "typing" && pointerActive 
                    ? "rgba(255, 255, 255, 1)" 
                    : "rgba(255, 255, 255, 0.7)"),
                border: isLightChrome 
                  ? "1px solid rgba(0, 0, 0, 0.15)" 
                  : (phase === "typing" && pointerActive
                    ? "1px solid rgba(255, 255, 255, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.15)"),
                backgroundColor: isLightChrome 
                  ? "rgba(0, 0, 0, 0.02)" 
                  : (phase === "typing" && pointerActive
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.02)"),
                opacity: controlDockOpacity,
              }}
              aria-label="Skip intro"
            >
              Skip Intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
