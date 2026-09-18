import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { STORY_TIMELINE_SCENES } from "../../content/storyTimeline";
import { clsx } from "clsx";
import CinematicScene from "./CinematicScene";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import SEOHead from "../ui/SEOHead";
import { createNavLogger } from "../../utils/navigation";
import PageFooter from "../layout/PageFooter";
import MobileScrollAffordance from "./MobileScrollAffordance";
import { useSound } from "../../app/providers/SoundProvider";
import { devLog } from "../../utils/devLog";

interface StoryShellProps {
  onMountChange?: (mounted: boolean) => void;
}

/**
 * How many scenes stay mounted around the one being read.
 *
 * All nine used to be in the DOM at once, each a full-bleed image or video
 * under three gradient overlays plus a 2-second Ken Burns transform — nine
 * decoded full-viewport bitmaps and nine compositor layers for a reader who can
 * only ever see one.
 *
 * The window is deliberately lopsided. Mounting a scene is not the same as
 * having it painted: at a symmetric ±1 the next scene mounted only as you began
 * moving toward it, and a freshly-decoded full-viewport JPEG showed a dark
 * frame before it landed. Two ahead gives the decode a full beat of runway, so
 * the image is ready before the snap arrives. Behind, one is plenty — scrolling
 * back up is rare and a re-mount there is invisible.
 *
 * The wrapper divs are never unmounted, only their contents, so the scroll
 * height, the snap points and the IntersectionObserver targets all stay put.
 * Without that the page would shrink under the reader as they scrolled.
 */
const SCENES_AHEAD = 2;
const SCENES_BEHIND = 1;

