import { Suspense, useEffect, useLayoutEffect } from "react";
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

  /*
   * The site is grounded in warm paper; the story and the intro are not.
   * Those two are built around darkness — their imagery is composed against
   * black and the whole effect is stepping into the dark and back out — so
   * they get `data-theme="dark"` and the token block in tokens.css re-grounds
   * everything underneath.
   *
   * On `<html>` rather than on a wrapper because the background field below is
   * a sibling of the page content, not a descendant of it; scoping to the
   * content would leave the field lit while the page went dark. It also lets
   * `color-scheme` follow, which is what darkens the scrollbar and any native
   * control.
   *
   * `useLayoutEffect` so the attribute lands before paint. With a plain effect
   * a direct load of /story shows one frame of the light ground first, and a
   * white flash in front of a cinematic opening is exactly the kind of detail
   * that reads as cheap.
   */
  useLayoutEffect(() => {
    const dark = isIntroRoute || isStoryRoute;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [isIntroRoute, isStoryRoute]);

  return (
    <>
      <ScrollToTop />
      {import.meta.env.DEV && <DebugHelper />}
      {/* Cinematic background, pinned to the viewport.
          Static on purpose. This used to animate the CSS `background` property
          across four radial gradients on `repeat: Infinity`, which is not
          compositor-accelerated — it repainted the full viewport every frame,
          forever, on every route. The two gradients below are the visual
          midpoint of that loop and cost nothing after first paint.

          `fixed` rather than `absolute` now that the document scrolls, so the
          field stays put while content moves over it. It sits first in the DOM
          and the content wrapper below is `relative`, which is what layers them
          — no negative z-index, which behaves differently depending on whether
          an ancestor happens to have a background. */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[rgb(var(--bg-0))]" />

        {/* Glow, off-centre so the field is not perfectly symmetric. Both this
            and the vignette read their colour from a token, because the two
            grounds want different hues and different strengths — the dark
            values on paper would be a cyan wash inside a heavy grey frame. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,var(--glow)_0%,transparent_55%)]" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--vignette)_100%)]" />
      </div>

      {/* Header — `fixed`, and now genuinely fixed to the viewport. Inside the
          old shell it resolved against that element instead, which is what put
          the story skip button 75px off. */}
      {!isIntroRoute && <Header />}

      {/* The page. There is no scroll container any more — the document
          scrolls, so this is just a block of content sitting in normal flow.
          `relative` is what layers it over the fixed background above.

          Story is the one exception. It owns a snap scroller and needs a parent
          with a definite height to size against, so it gets exactly one
          viewport and clamps its own overflow. Everything else gets a minimum
          of one viewport and grows.

          Both the old `overscroll-behavior: contain` declarations are gone on
          purpose. They were there to stop the inner scroller rubber-banding
          past the footer, and the cost was killing the platform's bounce at
          both ends — which is a large part of why scrolling felt dead.

          Five deliberate choices on the keyed wrapper, each of them a bug that
          was:

          1. No AnimatePresence. It ran with `mode="popLayout"`, which keeps the
             outgoing page mounted and applies layout projection to both
             children, leaving the parent's height ambiguous for the length of
             the transition. Story measured itself inside that window, read a
             height of 0, and bailed out of its scroll setup — which is what
             made /story come back blank after navigating away and back.

          2. Keyed on `pathname`, not `location.key`. `location.key` is new on
             every navigation, so the subtree was thrown away even when only a
             query param changed (/ventures?focus=pvl → ?focus=meet).

          3. No `filter: blur()`. The old transition blurred a full-viewport
             layer, forcing a rasterize-and-re-blur of the whole page on every
             route change. That was the lag.

          4. No entry animation. Opacity can strand a whole route invisible if
             the animation freezes on its `0%` frame, which a backgrounded tab
             will do.

          5. No transform either — and this one is now a choice rather than a
             constraint. A transform makes an element the containing block for
             every `position: fixed` descendant, so animating this wrapper would
             re-break the header and the skip button in exactly the way the old
             shell did. Worth knowing before anyone adds a page transition here. */}
      <div
        key={location.pathname}
        /* Named so a modal can mark the page behind it `aria-hidden` without
           knowing the shell's structure. This used to be the scroll container's
           job, which conflated "the thing that scrolls" with "the thing a
           dialog hides" — and broke the moment the document took over
           scrolling. */
        data-app-content=""
        className={`relative w-full ${
          isStoryRoute ? "h-[100dvh] overflow-hidden" : "flex min-h-[100dvh] flex-col"
        }`}
        style={{
          // Header publishes its measured height as --header-h (see Header.tsx).
          // The 67px fallback covers the single frame before the ResizeObserver
          // fires, and matches what the header actually measures today. With
          // border-box sizing this also gives story its viewport-minus-header
          // content box, which is the geometry its snap points were built for.
          paddingTop: isIntroRoute ? 0 : "var(--header-h, 67px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* One Suspense boundary for every lazily-chunked route. EntryPage
            nests its own white boundary for the gate. */}
        {isStoryRoute ? (
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        ) : (
          <>
            <main className="w-full flex-1">
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </main>
            {!isIntroRoute && (
              <>
                {/* End cap spacer so the footer is always reachable */}
                <div className="h-8 flex-shrink-0" aria-hidden="true" />
                <PageFooter />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

