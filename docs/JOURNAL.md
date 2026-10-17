# Work journal

Newest first. One entry per working session. What was decided, what changed,
what was measured, what is still open. Plan and phase status live in
`REBUILD-PLAN.md`; this file is the record of how we got there.

---

## 2026-10-16 (last) — Phase 1b-ii: the ground turns to paper

The values change. `:root` is warm paper with dark ink and a clay accent; the
dark set moves wholesale into `[data-theme="dark"]`, which `AppLayout` puts on
`<html>` for the intro and the story only. Those two routes are composed against
black and stepping into the dark and back out is the point, so they keep it.

`useLayoutEffect`, not `useEffect`. With a plain effect a direct load of /story
paints one frame of paper first, and a white flash in front of a cinematic
opening is exactly the kind of detail that reads as cheap.

**The scoped override is doing real work, and it is measurable.** On /story
`--color-line` resolves to `#ffffff` and `border-line/10` computes to
`oklab(0.999994 … / 0.1)` — Tailwind's `color-mix` rule re-reading the custom
property under the new scope. That is the whole reason 1b-i used plain `@theme`
with literal hex instead of `@theme inline`: one set of class names, two
grounds, no duplicated utilities.

**Three things had the dark ground hardcoded and could not have known.** Each
one was correct, just written in a colour that stopped being true:

- `HeaderBackdrop` painted a five-stop `rgba(10, 10, 12, …)` gradient, so there
  was a black band across the top of every page.
- The header bar animated to `rgba(10, 10, 12, 0.85)` through a Framer `animate`
  object. Same band, and it could not simply be tokenised — Framer cannot
  interpolate a `var()`-backed colour, it writes the string to the style
  attribute and the transition snaps. Replaced with a `data-scrolled` attribute
  and a CSS rule pair. On /story the computed result is byte-identical to the
  old hardcoded values: `rgba(10,10,12,.85)`, `0 12px 40px rgba(0,0,0,.55)`.
- Both error fallbacks rebuild `AppLayout`'s background field, with the cyan
  glow and a 60% black vignette written out by hand. A crash on a paper page
  used to flash a completely different site.

**A shadow is not an opacity.** `--header-shadow` is its own token rather than a
`--scrim` alpha, because the two grounds want different kinds of shadow, not
different strengths of one. A 40px blur at 55% black under a bar on warm paper
does not read as depth, it reads as dirt. Paper gets `0 8px 24px` at 7% and
leans on its hairline border instead.

**The mask paid off exactly as designed.** Eleven credential marks recoloured in
one line — `.cred-rail { color: rgb(var(--fg-0) / var(--cred-rest)) }` — because
`.cred-mark` paints `currentColor` through a mask and never had a colour baked
in. No mark file was rebuilt. This is the second time that decision has saved a
pass over the art.

**Scrim versus vignette, settled by what is underneath.** `TopScrim`,
`HeroMedia`'s bottom blend and corner falloff, and the `HonorsPage` top scrim
all moved to `--scrim`, which stays dark in both themes. They sit on
photography, which is its own set of colours regardless of the page ground;
lightening them would not make a gentler scrim, it would make no scrim. The
vignette token is the opposite case — it frames the *page*, so on paper it goes
almost to nothing.

**A build bug that has been shipping for a while, found by grepping the output
rather than the source.** `.glass` declared `backdrop-filter` then
`-webkit-backdrop-filter`. Lightning CSS treats the pair as one logical property
and keeps whichever comes last, so the built stylesheet contained *only* the
prefixed form and every glass panel rendered flat in Firefox. Reversing the
order emits both. The rule now has a comment on it in `tokens.css`, because the
natural way to write it is the broken way.

**A decorative element was scrolling the whole site sideways on phones.**
`DashboardHero`'s ambient wash is 760px wide, centred with `-translate-x-1/2`,
`max-w-none`, and nothing in its ancestor chain clips. On a 390px viewport it
runs from −185px to 575px; the left overhang is free, the right 185px is real
document overflow. Now `w-[min(760px,100vw)]`, which is full-bleed on a phone
and identical above 760px. Measured in-flow overflow at 390px across all seven
light routes: zero.

