# Rebuild Plan — motion, layout, journal

State file. Decisions and phase status live here; reasoning lives in the commit
messages and in `JOURNAL.md`. If a decision changes, it changes here first.

Opened 2026-10-16.

## Target

Two references, carrying different weight:

- **https://steven.com/** — the primary. His words: "this is really like my goal
  in life." Read as: restraint, native scroll, one narrow measure, type doing
  the work, motion you feel rather than notice.
- **https://www.villafran.co/** — secondary, for specific motion techniques.

The gap to close is not decoration. It is that the current site is an app shell
with a hijacked scroller, and both references are documents.

## Locked decisions

| # | Decision | Chosen | Date |
|---|---|---|---|
| 1 | Scroll architecture | Rebuild to **native document scroll**. Delete the fixed shell and `[data-scroll-container]`. | 2026-10-16 |
| 2 | Feature restraint | **Propose cuts, Said decides each.** Nothing is deleted without an explicit yes. | 2026-10-16 |
| 3 | Sequence | **Foundation first, journal after.** | 2026-10-16 |
| 4 | Journal hosting | **`/journal` route on this site.** Not a subdomain, not Substack. See "Journal architecture" below. | 2026-10-16 |
| 5 | Journal content | Sourced from the Obsidian vault, Desktop docs, and existing LinkedIn drafts. | 2026-10-16 |

| 6 | Typeface | **Free, self-hosted woff2.** Display + body pairing, subset, `font-display: swap`. No commercial licence, no external request. | 2026-10-16 |
| 7 | Smooth scroll | **Lenis on desktop, native below 768px.** steven.com's exact config: `lerp 0.1` desktop; `lerp 1` + `smoothWheel: false` under 768px. | 2026-10-16 |
| 8 | Text reveal | **Yes, CSS-driven** via `animation-timeline: view()`, not GSAP. Per-character alpha floor **0.1, never 0**. Simple over clever. | 2026-10-16 |
| 9 | Palette | **Warm light — true Anthropic.** See tokens below. **Supersedes decision 12.** | 2026-10-16 |
| 10 | Journal scope | **Work only.** No therapy, no family, no comparison anxiety, no named third parties without consent. | 2026-10-16 |
| 11 | Life/career thread | **Parked** until Phase 1 ships. Recorded under "Parked" below so nothing is lost. | 2026-10-16 |

Carried forward from the hero work:

| # | Decision | Chosen | Status |
|---|---|---|---|
| 12 | Accent | Cyan, pushed saturation — `--accent: 34 211 238` | **SUPERSEDED by 9.** Accent is now clay `#CC785C`. |
| 13 | Direction | Bold hero, clean body | Still in force, reinterpreted for a light ground |
| 14 | Intro | Photo bridges intro → page | Still in force, and **now easier** — the gate is already a white breathe screen, so a warm-light body removes the white→black cut that was the harshest moment on the site |

## Target tokens — warm light

```
ground    #F5F4EE   warm paper
surface   #FFFFFF / #EDEAE0
text      #191919 primary / #3D3D3A secondary
accent    #CC785C   clay
border    rgba(25, 25, 25, 0.10)

display   serif, light weight, -0.02em tracking
feel      quiet, editorial, expensive
```

Note the recorded preference this overrides: muted sage and earth tones have
previously read as "dead and grey" to him. He chose this direction with that
flagged, so the risk is accepted — but if it reads grey in practice, the fix is
contrast and type weight, not a return to neon on black.

## Cost of the inversion — measured, not estimated

The entire site is built dark, with **369 hardcoded colour references** that
assume it:

| Pattern | Count |
|---|---|
| `border-white/10` | 81 |
| `bg-white/5` | 50 |
| `border-white/20` | 38 |
| `bg-white/10` | 29 |
| `ring-white/20` | 23 |
| `border-white/30` | 18 |
| `text-white` | 15 |
| `ring-white/40` | 15 |
| all other `*-white*` | 47 |
| all `*-black*` | 53 |

Only six tokens exist today (`--bg-0`, `--bg-1`, `--fg-0`, `--fg-1`, `--line`,
`--accent`), so almost every surface, border and ring was authored by hand.

**This is not a detour from the brief — it is the brief.** 369 ad-hoc colours
and nine arbitrary widths are the same defect, and they are what "things
happening in the UI that are just bad" actually refers to. The migration
replaces them with a small set of semantic tokens, which is the work that has to
happen whether or not the theme flips.

Approach: define semantic colour utilities in Tailwind 4's `@theme`, then
migrate the patterns mechanically — `border-white/10` → `border-line/10`,
`bg-white/5` → `bg-surface/5`. Scripted, but verified in batches rather than one
sweep.

