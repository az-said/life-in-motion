# Work journal

Newest first. One entry per working session. What was decided, what changed,
what was measured, what is still open. Plan and phase status live in
`REBUILD-PLAN.md`; this file is the record of how we got there.

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