**One finding I had to walk back, which is the useful part.** Mid-verification
/about showed its body text at `opacity: 0` and /ventures showed four cards
offset at `x: 30` — far enough right to overflow a 390px viewport. Both looked
like real bugs and I wrote them up as real bugs. They are not. There are 40
Framer `initial={{ opacity: 0, … }}` entry animations across 10 files, they
advance only on `requestAnimationFrame`, and the preview window reports
`document.hidden === true`, so no frames were being painted. Forcing two frames
with screenshots walked the opacity up — 0 → 0.117 → 1 — and both pages
resolved correctly. The animations recover; nothing is stranded.

Worth keeping the correction visible rather than quietly deleting the claim,
because this is the *third* time this session that a frozen frame callback has
produced a convincing false positive. Phase 1a had the same thing: the header
never changed colour on scroll, and the code was right the whole time. Any
assertion about this codebase that depends on a frame having been painted has
to be re-checked against `document.hidden` before it is believed, and a
measurement taken in this harness is only trustworthy for things that are true
at layout time.

What survives as a genuine item for 1f is smaller and different: forty entry
animations gating content on opacity still contradicts the project's own rule —
written into `AppLayout` after `popLayout` blanked /story — and the `x: 30`
offsets do produce horizontal overflow for the duration of the animation on a
narrow screen. That is a real if transient layout effect, and the
transform-only `.reveal` system already in `index.css` is the replacement.

Verified: `tsc --noEmit`, `eslint`, `vite build` clean; no `rgba(10,10,12)` or
literal cyan left anywhere in the built stylesheet; no documentation-sourced
classes; story keeps one viewport (733px content box under a 67px header, 6734px
of snap content) and does not scroll the document.

---

## 2026-10-16 (later still) — Phase 1b-i: semantic colour names, no visual change

Split 1b in two on purpose. This half renames ~280 literal utilities to
semantic ones and is provably pixel-neutral; the next half changes the values.
Keeping them apart means the risky commit is six values rather than 280 files.

**Three names, because the literals were doing three different jobs.** A blind
`white` → `ink` replace would have been wrong: `border-white/10` is a hairline,
`bg-white/5` is a tinted panel, and `bg-black/60` is a scrim. Scrim stays dark
in both themes, because a scrim's job is to darken what is under it — a light
scrim on a light page is not a softer effect, it is no effect.

**What is deliberately not migrated, and why it matters.** Everything in
`components/media/*`, the left half of the case file, the lightbox and the
intro curtains keep literal white and black. Those controls sit on top of
photography and video. They are white because the thing behind them is an
image, not because the theme is dark — tokenising them would have turned every
lightbox control invisible the moment the ground goes light. Found by reading
the call sites rather than trusting the counts; the automated pass runs against
an explicit file list for exactly this reason.

**`@theme` rather than `@theme inline`, and this was not the first attempt.**
The first version defined `--color-line: rgb(var(--line))` so the Tailwind
layer would read straight from the existing channel triplets. It built
cleanly and was completely broken: Tailwind can only apply an opacity modifier
to a value it can parse as a colour, so `border-line/10` emitted
`border-color: rgb(var(--line))` — a *solid white* border where a 10% hairline
belonged — and `ring-line/20` was not generated at all. Caught by grepping the
built stylesheet instead of trusting a clean build. With literal hex in
`@theme`, Tailwind emits `#ffffff1a` plus a `color-mix` rule that reads
`var(--color-line)`, which is both correct now and still overridable per scope
later.

**Tailwind 4 was compiling the documentation.** Its automatic source detection
starts at the git root, so `docs/` was being scanned for class names. Two
rules in the stylesheet served to every visitor came from prose: a
`bg-surface/5` written as an *example* of the migration in `REBUILD-PLAN.md`,
and a `ring-white/10` that is part of the quoted description of **another
website's** design system in `REFERENCE-TEARDOWNS.md`. Fixed with
`@import "tailwindcss" source(none)` plus an explicit `@source "./"`.