export default function StoryShell({ onMountChange }: StoryShellProps = {}) {
  const navigate = useNavigate();
  const nav = createNavLogger(navigate);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const continueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useSound();
  const previousSceneRef = useRef(0);

  useEffect(() => {
    devLog("[StoryShell] MOUNTED");
    onMountChange?.(true);
    
    return () => {
      devLog("[StoryShell] UNMOUNTED");
      onMountChange?.(false);
      // Cleanup all timeouts
      if (continueTimeoutRef.current) {
        clearTimeout(continueTimeoutRef.current);
        continueTimeoutRef.current = null;
      }
      // StoryShell uses its own internal scroll container, no body overflow changes needed
    };
  }, [onMountChange]);

  /*
   * There was a mount-only effect here that set currentScene to 0, cleared
   * isTransitioning and emptied sceneRefs. The first two were already the
   * initial state of a freshly mounted component, so they bought nothing. The
   * third was actively wrong: ref callbacks run during commit, before effects,
   * so by the time this fired every scene ref had already been assigned — and
   * this threw them all away. The IntersectionObserver effect, declared after
   * it, then iterated an empty array and observed nothing, which is why the
   * active scene never advanced past the first.
   */

  const totalScenes = STORY_TIMELINE_SCENES?.length ?? 0;

  // Simple scroll to scene for keyboard navigation
  const scrollToScene = useCallback((index: number) => {
    if (index < 0 || index >= totalScenes) return;
    const target = sceneRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [totalScenes]);

  const goToNextScene = useCallback(() => {
    const next = currentScene + 1;
    if (next < totalScenes) {
      scrollToScene(next);
    }
  }, [currentScene, totalScenes, scrollToScene]);

  const goToPreviousScene = useCallback(() => {
    const next = currentScene - 1;
    if (next >= 0) {
      scrollToScene(next);
    }
  }, [currentScene, scrollToScene]);

  /**
   * Start at the top.
   *
   * This used to sit behind an `isReady` flag — a 100ms timer plus two nested
   * requestAnimationFrames — and then bail out entirely if the container
   * measured zero height. Both existed to work around the page-transition
   * wrapper in AppLayout, which kept the outgoing route mounted and left the
   * parent height ambiguous. That bail is exactly how /story came back blank:
   * measure during the ambiguous window, read 0, return, never render.
   *
   * AppLayout no longer keeps two pages in the tree, so there is nothing to wait
   * for and nothing to measure. Scenes render on the first paint.
   */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Handle keyboard navigation - simple scrollIntoView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToNextScene();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToPreviousScene();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning, goToNextScene, goToPreviousScene]);

  const handleSkip = () => {
    nav("/honors", undefined, "StoryShell: user clicked Skip");
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    // Cleanup any pending continue timeout
    if (continueTimeoutRef.current) {
      clearTimeout(continueTimeoutRef.current);
      continueTimeoutRef.current = null;
    }
    // Cinematic transition: fade to black, then navigate to Honors
    continueTimeoutRef.current = setTimeout(() => {
      nav("/honors", undefined, "StoryShell: user clicked Continue after story");
      continueTimeoutRef.current = null;
    }, 1500);
  };

  /**
   * Track which scene the reader is on.
   *
   * The observer watches the wrapper divs, which stay mounted for every scene
   * regardless of the render window — so windowing the contents cannot blind
   * this. `currentScene` is deliberately not a dependency: it is what this
   * effect writes, and reading it here would tear the observer down and rebuild
   * it on every scroll.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          const index = Number.parseInt(
            (entry.target as HTMLDivElement).dataset.sceneIndex ?? "-1",
            10,
          );
          if (index < 0) return;
          setCurrentScene((prev) => {
            if (prev === index) return prev;
            devLog("[StoryShell] Scene changed:", index);
            return index;
          });
        });
      },
      { root: container, threshold: 0.5 },
    );

    sceneRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [totalScenes]);

  // Play transition sound when scene changes
  useEffect(() => {
    if (previousSceneRef.current !== currentScene && currentScene > 0) {
      play("transition");
    }
    previousSceneRef.current = currentScene;
  }, [currentScene, play]);

  // Get first image for preloading (LCP optimization)
  const firstImage = STORY_TIMELINE_SCENES[0]?.mediaRef;

  return (
    <>
      <SEOHead title="Story" preloadImage={firstImage} />
      <div className="relative w-full h-full overflow-hidden">
        {/* The one scroll container on this route. AppLayout clamps its own
            scroller shut for /story so the snap axis is unambiguous — two
            nested scrollers meant a flick could move either one.

            Sized h-full rather than 100dvh on mobile: this sits inside a box
            that AppLayout has already inset by the header height, so a full
            dynamic-viewport child overflowed by exactly that much and dragged
            every snap point down with it. */}
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
          style={{
            WebkitOverflowScrolling: "touch", // Better mobile scrolling
          }}
        >
          {STORY_TIMELINE_SCENES.map((scene, index) => {
            const offset = index - currentScene;
            const isNear = offset >= -SCENES_BEHIND && offset <= SCENES_AHEAD;
            return (
              <div
                key={scene.id}
                ref={(el) => {
                  sceneRefs.current[index] = el;
                }}
                data-scene-index={index}
                className="snap-start snap-always w-full h-full"
              >
                {isNear && (
                  <CinematicScene
                    scene={scene}
                    index={index}
                    isLast={index === totalScenes - 1}
                    isActive={index === currentScene}
                    onContinue={handleContinue}
                  />
                )}
              </div>
            );
          })}
          {/* Footer at the end of story */}
          <div className="snap-start snap-always w-full">
            {/* End cap spacer */}
            <div className="h-8 flex-shrink-0" aria-hidden="true" />
            <PageFooter />
          </div>
        </div>

        {/* Skip out of the story. Shown at every width.
            It used to be `hidden md:flex`, with a comment claiming mobile
            reached this through the hamburger menu. The menu's "Skip to
            Honors" item lived in a branch that never rendered, so on a phone
            there was no way out of nine full-screen scenes except scrolling
            all of them.

            Positioned off the header's published --header-h rather than a
            hardcoded 65px, so it stays under the header if that height
            changes. The label shortens on mobile because the long form does
            not fit beside the header controls. */}
        <motion.button
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={prefersReducedMotion ? {} : { delay: 0.5 }}
            onClick={handleSkip}
            className={clsx(
              "flex fixed top-[calc(var(--header-h,67px)+0.5rem)] right-4 md:right-24 z-[50]",
              "px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all duration-200 ease-out",
              "hover:-translate-y-0.5 active:translate-y-0",
              "hover:shadow-[0_4px_12px_rgba(120,220,255,0.15)]",
              "bg-white/5 hover:bg-white/10 active:bg-white/15",
              "border border-white/10 hover:border-white/20",
              "text-xs md:text-sm text-[rgb(var(--fg-0))]",
              "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
          >
            <span className="md:hidden">Skip →</span>
            <span className="hidden md:inline">Skip story → Honors</span>
        </motion.button>

        {/* Mobile scroll affordance - deterministic, always visible when content below */}
        <MobileScrollAffordance
          scrollElRef={containerRef}
          activeSceneIndex={currentScene}
        />

        {/* Cinematic transition overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <>
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 1.5, ease: "easeInOut" }}
                className="fixed inset-0 z-[100] bg-black"
              />
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
              >
                <p className="text-2xl md:text-3xl font-semibold text-[rgb(var(--fg-0))]">
                  Entering Site Mode...
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}


