/**
 * HeaderBackdrop — the soft edge under the header.
 *
 * Sits one layer below the bar (z-29 against the header's z-30) and fades the
 * ground out downward, so media scrolling up behind the header stops short of
 * the hairline border instead of touching it. Without it the join between a
 * photograph and the bar is a hard line that moves.
 *
 * The five stops read `--bg-0` rather than the literal `rgba(10, 10, 12, …)`
 * they were written with. Hardcoding the dark ground here meant this element
 * painted a black band across the top of every page the moment the site moved
 * to paper — the gradient was correct, it was just the wrong colour, and it had
 * no way of knowing.
 */

export default function HeaderBackdrop() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[29] pointer-events-none"
      aria-hidden="true"
      style={{
        // One header height. The bar measures 61–67px depending on breakpoint;
        // 4rem plus the safe-area inset covers it without tracking --header-h,
        // and being a few pixels off is invisible on a gradient that ends in
        // transparent anyway.
        height: 'calc(env(safe-area-inset-top, 0px) + 4rem)',
        background: `
          linear-gradient(to bottom,
            rgb(var(--bg-0) / 0.95) 0%,
            rgb(var(--bg-0) / 0.85) 30%,
            rgb(var(--bg-0) / 0.6) 60%,
            rgb(var(--bg-0) / 0.3) 80%,
            transparent 100%
          )
        `,
      }}
    />
  );
}