**A gradient that has never rendered.** `HonorsPage.tsx:108` paints
`to-[rgb(var(--bg-2))]`, and `--bg-2` was never defined. An undefined custom
property makes the declaration invalid at computed-value time, so that card's
gradient has been silently absent. Defined `--bg-2` as the real second surface
step the system should have had.

**Neutrality proven rather than asserted.** Diffed the full multiset of colour
declarations in the built stylesheet against the previous deployed build. No
colour present before is missing after; no new colour appears. The only
substitution is `#ffffff` → `#f5f5f7` on tinted panels, since `ink` is the text
colour rather than pure white — a half-step out of 255 at 5% alpha. Confirmed
in the browser too: `border-line/10` computes to white at 0.1 alpha, and the
dashboard screenshot is indistinguishable from the one taken before the change.
The only elements still carrying literal `white/` on a page are the two in the
dev-only debug panel, which is excluded by design.

---

## 2026-10-16 (later) — Phase 1a: native document scroll

The shell is gone. `html, body, #root { height: 100%; overflow: hidden }` and
the single `[data-scroll-container]` are deleted; the document scrolls. Eight
files moved together.

**The three structural edits:**

- `index.css` — dropped the three `overflow: hidden` rules and the inert
  `scroll-behavior: smooth`, added `scrollbar-gutter: stable` so a modal can
  clamp `<html>` without the page jumping sideways.
- `AppLayout.tsx` — the outer fixed shell and the inner scroller collapse into
  one keyed wrapper. The background became `fixed inset-0` sitting first in the
  DOM, with the content wrapper `relative` over it; no negative z-index, which
  behaves differently depending on whether an ancestor has a background. Both
  `overscroll-behavior: contain` declarations removed — they were killing the
  platform bounce at both ends, which is a large part of why scrolling felt
  dead.
- `scrollLockManager.ts` — 186 lines to ~100. Clamps `<html>` now. The ~30 lines
  that built two throwaway divs to measure scrollbar width are gone, superseded
  by one CSS declaration. `touch-action: none` is gone too, and that one is a
  deliberate removal rather than a port: it was load-bearing on an inner
  container, but on the document it blocks pinch-zoom, which some people need in
  order to read.

**Two renames rather than mechanical substitutions.** `[data-scroll-container]`
was doing two unrelated jobs. The element a dialog marks `aria-hidden` is not
necessarily the element that scrolls, so `AppLayout` now publishes
`[data-app-content]` for that specifically, and `CaseFileModal` targets it.
`Header`'s listener moved to `window`, which let the duplicate-attach ref guard
go: it existed only because the old `querySelector` could return null and skip
the whole setup-and-cleanup branch.

**Verified in the browser, not assumed.** Document scrolls (`scrollHeight` 2134
over an 800 viewport). Header `position: fixed`, `top: 0`, and its background
crosses from transparent to `rgba(10,10,12,.85)` on scroll. `--header-h`
publishes 61–67px depending on breakpoint and the wrapper's `padding-top`
matches it exactly. No horizontal overflow at 390px wide and no offending
element. `/story` gets exactly one viewport, does not scroll the document, and
its snap scroller keeps all ten scenes at 7172px over a 783px box — 844 minus
the 61px header, which is the geometry its snap points were built for. It also
survives navigating away and back with identical geometry; that was the
AnimatePresence `popLayout` bug that used to return a blank page. The story skip
button now resolves `top: 69px` against the viewport instead of landing 75px
low.

The lock manager was exercised on every path: nested lock stays locked until
both holders release, an extra `unlock()` does not drive the count negative,
`forceUnlock()` drops from 2 to 0, scroll offset survives the round trip
exactly, and `clientWidth` never moves off 390 — which is the
`scrollbar-gutter` claim, measured.

`tsc --noEmit`, `eslint`, and `vite build` all clean.

