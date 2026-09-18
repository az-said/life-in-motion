import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import PageFooter from "../../components/layout/PageFooter";
import ScrollToTop from "../../components/layout/ScrollToTop";
import RouteFallback from "../../components/layout/RouteFallback";
import DebugHelper from "../../components/debug/DebugHelper";
import { devLog } from "../../utils/devLog";

export default function AppLayout() {
  const location = useLocation();
  const isIntroRoute = location.pathname === "/";
  const isStoryRoute = location.pathname === "/story";

  useEffect(() => {
    devLog("[APP NAV]", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      {import.meta.env.DEV && <DebugHelper />}
      <div className="fixed inset-0 overflow-hidden flex flex-col h-[100dvh]">
        {/* Fixed cinematic background.
            Static on purpose. This used to animate the CSS `background`
            property across four radial gradients on `repeat: Infinity`, which
            is not compositor-accelerated — it repainted the full viewport every
            frame, forever, on every route. The two gradients below are the
            visual midpoint of that loop and cost nothing after first paint. */}
        <div className="absolute inset-0" aria-hidden="true">
          {/* Base dark background */}
          <div className="absolute inset-0 bg-[rgb(var(--bg-0))]" />

          {/* Cool glow, off-centre so the field is not perfectly symmetric */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(120,220,255,0.14)_0%,transparent_55%)]" />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Header - fixed at top (hidden on intro route) */}
        {!isIntroRoute && <Header />}

        {/* Page content with transitions - This is the ONLY scrolling container in the app */}
        {/* Mobile: Extend content into safe areas so it fills viewport including system bars */}
        {/* Story owns its own snap scroller, so this one is clamped shut there.
            Emitted as one class rather than two so Tailwind's source order
            cannot decide which overflow wins. */}
        <div
          className={`relative z-0 pointer-events-auto flex-1 min-h-0 ${isStoryRoute ? "overflow-hidden" : "overflow-y-auto"}`}
          data-scroll-container
          style={{
            // Header publishes its measured height as --header-h (see Header.tsx).
            // The 67px fallback covers the single frame before the ResizeObserver
            // fires, and matches what the header actually measures today.
            paddingTop: isIntroRoute ? 0 : "var(--header-h, 67px)",
            // Extend content into bottom safe area on mobile so it fills entire viewport
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            // Prevent over-scrolling past content (no rubber-band effect past footer)
            overscrollBehavior: 'contain',
            overscrollBehaviorY: 'contain',
          }}
        >
          {/* Route transition — a CSS enter fade, one page in the tree at a time.
              Four deliberate choices, each of them a bug that was:

              1. No AnimatePresence. It ran with `mode="popLayout"`, which keeps
                 the outgoing page mounted and applies layout projection to both
                 children. That leaves the parent's height ambiguous for the
                 length of the transition. Story measured itself inside that
                 window, read a height of 0, and bailed out of its scroll setup —
                 which is what made /story come back blank after navigating away
                 and back. An exit fade is not worth a whole second page in the
                 tree; the incoming page covers it.

              2. Keyed on `pathname`, not `location.key`. `location.key` is new on
                 every navigation, so the subtree was thrown away even when only
                 a query param changed (/ventures?focus=pvl → ?focus=meet).

              3. No `filter: blur()`. The old transition blurred a full-viewport
                 layer, forcing a rasterize-and-re-blur of the entire page on
                 every route change. That was the lag.

              4. A plain div with a CSS animation, not a motion.div. See the
                 `.route-enter` comment in index.css — a JS-driven `opacity: 0`
                 initial state can strand a whole route invisible, and any
                 transform on this element would hijack `position: fixed` for
                 every descendant. */}
          <div
            key={location.pathname}
            className={`route-enter ${isStoryRoute ? "h-full pointer-events-auto" : "flex flex-col min-h-full"} w-full`}
          >
            {/* One Suspense boundary for every lazily-chunked route. It sits
                inside the page-transition wrapper so the fallback fades in
                with the same motion as real content. EntryPage nests its own
                white boundary for the gate. */}
            {isStoryRoute ? (
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            ) : (
              <>
                <main className="flex-1 w-full">
                  <Suspense fallback={<RouteFallback />}>
                    <Outlet />
                  </Suspense>
                </main>
                {!isIntroRoute && (
                  <>
                    {/* End cap spacer to ensure footer is always reachable */}
                    <div className="h-8 flex-shrink-0" aria-hidden="true" />
                    <PageFooter />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

