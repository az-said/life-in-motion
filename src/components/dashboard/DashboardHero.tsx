import { Download, Github, Linkedin, Mail, Phone } from "lucide-react";
import {
  CANDID_PORTRAIT,
  CREDENTIAL_RAIL,
  PROFILE,
  STUDIO_PORTRAIT,
} from "../../content/profile";

/**
 * DashboardHero — the first screen a recruiter sees, and on desktop the second
 * half of the intro.
 *
 * Two jobs, in this order:
 *
 *   1. Say who he is in under two seconds. Oversized name, one-line pitch, the
 *      six institutions that do the vouching, then the CV. Text plus one image,
 *      no fetch, no video, no layout that waits on JavaScript.
 *
 *   2. Catch the handoff from the gate, on desktop.
 *
 * The handoff is the part worth explaining. The gate's white breathe screen
 * pins the studio half-portrait to a box that is the full viewport: right edge,
 * top edge, `100dvh` tall, `clamp(320px, 30vw, 520px)` wide, `object-contain`
 * under a left-to-right fade (RidahSequence). This hero reproduces that box
 * exactly. So crossing from the intro to the page moves the face by zero
 * pixels — only the field behind it goes from white to black, and
 * `hero-settle` takes up the last 6% of scale so the arrival still has weight.
 *
 * "Exactly" is load-bearing and it is the reason the panel is not a child of
 * anything positioned. `object-contain` derives the drawn width from the box
 * height, so a panel that merely hugs the right edge but is shorter than the
 * viewport draws a visibly smaller face — measured at 1440×900, a header-height
 * panel rendered it 191px wide against the gate's 308px, which reads as the
 * photo jumping away rather than settling. The panel therefore resolves against
 * the scroll container (the nearest positioned ancestor, padding box = the
 * viewport) and the header itself must stay unpositioned for that to hold.
 *
 * That is why the panel is duplicated markup rather than a shared layout
 * animation: two elements that were never going to move cannot mismatch, and a
 * shared-element transition across a route change is a machine with several
 * ways to strand a face mid-flight. The old version cut white straight to
 * black with nothing carried across, which is the cut that read as broken.
 *
 * Both sides are keyed off the same constants. If the gate's panel width or
 * mask changes, this one changes with it or the bridge quietly stops landing.
 */

/**
 * Must track the gate's panel in RidahSequence — see the note above.
 *
 * The gate sets this to `clamp(320px, 30vw, 520px)` flat and lets
 * `object-contain` letterbox inside it. The extra `min()` here shrinks the box
 * to the width the image is actually drawn at, which changes nothing about
 * where a single pixel of the face lands — `object-contain` was already
 * height-bound and right-aligned — but it does put the box edge on the image
 * edge, which is what the mask needs.
 *
 * Without it the fade is dead weight: mask stops are percentages of the
 * element, so a 25% fade across a 432px box ends at 108px while the image only
 * begins at 124px. Every fade stop lands on empty space and the photo starts at
 * full opacity with a hard vertical edge. On the gate's white screen that edge
 * is invisible — the studio backdrop is near-white — which is why it survived
 * there. On this page it is a lit grey slab butted against black.
 *
 * 483/1413 is the portrait's aspect ratio. If the file is replaced, this
 * changes with it.
 */
const STUDIO_PANEL_WIDTH =
  "min(clamp(320px, 30vw, 520px), calc(100dvh * 483 / 1413))";
const STUDIO_PANEL_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 2%, rgba(0,0,0,0.3) 5%, rgba(0,0,0,0.5) 8%, rgba(0,0,0,0.7) 12%, rgba(0,0,0,0.85) 18%, black 25%)";