**One thing worth writing down, because it nearly produced a false negative.**
The first run of every scroll assertion failed: the header never changed colour.
The cause was a zero-height preview viewport, where `requestAnimationFrame`
never fires — and the header's listener is rAF-throttled, so no frame meant no
state update. The code was correct the whole time. This is the same failure
class as the project's existing rule against gating content on a keyframed
opacity: anything that only becomes true inside a frame callback is false
forever in a window that never paints a frame.

**Left alone deliberately:** `color-scheme: dark` and every hardcoded colour,
which belong to 1b. `CaseFileModal`'s RoofMate intro gate and its Escape
handling are pre-existing and untouched — a synthetic `Escape` released the
scroll lock but left the dialog mounted at `opacity: 0` with
`pointer-events: auto`. Not caused by this change, but logged here so it is not
rediscovered as a scroll bug later.

---

## 2026-10-16 — Diagnosis and direction

**Shipped before the pivot:** `29866f8` — the credential rail marks are now
links to each org's official homepage, and TNT joined the community row. Live
and verified: `mono-tnt.png` serves 200, the CSS bundle carries all four
`.cred-link` rules, the JS bundle carries `tnt.so` and `noopener noreferrer`.
Every one of the eleven URLs was checked for a 200 with a browser user-agent,
which caught two that would have shipped broken — MEET's real site is
`meet.org`, not the MIT-side volunteer page, and Weizmann's `/en/` path is dead.

TNT's source art needed a new monochrome recovery mode. Its letters sit inside a
white keyline, so the existing `alpha` mode fused T-N-T into one slab. Added
`keyline` to `scripts/build-marks.py`: a 40-wide ramp just off white, which
works because the source is bimodal — min-channel 19..22 across the letters and
arc, 252..255 on the keyline, almost nothing between.

**Then the brief changed.** Said's verdict on the site as it stands: "my website
right now looks horrible especially the scrolling and on mobile too. its too
wide, and there are things happening in the ui that are just bad." Target style:
steven.com, with villafran.co as a secondary motion reference.

**Found the root cause, and it is architectural rather than cosmetic.** The
entire app is a `position: fixed` shell with `html, body, #root` set to
`overflow: hidden`, and all scrolling happens inside one inner
`[data-scroll-container]`. That single decision explains most of the complaint
list: the mobile URL bar can never collapse because it only retracts when the
*document* scrolls, iOS momentum does not get the native fling curve,
`overscroll-behavior: contain` kills the rubber band at both edges, and
`position: fixed` descendants resolve against the wrong containing block. The
last one is already documented in this repo's own CSS comments — the story skip
button landing 75px low was read as a quirk to patch, but it is the symptom.

Two pieces of dead machinery fall out of the same cause:
`html { scroll-behavior: smooth }` cannot fire on an element that does not
scroll, and the `.scroll-rise` system's `animation-timeline: view()` resolves
against the container rather than the viewport.

Eight files are coupled to the container and have to move together — listed in
`REBUILD-PLAN.md` so the rewire does not miss one.

**Second finding: there is no container system at all.** Nine distinct
`max-w` values and nine padding steps, chosen per component. 23 uses of
`max-w-prose` against 3 of `max-w-7xl`, so a 65-character column and a 1280px
block land on the same page. That is the "too wide."

**Resolved the journal-hosting question with DNS rather than assumption.**
`blog.adamelitzur.com` is a `CNAME` to `hashnode.network` — a hosted platform on
a custom subdomain, not code he wrote. So the pattern being admired is not a
pattern we can copy by building. Chose a `/journal` route on this site instead;
full reasoning in `REBUILD-PLAN.md`, but the deciding factor is Said's own
permanence rule: only a file in this repo survives a platform's business
decisions.

**Decisions taken:** rebuild to native document scroll; propose feature cuts
individually rather than cutting unilaterally; foundation before journal;
journal content sourced from the Obsidian vault, Desktop docs and existing
LinkedIn drafts.

**No code written this session.** The brief was explicit about working
structurally and asking before acting, so this session produced the diagnosis,
the plan, and this journal. Phase 1 starts next.

**Flagged, not yet actioned:** six root-level markdown files, none referenced by
the build, the oldest untouched since January. Triage proposed in the plan.
