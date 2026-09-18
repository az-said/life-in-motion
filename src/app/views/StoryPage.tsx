/**
 * StoryPage - Main story page (route "/story")
 * 
 * This page only renders StoryShell - no intro gate logic.
 * Intro gate is handled separately by IntroGatePage at route "/".
 */

import { useEffect, useRef } from "react";
import StoryShell from "../../components/story/StoryShell";
import { STORY_TIMELINE_SCENES } from "../../content/storyTimeline";
import { devLog } from "../../utils/devLog";

export default function StoryPage() {
  const hasMountedRef = useRef(false);

  // DEV log only for first mount
  useEffect(() => {
    if (!hasMountedRef.current && import.meta.env.DEV) {
      devLog("[StoryPage] FIRST MOUNT");
      hasMountedRef.current = true;
    }
  }, []);

  // Defensive check: ensure STORY_TIMELINE_SCENES is available
  const hasTimelineData = STORY_TIMELINE_SCENES && Array.isArray(STORY_TIMELINE_SCENES) && STORY_TIMELINE_SCENES.length > 0;

  // Fallback if timeline data is missing or empty - show placeholder, no redirects
  if (!hasTimelineData) {
    console.error("[StoryPage] CRITICAL: Timeline data missing - check storyTimeline.ts import");
  }

  return <StoryShell />;
}
