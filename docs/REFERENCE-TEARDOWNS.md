# Reference teardowns

Measured 2026-10-16 from live bundles and runtime, not from impressions.
Numbers here are quoted rather than estimated; where something could not be
determined it says so.

Purpose: port *principles* with real values attached. Neither stack is copyable
— steven.com is Webflow + GSAP and villafran.co is React 18 + Tailwind 3 — so
what transfers is the timing, the scale system, and the discipline.

---

## steven.com — the primary reference

### Stack

Webflow shell, jQuery 3.5.1 (Webflow default), and **all motion in one external
1.88 MB esbuild bundle** at `steven-henna.vercel.app/app.js`. Not Webflow
interactions. **No React, no Framer Motion.**

- GSAP 3.13.0 + ScrollTrigger, SplitText, Flip, Draggable, Observer
- Lenis 1.3.4
- Three.js r182 — two canvases
- Taxi.js (`@unseenco/taxi`) for routing, prefetch on

Two things not to copy: production HTML still ships a
`<script src="https://localhost:6545/app.js">`, and the entire motion layer is a
single third-party URL — one point of failure for the whole site's behaviour.

### Scroll — exact config

```js
const MOBILE = () => window.innerWidth < 768;
{
  infinite: false,
  lerp:         MOBILE() ? 1     : 0.1,
  duration:     MOBILE() ? 0     : undefined,
  smoothWheel:  MOBILE() ? false : true,
  touchMultiplier: 1,
  autoResize: true,
  syncTouch: true,
}
```

Desktop is lerp-mode smoothing at **0.1**. **Below 768px, `lerp: 1` plus
`smoothWheel: false` is native scroll** — the smoothing is switched off, not
tuned down.

Lenis is driven by `gsap.ticker.add(t => raf(t * 1000))` with `autoRaf: false`,
so one ticker runs both and ScrollTrigger stays phase-locked. ResizeObserver →
`resize()` → 200ms debounce → `ScrollTrigger.refresh()`. Overlays opt out with
`data-lenis-prevent`.

The homepage **does not scroll at all** — `scrollHeight === innerHeight`
(861px). It is a single-viewport Three.js dial. Subpages run ~4.9 viewports.

### Timing — the whole system is small

Easing counts across the bundle: `power2.inOut` ×107, `power2.out` ×54, `none`
×23, `power3.inOut` ×14, `power1.inOut` ×10, `expo.out` ×7. **Zero custom
cubic-beziers. No CustomEase.** Two easings do roughly 75% of the work.

Durations: **0.5s ×51** is the dominant UI value, then 1 ×24, 0.8 ×10, 0.4,
0.25. The long ones (3, 4, 4.5) are preloader and WebGL only.

Staggers: 0.03 / 0.05 / 0.08, never above 0.1.

GSAP equivalents in CSS terms: `power2.out` ≈ `cubic-bezier(0.22, 1, 0.36, 1)`,
`power2.inOut` ≈ `cubic-bezier(0.64, 0, 0.36, 1)`.

### The signature entrance

Scrubbed per-character opacity, **with no movement at all**:

```js
gsap.set(chars, { autoAlpha: 0.1 });
gsap.timeline({ scrollTrigger: { trigger, start: "top 90%", end: "center 40%", scrub: true } })
    .to(chars, { autoAlpha: 1, stagger: 0.05, ease: "none" });
```

Text literally reads in as you scroll: alpha 0.1 → 1, linear, scrub-bound.
Headlines use SplitText on `chars, words` inside an `overflow: clip` mask.

Note the floor is **0.1, not 0** — the text is always present, only faint.

Property usage across the bundle: `opacity`/`autoAlpha` 205/112 references,
`y`/`yPercent` 203/37, `scaleX` for dividers. **`clipPath` ×1. Blur filters:
zero.** 27 `scrub` instances total and most pins are WebGL — there is no
parallax soup.

### Type — fluid, not breakpointed