**One thing that already works in our favour:** the credential marks are drawn
as a mask over `currentColor`, not as `<img>`. A mask keys on alpha, so the same
white-on-transparent files tint to dark ink on a light ground with a single
`color` change. Had they shipped as pre-whitened images they would have been
invisible and all eleven would need rebuilding.

## Root-cause diagnosis

Recorded because every phase below depends on it.

**The whole app is a `position: fixed` shell with one inner scroller.**

- `src/index.css:13` — `html, body, #root { height: 100%; overflow: hidden }`
- `src/app/layout/AppLayout.tsx:23` — `<div className="fixed inset-0 ... h-[100dvh]">`
- `AppLayout.tsx:51` — `data-scroll-container`, the only thing that scrolls

Consequences, all of them observed rather than theorised:

1. **Mobile URL bar never collapses.** It retracts only when the *document*
   scrolls. Permanent loss of 60–100px of phone viewport.
2. **iOS momentum is wrong.** Inner scrollers do not get the native fling curve,
   and `overscroll-behavior: contain` (`AppLayout.tsx:60`) removes the rubber
   band, so both edges feel dead.
3. **`position: fixed` descendants resolve against the wrong box.** Documented
   in this repo's own CSS comments — the story skip button landing 75px low is
   this bug, not a quirk needing a patch.
4. **`html { scroll-behavior: smooth }` (`index.css:9`) is dead code.** `html`
   does not scroll.
5. **`animation-timeline: view()`** — the entire `.scroll-rise` system — resolves
   against the container, not the viewport.
6. **Native scroll restoration is gone.** Hence `ScrollToTop.tsx`, and hence
   seven files reaching for `querySelector('[data-scroll-container]')`.

Files coupled to the scroll container, all of which have to move together:

```
src/app/layout/AppLayout.tsx
src/index.css
src/components/layout/Header.tsx            (:50, :60)
src/components/layout/ScrollToTop.tsx       (:23, :24)
src/components/modal/CaseFileModal.tsx      (:166)
src/components/debug/DebugHelper.tsx        (:25)
src/utils/scrollLockManager.ts              (:28)
src/hooks/useScrollContainerLock.ts
```

**Second finding: there is no container system.** Widths in use across pages —
`max-w-7xl`, `6xl`, `5xl`, `4xl`, `3xl`, `2xl`, `prose`, `[95vw]`, `none` — with
`px-16 / 12 / 8 / 6 / 5 / 4 / 3 / 2 / 0` padding. 23 uses of `max-w-prose`
against 3 of `max-w-7xl`, which puts a 65-character column and a 1280px block on
the same page. This is the "too wide" complaint and most of the "things
happening in the UI that are just bad."

## Journal architecture

`blog.adamelitzur.com` resolves `CNAME → hashnode.network`. It is **Hashnode**, a
hosted platform on a custom subdomain — not his code. The reference pattern is
therefore "platform wearing my domain," which is not what we are copying.

Chosen instead: **`/journal` on this site**, because

1. The permanence rule — "just push to github, and its all updated" — is only
   satisfied when the content is a file in this repo. A platform is a dependency
   with a business model.
2. One domain on one business card. A subdomain is a second SEO property, both
   weaker than one, plus a second thing to explain at a booth.
3. LinkedIn is already the distribution. The journal is the destination, so
   Substack's recommendation engine buys nothing.
4. An email list, the one real argument for Substack, can be an embed later
   without moving a single entry.

## Phases

### Phase 1 — Foundation

Ordered deliberately. Scroll first because it is self-contained, independently
verifiable, and the felt improvement is immediate. Theme second because it is
the largest and riskiest. Type and motion last because they are judged against
the finished ground.

- [x] **1a. Native document scroll.** *Done 2026-10-16.* Fixed shell deleted,
      eight files rewired off `[data-scroll-container]`, no colour changes.
      `scrollbar-gutter: stable` replaced the JS scrollbar measurement;
      `touch-action: none` dropped (blocks pinch-zoom on the document);
      `overscroll-behavior: contain` dropped (was killing the platform bounce).
      The container's two jobs were split — `[data-app-content]` now names the
      element a dialog hides. Verified: document scrolls, header pins and
      reacts, `/story` keeps one viewport and survives a nav round-trip, skip
      button resolves against the viewport, lock is correct under nesting with
      zero width shift. See `JOURNAL.md`.
- [x] **1b. Semantic colour tokens + warm-light inversion.** *Done 2026-10-16,
      in two commits.* `59b9a98` renamed ~280 literals to `line` / `ink` /
      `scrim` and was proved pixel-neutral by diffing the colour multiset of the
      built stylesheet against the deployed one. `1027faf` changed the values:
      `:root` is paper, the dark set lives in `[data-theme="dark"]`, applied to
      `<html>` for the intro and story only. Media chrome keeps literal white
      and black on purpose — those controls sit on photography, not on a theme.
      See `JOURNAL.md`.
