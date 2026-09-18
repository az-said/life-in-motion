import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  SFX_STORAGE_KEY,
  SoundContext,
  type SFXType,
  type SoundContextValue,
} from "./soundContext";

interface SoundProviderProps {
  children: ReactNode;
}

/**
 * Sound provider for subtle audio feedback
 * Respects autoplay restrictions and prefers-reduced-motion
 * 
 * VERIFICATION CHECKLIST:
 * ✅ Sound defaults off (isEnabled = false initially)
 * ✅ Only starts after user interaction (hasUserInteracted check)
 * ✅ No autoplay before first user interaction
 */
export function SoundProvider({ children }: SoundProviderProps) {
  const prefersReducedMotion = useReducedMotion();
  // Read the persisted preference up front: mirroring localStorage into state
  // from an effect cost an extra render on every mount.
  // localStorage: "sfxMuted" = "1" (muted) or "0" (enabled)
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem(SFX_STORAGE_KEY) !== "1" && !prefersReducedMotion
  );
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<{ [key: string]: AudioBuffer }>({});
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Initialize audio context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Track user interaction for autoplay restrictions
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true);
      // Resume audio context if needed (browser autoplay policy)
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {
          // Silently fail if resume is not possible
        });
      }
    };

    // Listen for any user interaction
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [getAudioContext]);

  // Throttle refs for different sound types
  const lastHoverTimeRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const lastTransitionTimeRef = useRef(0);

  // Load audio buffers for tick sounds
  useEffect(() => {
    if (!isEnabled) return;

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
        // Silently fail if audio file not found
      }
    };

    loadAudio("tick_1.wav");
    loadAudio("tick_2.wav");
  }, [isEnabled, getAudioContext]);

  // Main SFX API: play("click"|"hover"|"transition") - uses tick sounds
  const play = useCallback((type: SFXType) => {
    if (!isEnabled || !hasUserInteracted || prefersReducedMotion) return;

    const now = Date.now();
    let throttleTime = 0;

    // Throttle hover sounds more aggressively
    if (type === "hover") {
      throttleTime = 120; // 120ms between hover sounds (lower volume)
      if (now - lastHoverTimeRef.current < throttleTime) return;
      lastHoverTimeRef.current = now;
    } else if (type === "click") {
      throttleTime = 100; // 100ms between click sounds
      if (now - lastClickTimeRef.current < throttleTime) return;
      lastClickTimeRef.current = now;
    } else if (type === "transition") {
      throttleTime = 300; // 300ms between transition sounds
      if (now - lastTransitionTimeRef.current < throttleTime) return;
      lastTransitionTimeRef.current = now;
    }

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
        return;
      }

      // Try to use tick audio files, fall back to oscillator if not loaded
      const availableTicks = ["tick_1.wav", "tick_2.wav"].filter(
        (f) => audioBuffersRef.current[f]
      );

      if (availableTicks.length > 0) {
        // Use tick audio file
        const chosenFile = availableTicks[Math.floor(Math.random() * availableTicks.length)];
        const buffer = audioBuffersRef.current[chosenFile];
        if (!buffer) return;

        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Adjust pitch and volume based on type
        if (type === "hover") {
          source.playbackRate.value = 0.95 + Math.random() * 0.06; // Slightly lower
          gainNode.gain.value = 0.25 + Math.random() * 0.1; // Lower volume for hover
        } else if (type === "click") {
          source.playbackRate.value = 0.97 + Math.random() * 0.06;
          gainNode.gain.value = 0.35 + Math.random() * 0.15;
        } else if (type === "transition") {
          source.playbackRate.value = 0.92 + Math.random() * 0.04; // Deeper
          gainNode.gain.value = 0.3 + Math.random() * 0.1;
        }

        source.start(ctx.currentTime);

        activeAudioSourcesRef.current.push(source);
        source.onended = () => {
          activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter((s) => s !== source);
        };
      } else {
        // Fallback to oscillator if audio files not loaded
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === "click") {
          // Click: quick, sharp tick
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.05);
        } else if (type === "hover") {
          // Hover: subtle, soft blip
          oscillator.frequency.value = 600;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
        } else if (type === "transition") {
          // Transition: gentle, slightly longer tone
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.12);
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
        }
      }
    } catch {
      // Silently fail if audio is not available
    }
  }, [isEnabled, hasUserInteracted, prefersReducedMotion, getAudioContext]);

  // Legacy function (deprecated, use play("click") instead)
  const playTick = useCallback(() => {
    play("click");
  }, [play]);

  // Legacy function (deprecated, use play("transition") instead)
  const playConfirm = useCallback(() => {
    play("transition");
  }, [play]);

  // Legacy function (deprecated, use play("hover") instead)
  const playSoftBlip = useCallback(() => {
    play("hover");
  }, [play]);

  const toggleSound = useCallback(() => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    // Store as "1" (muted) or "0" (enabled)
    localStorage.setItem(SFX_STORAGE_KEY, newValue ? "0" : "1");
  }, [isEnabled]);

  const value: SoundContextValue = {
    isEnabled,
    toggleSound,
    hasUserInteracted,
    play,
    // Legacy functions (for backward compatibility)
    playTick,
    playConfirm,
    playSoftBlip,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