export default function DashboardHero() {
  return (
    <header className="lg:min-h-[30rem]">
      {/* ---------- Studio portrait, desktop only ----------
          Deliberately absolute with no positioned ancestor inside this file, so
          it resolves against the scroll container — whose padding box is the
          viewport. `top-0 right-0 h-[100dvh]` is then the gate's panel to the
          pixel, which is the whole point (see the note above).

          `-z-10` keeps it behind every line of text on the page, including the
          stats row it reaches past. It scrolls away with the content because an
          absolutely positioned child of a scroll container scrolls with it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-[100dvh] lg:block"
        style={{ width: STUDIO_PANEL_WIDTH }}
      >
        <img
          src={STUDIO_PORTRAIT}
          alt=""
          width={483}
          height={1413}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="hero-settle h-full w-full object-contain object-right"
          style={{ maskImage: STUDIO_PANEL_MASK, WebkitMaskImage: STUDIO_PANEL_MASK }}
        />
        {/* Bottom fade. The gate's panel ends where the screen does; this one
            runs on into the page, so it has to stop somewhere that is not an
            edge. Dissolving into the page colour is the only cut that leaves
            no line. */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgb(var(--bg-0)),transparent)]" />
      </div>

      <div className="relative grid items-center gap-8 lg:block">
        {/* Ambient accent wash. Decorative, sits behind everything, costs no
            layout. It is the only thing on the page that is not black or text,
            and it is what keeps the hero from reading as a terminal window.
            It lives in here rather than directly under <header> because the
            header has to stay unpositioned for the portrait panel above to
            reach the viewport. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[760px] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.22),transparent)] blur-3xl lg:left-auto lg:right-0 lg:translate-x-0"
        />

        {/* ---------- Candid portrait, phones only ----------
            A phone never sees the gate, so there is nothing to bridge from and
            no reason to use a half-face. It leads because a face before a wall
            of text is what makes someone at a booth keep reading. */}
        <div className="reveal order-1 lg:hidden">
          <div className="relative mx-auto aspect-square w-44 sm:w-56">
            <img
              src={CANDID_PORTRAIT}
              alt={`${PROFILE.name}, ${PROFILE.classYear}`}
              width={840}
              height={900}
              // eager + high priority: on a phone this is the LCP element.
              // Lazy-loading it puts a hole at the top of the page.
              loading="eager"
              fetchPriority="high"
              decoding="async"
              // Shot against a near-white wall, which on a dark page would
              // land as a bright rectangle stapled to the corner. The radial
              // mask holds the face and dissolves the wall, so the image has
              // no edge to look pasted along.
              className="hero-settle h-full w-full object-cover object-[52%_35%] [mask-image:radial-gradient(closest-side,#000_52%,transparent_92%)]"
            />
          </div>
        </div>

        {/* ---------- Name, pitch, credentials ----------
            Capped short of the portrait panel on desktop so the two never
            collide, whatever the viewport does. */}
        {/* The cap is what keeps the text off the portrait. The panel's drawn
            edge reaches about 8rem into this header's box and the first ~2rem
            of that is under the mask's fade, so 13rem of clearance is the
            portrait plus room to spare — and 42rem is wide enough that the
            action row stays on one line instead of orphaning its last icon. */}
        <div className="order-2 lg:max-w-[min(42rem,calc(100%-13rem))] lg:py-6">
          <h1 className="reveal text-[clamp(2.75rem,9vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[rgb(var(--fg-0))]">
            {PROFILE.name}
          </h1>

          <p className="reveal reveal-1 mt-4 text-[clamp(1.1rem,3.6vw,1.75rem)] font-medium leading-snug tracking-[-0.015em] text-[rgb(var(--fg-0))]">
            <span className="bg-[linear-gradient(to_right,rgb(var(--accent)),rgb(var(--fg-0)))] bg-clip-text text-transparent">
              {PROFILE.pitch}
            </span>
          </p>

          <p className="reveal reveal-2 mt-3 text-sm leading-relaxed text-[rgb(var(--fg-1))] sm:text-base">
            {PROFILE.classYear} · {PROFILE.courseCode} — {PROFILE.course} ·{" "}
            {PROFILE.location}
          </p>

          {/* Credential rail. Set as type rather than logos — see the note on
              CREDENTIAL_RAIL for why the logo files cannot carry this row. */}
          <div className="reveal reveal-3 mt-7 border-t border-white/10 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--fg-1))]/45">
              Selected by
            </p>
            <ul className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-4">
              {CREDENTIAL_RAIL.map((name, i) => (
                <li key={name} className="flex items-center gap-x-3 sm:gap-x-4">
                  {/* Dividers only where the rail fits on one line. A wrapped
                      row puts a divider at the start of the second line with
                      nothing to its left, which reads as a typo. Below `sm`
                      the gap carries the separation on its own. */}
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-3 w-px bg-white/15 sm:block"
                    />
                  )}
                  <span className="text-[13px] font-semibold tracking-[-0.01em] text-[rgb(var(--fg-0))]/85 sm:text-[15px]">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Actions ----------

              On a phone this is a priority stack, not a wrapping row.

              Measured at 386px, `flex flex-wrap` produced two ragged lines —
              [Download CV][az_said@mit.edu] then [phone][in][gh] — so the one
              action that matters sat beside an email address and did not read
              as primary. Every control was also 38–42px tall, under the 44px
              minimum a thumb actually needs.

              Now: stacked and full-width below `sm`, each row a real tap
              target, ordered by what someone at a booth reaches for first. At
              `sm` and up `sm:contents` dissolves the grouping wrapper and the
              children rejoin the inline row, so the laptop layout is
              unchanged. */}
          <div className="reveal reveal-4 mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <a
              href={PROFILE.cvPath}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--fg-0))] px-4 text-sm font-semibold text-[rgb(var(--bg-0))] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-0 sm:w-auto sm:justify-start sm:py-2.5"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download CV
            </a>

            {/* The full address stays visible on a phone — it is the most
                useful string on the page — so it gets its own row instead of
                being crushed into half a line. */}
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-0 sm:w-auto sm:justify-start sm:py-2.5"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {PROFILE.email}
            </a>

            <div className="flex gap-2.5 sm:contents">
              <a
                href={`tel:${PROFILE.phoneHref}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-0 sm:flex-none sm:py-2.5"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{PROFILE.phone}</span>
              </a>

              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-white/15 text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:h-auto sm:w-auto sm:p-2.5"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-white/15 text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:h-auto sm:w-auto sm:p-2.5"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
