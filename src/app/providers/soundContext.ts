import { createContext, useContext } from "react";

export const SFX_STORAGE_KEY = "sfxMuted";

export type SFXType = "click" | "hover" | "transition";

export interface SoundContextValue {
  isEnabled: boolean; // true when sound is enabled (not muted)
  toggleSound: () => void;
  hasUserInteracted: boolean;
  play: (type: SFXType) => void;
  // Legacy functions (deprecated, use play() instead)
  playTick: () => void;
  playConfirm: () => void;
  playSoftBlip: () => void;
}

export const SoundContext = createContext<SoundContextValue | undefined>(undefined);

/**
 * Hook to access sound context
 */
export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