Self-hosted woff2, `font-display: swap`: **Field Gothic** (display, uppercase,
condensed), **Host Grotesk** 300/400/600 (body and large headlines), Summertime
Stories for accents.

Every size is a `clamp()` interpolated across a 20rem → 120rem viewport. There
are no type breakpoints.

| Token | Range |
|---|---|
| `--text--body-mini` | 0.6 → 0.75rem |
| `--text--navigation` | 0.75 → 0.875rem |
| `--text--body-reg` | 0.875 → 1rem |
| `--text--body-lg` | 0.875 → 1.25rem |
| `--text--body-xl` | 1 → 1.85rem |
| `--text--title-homepage` | 1.875 → 3.75rem |
| `--text--title-subpage` | 3.125 → 6.87rem |
| `--text--title-callout` | 4.37 → **13rem** |

Measured on the live page: body **15.49px / 25.17px line-height (1.62) /
−0.01em**. Display **63.2px / lh 1.0 / −0.02em, uppercase**. Hero is Host
Grotesk Light 300 at 82.7px, lh 1.0, letter-spacing ≈ 0.

Negative tracking on everything, scaling with size.

### Colour and spacing

`--color--dark #121212`, `--color--light #fff`, red `#ff5541`, blue `#5595ff`,
green `#51b75a`, yellow `#ffdd4b`. **Greys are derived, not authored:**
`color-mix(in hsl, var(--color--bg) 80%, var(--color--text) 20%)`. Theme is
`data-theme` on `<html>` plus localStorage, dark by default.

Spacing is **one token**: `--gap: clamp(1rem, …, 1.25rem)`. Every other step is
`calc(var(--gap) * n)` for n ∈ {0.35, .5, .75, .875, 1.25, 1.5, 1.75, 2, 2.5, 3,
4, 5, 6, 7.5, 8, 9}.

### Layout — and the surprise

Container `max-width: 1920px`, padding `clamp(1.875rem, …, 4.375rem)` (30→70px).
At a 1512px viewport that is 60px gutters and 1392px of content.

**It is not a narrow site.** Lead paragraphs measure 518px ≈ 40ch, but secondary
body text runs up to 841px ≈ 109ch. The restraint comes from **type weight and
colour, not column width** — which is the opposite of the obvious read, and it
matters for how we fix "too wide."

Asymmetric two-column throughout: eyebrow left, body right, large deliberately
empty quadrants.

### CSS transitions are absent

The 96 KB stylesheet contains only a `.1s background-color/color` and one
`.3s all`. **49 of 1219 elements have a non-zero transition-duration.** All
motion is GSAP.

### Mobile

Breakpoints 991 / 767 / 479, four to five rules each. Under 768px smooth scroll
is off entirely. Viewport is locked with `maximum-scale=1, user-scalable=no`
plus `touchmove` preventDefault on multi-touch — **an accessibility regression we
should not copy.** `prefers-reduced-motion` is handled in JS at three call
sites, never in CSS. Hover is gated on
`matchMedia("(hover: none), (pointer: coarse)")`.

**Unknown:** per-element hover tween values; the type scale below 768px beyond
the clamp floors.

---

## villafran.co — the secondary reference

Sourcemaps are public (`/assets/index-C7GSQ3f8.js.map`), so this is read from
real source.

### Stack

Vite SPA, **React 18.3.1, plain `.jsx` — no TypeScript**, react-router-dom v6,
**Tailwind v3**, Sanity CMS, Cloudflare with a strict CSP.

### It has no scroll machinery at all

**Only two motion dependencies:** `framer-motion` v12 and
`@paper-design/shaders-react`.

Confirmed absent: Lenis, Locomotive, GSAP/ScrollTrigger, Three, split-type,
barba, swup, embla, keen-slider. No View Transitions. No scroll-timeline CSS.
`useScroll`/`useTransform` are tree-shaken out entirely.

