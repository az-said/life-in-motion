import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import RidahSequence from "../../components/intro/RidahSequence";
import { useIntroGate } from "../hooks/useIntroGate";
import { useReducedMotion } from "../../hooks/useReducedMotion";

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