- [ ] **1c. Type.** Self-hosted woff2 pairing, fluid `clamp()` scale across
      20rem→120rem (steven.com's method — no type breakpoints), negative
      tracking scaled with size.
- [ ] **1d. One container system.** Replaces nine ad-hoc `max-w` values. Not
      "narrower" — steven.com runs a 1920px container with body text to 109ch
      and gets its restraint from type weight and colour.
- [ ] **1e. One spacing rhythm.** Single `--gap` token, every step
      `calc(var(--gap) * n)`.
- [ ] **1f. Motion primitives.** Two easings and one dominant duration, per the
      teardowns. Plus the scroll-scrubbed per-character reveal (decision 8) and
      the self-drawing signature (below).
      **Promoted to a correctness fix, not a polish pass.** 40 Framer
      `initial={{ opacity: 0, … }}` entry animations across 10 files strand on
      their first frame whenever `requestAnimationFrame` does not run — a
      backgrounded tab, a zero-height viewport. Observed: /about renders its
      body text at `opacity: 0`, and /ventures freezes four cards at `x: 30`,
      which produces horizontal overflow as well. This is the same failure the
      `AppLayout` comment already warns about after it blanked /story. Files:
      `AboutPage`, `AtlasPage`, `BooksPage`, `ContactPage`, `DashboardPage`,
      `VenturesPage`, `IntroGatePage`, `RidahSequence`, `CinematicScene`,
      `YouTubeEmbed`. The replacement is the existing transform-only `.reveal`
      system in `index.css`, whose worst case is "it did not move" rather than
      "it is not there".
- [ ] **1g. Lenis**, desktop only, driven off one ticker. Last, because it
      depends on 1a.
- [ ] Verify at real device widths, not a narrow desktop window

### Self-drawing signature

Asked for as an intro element. SVG path with `stroke-dasharray` animated via
`stroke-dashoffset`. Pure CSS, no JS, and the failure mode is a fully drawn
signature rather than a missing one — which satisfies the standing rule that
nothing may hide content behind a script.

Needs from Said: a signature image or a photo of his signature on paper, so it
can be traced to a path.

### Phase 2 — Restraint pass
- [ ] Per-feature audit with a recommendation each (decision 2 — Said approves individually)

### Phase 3 — Journal
- [ ] Content schema modelled on his actual writing
- [ ] `/journal` index + entry route
- [ ] Image handling
- [ ] Seed with real entries

## Parked — not portfolio work, not forgotten

Raised 2026-10-16 and deliberately deferred (decision 11). These need the
CAREER-BRAIN dossier and his calendar open, not a footnote at the end of a CSS
session. **Two of them have real deadlines and should not wait for Phase 3.**

- **ASE decisions** — Bio, 18.06, 18.03, 8.02. Dated, external, blocking.
- **Harvard HASS electives** — candidates he listed: PHIL 156 Philosophy of
  Mind, PHIL 178X Equality and Liberty, PHIL 166 Ethics of Computing
  Technologies, GENED 1179, GENED 1038 Sleep, PSY 1, ECON 1011A. Plus a request
  for a full multi-semester course road.
- **Learning goals** — crypto, trading, investing.
- **Information plumbing** — Twitter/LinkedIn/news into one low-notification
  reading surface; AI into Outlook and news.
- **Scheduling habit** — lock study time for the quarter; add sports/gym.
- **The comparison thread** — feeling behind peers who skipped the standard
  path. Related to a recorded diagnosis in CAREER-BRAIN: he builds trackers and
  does not run the loop, so plan him with dated external gates rather than
  weekly habits.
- **Private material** — his psychiatrist's advice about boxing the startup
  dream, finding passion slowly, and scheduling unstructured thinking time. Not
  journal content (decision 10). Relevant to how the schedule gets built.

## Open questions

- LinkedIn drafts may exist only on LinkedIn. If so, he has to export or paste
  them — no connector reaches that.
- Interlock still has no imagery. Asked repeatedly, still unanswered.
- Only a half-frame studio portrait exists, which is why mobile falls back to the
  weaker candid shot. A full-frame version would replace both.

## Stale files to triage

Root-level markdown, none of it referenced by the build:

| File | Lines | Last touched |
|---|---|---|
| `AUDIT_FIXES_APPLIED.md` | 96 | 2026-01-13 |
| `AUDIT_REPORT.md` | 81 | 2026-09-23 |
| `CONTENT_AUDIT_REPORT.md` | 229 | 2026-01-13 |
| `CONTENT_INFRASTRUCTURE_MAP.md` | 750 | 2026-09-23 |
| `ORG_LOGO_CHECKLIST.md` | 163 | 2026-01-13 |
| `README.md` | 97 | 2026-01-01 |

Proposal: fold anything still true into this file or `CLAUDE.md`, delete the
rest, rewrite `README.md`. Pending decision 2.
