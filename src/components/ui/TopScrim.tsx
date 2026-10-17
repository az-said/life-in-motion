/**
 * TopScrim — a shallow darkening at the top edge of hero media, so the image
 * does not collide with the fixed header above it.
 *
 * Reads `--scrim`, and that token is dark in *both* themes on purpose. A scrim's
 * job is to darken what is underneath it; this one sits on photography, which is
 * its own set of colours regardless of which ground the page is on. Lightening
 * it for the paper theme would not make a gentler scrim, it would make no scrim
 * — and the seam this element exists to hide would come back.
 */
export default function TopScrim() {
  return (
    <div
      className="absolute inset-x-0 top-0 pointer-events-none z-10 h-12 md:h-16"
      style={{
        background: `
          linear-gradient(to bottom,
            rgb(var(--scrim) / 0.6) 0%,
            rgb(var(--scrim) / 0.2) 50%,
            transparent 100%
          )
        `,
      }}
      aria-hidden="true"
    />
  );
}

