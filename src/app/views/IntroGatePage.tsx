import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import RidahSequence from "../../components/intro/RidahSequence";
import { useIntroGate } from "../hooks/useIntroGate";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useIsDesktop } from "../../hooks/useIsDesktop";

/**
 * Desktop front door.
 *
 * The gate is one screen and one keypress: breathe, then the iris expands to
 * black and hands off to the dashboard. Everything the gate used to lead into
 * (the typewriter monologue) is disabled inside RidahSequence — see the note at
 * its iris handler.
 *
 * The one rule here: the screen must never be black with nowhere to go. The
 * iris finishes as a full-viewport black field, so the crossfade overlay is
 * also black and the sequence stays mounted underneath until the instant we
 * navigate. Unmounting it earlier tears a frame of empty canvas into the middle
 * of the transition.
 */
export default function IntroGatePage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { shouldShow, complete } = useIntroGate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const handoffRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  /**
   * No intro on a phone. Not the breath, not a frame of white.
   *
   * EntryPage already branches on viewport before this component is ever
   * imported, so on a phone this guard should be unreachable. It exists anyway
   * because "the gate never runs on a phone" is a promise about *this* file, and
   * a promise enforced only by the single caller is one refactor away from
   * breaking silently. Checked before any timer, any motion value, any paint.
   *
   * `replace` so Back leaves the site rather than bouncing through a redirect.
   */
  if (!isDesktop) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleComplete = () => {
    if (handoffRef.current) return;
    handoffRef.current = true;

    setIsTransitioning(true);

    timerRef.current = setTimeout(
      () => {
        // The gate hands off to the recruiter dashboard, not the story. The
        // story is still one click away from the dashboard and the menu — it
        // just stopped being the thing a stranger is forced through first.
        complete();
        navigate("/dashboard", { replace: true });
      },
      prefersReducedMotion ? 300 : 700,
    );
  };

  return (
    <>
      {shouldShow && <RidahSequence onComplete={handleComplete} />}

      {/* Crossfade into the dashboard. Black, because the iris ends black. */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.7,
              ease: "easeInOut",
            }}
            className="fixed inset-0 z-[100] bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