Total Framer Motion usage in the whole app: `AnimatePresence` ×14,
`layout`/`layoutId` ×3, **`whileInView` ×1**, `variants` ×2, `useReducedMotion`
×2. Route changes are `window.scrollTo({ behavior: "smooth" })`.

### What actually produces the feel

1. **A WebGL gradient.** `<GrainGradient>` from `@paper-design/shaders-react`,
   lazy-imported as its own chunk. Live uniforms:
   `colors: ["#7300ff","#eba8ff","#00bfff","#2b00ff"]`, `colorBack: "#000000"`,
   `softness: .38`, `intensity: .1`, `noise: .25`, `shape: 4`, `scale: 2.44`.
2. **One glass token, everywhere:** `bg-white/5` + `ring-1 ring-white/10` +
   `backdrop-blur-md`.
3. **One mount reveal:** `{opacity:0, y:14} → {opacity:1, y:0}`,
   `duration: .6`, `ease: [0.2, 0.8, 0.2, 1]`. That bezier is its signature.
4. A `layoutId` shared-layout nav pill, three CSS-keyframe gradient orbs
   (`floaty` 8s infinite, staggered 1.2s/2.1s), a sticky `backdrop-blur-xl`
   header.

### Design system

Self-hosted Space Grotesk (display), Inter (body), JetBrains Mono.
h1 60px / lh 60px / w600 / **−1.5px** tracking; h2 30px / lh 36px / −0.75px.

`ink-950 = rgb(2 11 24)`. Accent blue/cyan `#3b82f6 / #38bdf8 / #7dd3fc`.
`shadow-glow = 0 0 0 1px rgba(255,255,255,.06), 0 18px 60px rgba(1,12,28,.62), 0 0 28px rgba(34,211,238,.08)`.

Containers: `max-w-6xl` (72rem) shell, `max-w-3xl`/`2xl` for prose.
Radius `rounded-2xl` for cards, `999px` for pills. Section rhythm
`space-y-10 sm:space-y-12`.

### Mobile gating — the part worth stealing

Handled in JS, with **zero `prefers-reduced-motion` CSS**:

```js
if (matchMedia("(prefers-reduced-motion: reduce)").matches || isMobile) {
  setShowShader(false); setShaderReady(false); return;
}
requestIdleCallback(() => import("./shader-chunk"), { timeout: 1400 });
```

`isMobile = matchMedia("(max-width: 640px)")`. **The shader chunk is never
fetched on phones** — not loaded and hidden, never requested. Same pattern gates
the orbs at 768px with a `requestIdleCallback(timeout: 1600)` and a
`setTimeout(900)` fallback.

---

## What the two agree on

1. **Native document scroll underneath.** Neither fakes the scroll container.
   This is the Phase 1 premise and both references confirm it.
2. **Kill the signature effect on mobile, don't scale it down.** steven drops
   Lenis below 768px; villafran never fetches the shader below 640px.
3. **A tiny motion vocabulary, reused.** Two easings and one dominant duration
   between them. Neither has a long tail of bespoke curves.
4. **One fluid spacing/type system**, authored once as tokens.
5. **Negative letter-spacing on display type**, scaled with size.
6. **Reduced motion handled in JS**, because that is where the decision to skip
   loading lives.

## Where they disagree

| | steven.com | villafran.co |
|---|---|---|
| Smooth scroll | Lenis, lerp 0.1, desktop only | None |
| Entrance | Scrubbed per-char alpha 0.1→1, no movement | One `whileInView`, opacity + y:14 |
| Motion engine | GSAP, ~all of it | Framer Motion, barely used |
| Surfaces | Flat, type-led | Glass + WebGL shader |
| Container | 1920px, 40ch lead / up to 109ch body | 72rem shell / 3xl prose |

So "restraint" is not one recipe. steven gets it from type weight and colour at
a *wide* container; villafran gets it from a narrow container and one effect.
Both work. We have to pick, not average.
