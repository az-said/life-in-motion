/**
 * Intro Gate content schema - powered by a sequence of steps
 */

export type IntroStepTone = "dramatic" | "system" | "cute";
export type IntroStepEntrance = "pop";

// Base step interface
interface BaseIntroStep {
  id: string;
}

// Type step: Animated typing text
export interface TypeIntroStep extends BaseIntroStep {
  type: "type";
  text: string;
  speedMs?: number; // Base typing speed in milliseconds (optional, uses default if undefined)
  varianceMs?: number; // Random variance to add/subtract for natural typing feel (optional, uses default if undefined)
  tone: IntroStepTone;
  lineBreakAfter?: boolean; // Whether to add a line break after this text
}

// Dots step: Animated loading dots
export interface DotsIntroStep extends BaseIntroStep {
  type: "dots";
  cycles: number; // Number of dot cycles (e.g., 2 cycles = ".", "..", "...", ".", "..", "...")
  dotIntervalMs?: number; // Milliseconds between dot additions (optional, uses default if undefined)
}

// Pause step: Wait time
export interface PauseIntroStep extends BaseIntroStep {
  type: "pause";
  ms: number; // Duration of pause in milliseconds
}

// Logo cameo step: Logo appears with a typed line
export interface LogoCameoIntroStep extends BaseIntroStep {
  type: "logo-cameo";
  logoLineText: string; // The cute line to type after logo appears
  entrance?: IntroStepEntrance; // How the logo enters (default: "pop")
}

// Union type for all step types
export type IntroStep =
  | TypeIntroStep
  | DotsIntroStep
  | PauseIntroStep
  | LogoCameoIntroStep;

/**
 * Intro Gate sequence configuration
 */
export interface IntroGateConfig {
  title: string;
  subtitle: string;
  continueButton: string;
  sequence: IntroStep[];
}

/**
 * Default intro gate content: A dramatic hook with dots and logo cameo
 */
/**
 * Intro sequence content
 * speedMs and varianceMs in type steps are optional and will use defaults if omitted
 */
export const INTRO_GATE: IntroGateConfig = {
  title: "Life is Motion",
  subtitle: "A journey through craft, connection, and growth",
  continueButton: "Enter",
  sequence: [
    // Dramatic hook - first line
    {
      id: "line-1",
      type: "type",
      text: "Life is motion.",
      // speedMs and varianceMs will use defaults
      tone: "dramatic",
      lineBreakAfter: true,
    },
    // Small pause for dramatic effect (stagger between lines)
    {
      id: "pause-1",
      type: "pause",
      ms: 500, // Will be overridden by timing constants if needed
    },
    // Second line
    {
      id: "line-2",
      type: "type",
      text: "Motion is craft.",
      tone: "dramatic",
      lineBreakAfter: true,
    },
    // Another pause (stagger)
    {
      id: "pause-2",
      type: "pause",
      ms: 500,
    },
    // Third line
    {
      id: "line-3",
      type: "type",
      text: "Craft is connection.",
      tone: "dramatic",
      lineBreakAfter: true,
    },
    // Longer pause before dots
    {
      id: "pause-3",
      type: "pause",
      ms: 700,
    },
    // Dots animation for thinking/loading feel (intentional cadence)
    {
      id: "dots-1",
      type: "dots",
      cycles: 2,
      // dotIntervalMs will use default if omitted
    },
    // Pause after dots
    {
      id: "pause-4",
      type: "pause",
      ms: 600,
    },
    // Logo cameo with cute line
    {
      id: "logo-cameo",
      type: "logo-cameo",
      logoLineText: "Welcome to the journey.",
      entrance: "pop",
    },
  ],
};
