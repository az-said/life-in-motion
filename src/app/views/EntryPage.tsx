import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { useIsDesktop } from "../../hooks/useIsDesktop";

/**
 * The gate is the single heaviest thing in the app (the sequence component alone
 * is ~1300 lines plus its motion choreography), and a phone never renders it.
 * Splitting it out is the largest win available on the mobile arrival path.
 */
const IntroGatePage = lazy(() => import("./IntroGatePage"));

/**
 * The gate opens on white. If the chunk is still in flight we paint that same
 * white rather than falling through to the app's dark canvas — otherwise a
 * desktop visitor gets a black flash before the breath, which reads as a bug.
 */
function GateFallback() {
  return <div className="fixed inset-0 z-50 bg-white" aria-hidden="true" />;
}

/**
 * EntryPage — the one place that decides what "/" means.
 *
 *   Desktop (>=1024px, fine pointer)  ->  the cinematic gate, then the dashboard
 *   Phone / tablet / coarse pointer   ->  the dashboard, immediately
 *
 * Why the split exists: most people who scan the card's QR are holding a phone
 * in a loud room with thirty seconds of patience. A splash gate costs them the
 * page. On a laptop, at night, with the tab already open, the gate is the whole
 * reason the site is memorable. Same site, two arrival speeds.
 *
 * Both paths land on exactly the same /dashboard. Nothing is hidden from mobile.
 *
 * `replace` keeps "/" out of the history stack, so Back from the dashboard
 * leaves the site instead of bouncing the visitor through a redirect loop.
 */
export default function EntryPage() {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<GateFallback />}>
      <IntroGatePage />
    </Suspense>
  );
}
