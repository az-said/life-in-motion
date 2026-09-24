# Content Infrastructure Map

**Complete audit and documentation of the content system for said-life-in-motion**

This document provides a comprehensive guide to where all content lives, how it's structured, size constraints, and how to edit it safely.

---

## PART A: ORG LOGOS SYSTEM

### Implementation Summary

✅ **Org Registry**: `src/content/orgs.ts`
- Defines `OrgId` union type (MEET, HUJI, DESY, WEIZMANN, MIT, APPSFLYER, BML)
- `ORGS` registry maps OrgId → { id, name, logoSrc, alt }
- Helper functions: `getOrgById()`, `getOrgsByIds()`

✅ **Schema Update**: `src/content/types.ts`
- Added `orgIds?: OrgId[]` to `ContentItem` interface
- `badges?: Badge[]` kept for backward compatibility

✅ **Rendering**: All badge rendering locations updated
- `src/app/views/HonorsPage.tsx`
- `src/app/views/VenturesPage.tsx` (2 locations: flagship + small cards)
- `src/app/views/AtlasPage.tsx` (mobile list view)
- `src/components/atlas/AtlasTimelineGrid.tsx` (desktop grid)
- `src/components/modal/CaseFileModal.tsx`
- All locations now render both `badges` and `orgIds` (no de-duping yet)

✅ **Validation**: `src/content/validateOrgs.ts`
- Dev-only validator warns if orgId is missing from ORGS
- Auto-runs in dev mode via `src/content/items/index.ts`

### Checklist: Where to Put Logos

**Use `orgIds` when:**
- The organization has a logo file in `/public/images/logos/`
- The organization is registered in `src/content/orgs.ts`
- You want consistent logo rendering across the site

**Use `badges` when:**
- You need a text badge (not a logo)
- You need a one-off logo that's not in the registry
- You're migrating legacy content (temporary)

**Naming Convention for Logo Files:**
- Place all logos in `/public/images/logos/`
- Use lowercase, hyphenated names matching the OrgId
- Examples:
  - `MEET` → `meet.png`
  - `HUJI` → `huji.jpg` (or `HUJI.jpg` if already exists)
  - `DESY` → `desy.png` (TODO: add this file)
  - `WEIZMANN` → `weizmann.png` (TODO: add this file)
  - `MIT` → `mit.png`
  - `APPSFLYER` → `appsflyer.png`
  - `BML` → `better_mind_labs_logo.jpeg` (or rename to `bml.jpeg`)

**How to Add a New Org Safely:**
1. Add logo file to `/public/images/logos/` (follow naming convention)
2. Add new `OrgId` to `ORG_IDS` array in `src/content/orgs.ts`
3. Add entry to `ORGS` record with: `id`, `name`, `logoSrc`, `alt`
4. Use `orgIds: ["NEW_ORG_ID"]` in your `ContentItem`
5. Run dev server to see validation warnings if anything is wrong

---

## PART B: CONTENT INFRASTRUCTURE MAP

### 1. ROUTES & FILES

| Route | Page Component | Key Components Used |
|-------|---------------|---------------------|
| `/` | `src/app/views/IntroGatePage.tsx` | `RidahSequence` |
| `/story` | `src/app/views/StoryPage.tsx` | `StoryShell`, `CinematicScene`, `MobileScrollAffordance` |
| `/honors` | `src/app/views/HonorsPage.tsx` | `CaseFileModal`, `LazyImage`, `LazyVideo`, `Badge`, `OrgBadges` |
| `/ventures` | `src/app/views/VenturesPage.tsx` | `CaseFileModal`, `HeroMedia`, `ProofLinksStrip`, `Badge`, `OrgBadges` |
| `/atlas` | `src/app/views/AtlasPage.tsx` | `AtlasTimelineGrid`, `CaseFileModal`, `Badge`, `OrgBadges` |
| `/books` | `src/app/views/BooksPage.tsx` | `CaseFileModal`, `LazyImage` |
| `/about` | `src/app/views/AboutPage.tsx` | Static content (no content files) |
| `/contact` | `src/app/views/ContactPage.tsx` | Static content (no content files) |

**Shared Components:**
- `CaseFileModal` - Modal for detailed content view
- `MediaCarousel` - Image/video carousel
- `Badge` / `OrgBadges` - Organization logos/badges
- `SEOHead` - SEO meta tags
- `Container` - Layout container
- `LazyImage` / `LazyVideo` - Lazy-loaded media

---

### 2. WHERE TEXT LIVES (SOURCE OF TRUTH)

#### Content Files Structure

**Main Content File**: `src/content/items/all.ts`
- **Exports**: `ALL_ITEMS: ContentItem[]`
- **Consumed by**: All page views via filtered exports
- **Structure**: Single array of all content items (ventures, honors, experiences, books)

**Filtered Exports** (from `src/content/items/index.ts`):
- `ventures` - Filtered from `ALL_ITEMS` where `type === "venture"`
- `honors` - Filtered from `ALL_ITEMS` where `type === "honor"`
- `experiences` - Filtered from `ALL_ITEMS` where `type === "experience"`
- `books` - Filtered from `ALL_ITEMS` where `type === "book"`

**Story Timeline**: `src/content/storyTimeline.ts`
- **Exports**: `STORY_TIMELINE_SCENES: StoryTimelineScene[]`
- **Consumed by**: `StoryPage` → `StoryShell`
- **Structure**: Array of scenes with `id`, `title`, `beats` (3 strings), `mediaRef`, `itemIds`

**Meta Data**: `src/content/meta.ts`
- **Exports**: `SITE_TITLE`, `TAGS: Tag[]`
- **Consumed by**: All pages for tags, SEO

**Organization Registry**: `src/content/orgs.ts`
- **Exports**: `ORG_IDS`, `OrgId` type, `ORGS` record
- **Consumed by**: Badge rendering components

#### Content Item Structure (`ContentItem`)

All content items follow this structure (defined in `src/content/types.ts`):

```typescript
{
  id: string;                    // Unique identifier
  type: "venture" | "honor" | "experience" | "book";
  title: string;                 // Internal title
  date: string;                  // Display date (e.g., "jan 2024 - present")
  tags: Tag[];                   // Array of tags from TAGS
  privacy: "public" | "unlisted" | "proof-only";
  media: Media;                  // Media assets (see below)
  card: CardCopy;                // Card display copy (see below)
  beats: string[];               // Array of beat strings (3-5 items)
  caseFile: CaseFile;           // Detailed case file (see below)
  badges?: Badge[];             // Legacy badges (optional)
  orgIds?: OrgId[];             // Organization IDs (preferred)
}
```

**Media Structure**:
```typescript
{
  heroMedia?: MediaRole;         // Optional hero (image/video)
  demoMedia?: MediaRole;         // Optional demo video
  teaserMedia?: MediaRole;       // Optional teaser video
  heroImage: string;             // Fallback hero image (required)
  heroVideo?: string;            // Fallback hero video
  teaserVideo: string;           // Fallback teaser video (required, can be "")
  youtubeUrl: string;            // YouTube link (required, can be "")
  gallery: string[];             // Array of gallery image paths
}
```

**CardCopy Structure**:
```typescript
{
  oneLiner: string;              // Short description (1 sentence)
  headline: string;              // Main headline
  subhead: string;               // Subheadline (optional display)
  microSummary?: string;         // Optional 1-2 line description for cards
}
```

**CaseFile Structure**:
```typescript
{
  context: string;               // Full context paragraph
  whatIDid: string[];           // Array of action items (bullets)
  impact: string[];              // Array of impact items (bullets)
  evidence: Array<{              // Proof links
    label: string;
    url: string;
  }>;
  deepDive: string;              // Extended narrative (can be empty)
}
```

---

### 3. TEXT FIELDS + MEANING

#### ContentItem Fields

| Field | Used For | Required | Mobile/Desktop Difference |
|-------|----------|----------|---------------------------|
| `id` | Internal identifier, URL params | ✅ Required | None |
| `title` | Internal reference, fallback display | ✅ Required | None |
| `date` | Timeline display, sorting | ✅ Required | None |
| `tags` | Tag filtering, display badges | ✅ Required | Desktop shows more tags |
| `card.oneLiner` | Card preview text, list views | ✅ Required | Mobile: line-clamp-2 |
| `card.headline` | Main title (cards, modals, hero) | ✅ Required | Responsive font sizes |
| `card.subhead` | Secondary headline | Optional | Responsive font sizes |
| `card.microSummary` | Admissions-friendly card text | Optional | Used in Atlas grid cards |
| `beats` | Story beats (3-5 items) | ✅ Required | None |
| `caseFile.context` | Modal "Context" section | ✅ Required | Full width, scrollable |
| `caseFile.whatIDid` | Modal "What I Did" bullets | ✅ Required | Bullet list |
| `caseFile.impact` | Modal "Impact" bullets | ✅ Required | Bullet list |
| `caseFile.evidence` | Modal "Evidence" links | Optional | ProofLinksStrip component |
| `caseFile.deepDive` | Modal collapsible section | Optional | Expandable section |
| `badges` | Legacy org logos/text | Optional | Same rendering |
| `orgIds` | Organization logos (preferred) | Optional | Same rendering |

#### Story Timeline Fields (`StoryTimelineScene`)

| Field | Used For | Required | Mobile/Desktop Difference |
|-------|----------|----------|---------------------------|
| `id` | Scene identifier | ✅ Required | None |
| `title` | Scene title overlay | ✅ Required | Responsive font sizes |
| `beats` | Array of exactly 3 beat strings | ✅ Required | Progressive beat reveal in `CinematicScene` |
| `mediaRef` | Background media path | ✅ Required | Full-bleed background |
| `itemIds` | Linked content items | Optional | Clickable links in Story |

---

### 4. SIZE CONSTRAINTS / COPY LIMITS

#### Card Copy Fields

**`card.oneLiner`**
- **Ideal**: 50-80 characters
- **Max recommended**: 120 characters
- **Overflow**: `line-clamp-2` on mobile (AtlasPage list view)
- **Font size**: `text-base sm:text-lg` (16px mobile, 18px desktop)
- **Container**: `max-w-prose` (65ch)
- **Used in**: Card previews, list views, timeline items

**`card.headline`**
- **Ideal**: 30-60 characters
- **Max recommended**: 80 characters
- **Overflow**: `truncate` on BooksPage spines, `line-clamp-2` on Atlas grid
- **Font size**: 
  - Honors/Ventures spotlight: `text-4xl sm:text-5xl lg:text-6xl` (36-60px)
  - Cards: `text-2xl sm:text-3xl` (24-30px)
  - Atlas grid: `text-lg md:text-xl` (18-20px) with `line-clamp-2`
  - Books spines: `text-base sm:text-lg md:text-xl` (16-20px) with `truncate`
- **Container**: Varies by context
- **Used in**: All card titles, modal headers, hero overlays

**`card.subhead`**
- **Ideal**: 40-70 characters
- **Max recommended**: 100 characters
- **Overflow**: Wraps naturally
- **Font size**: `text-xl sm:text-2xl` (20-24px) in hero, `text-lg sm:text-xl` (18-20px) in cards
- **Container**: `max-w-prose` (65ch)
- **Used in**: Hero overlays, card subtitles, modal headers

**`card.microSummary`**
- **Ideal**: 60-100 characters
- **Max recommended**: 140 characters
- **Overflow**: `line-clamp-2` on Atlas grid cards
- **Font size**: `text-sm` (14px)
- **Container**: Atlas grid cards
- **Used in**: Atlas timeline grid cards (desktop)

#### Case File Fields

**`caseFile.context`**
- **Ideal**: 200-400 characters (2-4 sentences)
- **Max recommended**: 600 characters
- **Overflow**: Full paragraph, scrollable in modal
- **Font size**: `text-base md:text-lg` (16-18px)
- **Container**: Modal right panel, full width with padding
- **Used in**: Modal "Context" section

**`caseFile.whatIDid[]` (each bullet)**
- **Ideal**: 50-80 characters per bullet
- **Max recommended**: 120 characters per bullet
- **Overflow**: Wraps naturally
- **Font size**: `text-base md:text-lg` (16-18px)
- **Container**: Modal bullet list
- **Used in**: Modal "What I Did" section

**`caseFile.impact[]` (each bullet)**
- **Ideal**: 50-80 characters per bullet
- **Max recommended**: 120 characters per bullet
- **Overflow**: Wraps naturally
- **Font size**: `text-base md:text-lg` (16-18px)
- **Container**: Modal bullet list
- **Used in**: Modal "Impact" section

**`caseFile.deepDive`**
- **Ideal**: 300-800 characters (3-8 sentences)
- **Max recommended**: 1200 characters
- **Overflow**: Collapsible section, scrollable when expanded
- **Font size**: `text-base md:text-lg` (16-18px)
- **Container**: Modal collapsible section
- **Used in**: Modal "Deep Dive" section (expandable)

**`beats[]` (each beat)**
- **Ideal**: 40-70 characters per beat
- **Max recommended**: 100 characters per beat
- **Overflow**: Wraps naturally in the scene's beat overlay
- **Font size**: `text-lg md:text-xl` (18-20px)
- **Container**: Story page kinetic text overlay
- **Used in**: Story page scene beats

#### Story Timeline Fields

**`beats` (array of 3 strings)**
- **Ideal**: 40-70 characters per beat
- **Max recommended**: 100 characters per beat
- **Overflow**: Wraps naturally
- **Font size**: `text-lg md:text-xl` (18-20px)
- **Container**: Story page kinetic text
- **Used in**: Story page scene animations

**`title`**
- **Ideal**: 20-40 characters
- **Max recommended**: 60 characters
- **Overflow**: Wraps naturally
- **Font size**: Responsive, large in hero overlay
- **Container**: Story page scene title
- **Used in**: Story page scene titles

#### Evidence Links

**`evidence[].label`**
- **Ideal**: 15-30 characters
- **Max recommended**: 40 characters
- **Overflow**: Wraps in ProofLinksStrip
- **Font size**: `text-sm` (14px)
- **Container**: ProofLinksStrip component
- **Used in**: Modal "Evidence" section

---

### 5. VISUAL + RESPONSIVE RULES THAT AFFECT COPY

#### Breakpoints

- **sm**: 640px (small tablets, large phones)
- **md**: 768px (tablets)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)

#### Layout Changes by Page

**Honors Page** (`/honors`):
- **Desktop**: Spotlight hero (full width, 16:9 aspect, max 56vh), timeline list (left-aligned with timeline line)
- **Mobile**: Same structure, smaller font sizes, tighter spacing
- **Text positioning**: Hero overlay (bottom-left), timeline cards (left-aligned)

**Ventures Page** (`/ventures`):
- **Desktop**: Flagship sections (full-width hero, 2-column content grid), small cards (2-column grid)
- **Mobile**: Flagship sections (stacked), small cards (1-column)
- **Text positioning**: Hero overlay (centered glass card), content sections (2-column → stacked)

**Atlas Page** (`/atlas`):
- **Desktop**: Timeline grid (3-column at xl, 2-column at lg), year headers
- **Mobile**: Single-column list view (switches at 900px container width, not breakpoint)
- **Text positioning**: Grid cards (thumbnail + text), list items (horizontal layout)

**Books Page** (`/books`):
- **Desktop**: Book spines (horizontal, cover + title + tags)
- **Mobile**: Same structure, smaller spines
- **Text positioning**: Horizontal spine layout, title truncates

**Story Page** (`/story`):
- **Desktop**: Full-screen cinematic scenes, kinetic text overlay
- **Mobile**: Same structure, smaller text, scroll hints
- **Text positioning**: Centered overlay, kinetic animations

#### Components That Reposition Text

**Hero Overlays**:
- Honors/Ventures spotlight: Bottom-left gradient overlay, text in `max-w-3xl` container
- Story scenes: Centered kinetic text overlay, full-screen background

**Glass Cards**:
- Used in Ventures hero overlays, modal sections
- Text inside padded glass containers with backdrop blur

**Timeline Elements**:
- Honors timeline: Left-aligned with timeline dot, text in cards
- Atlas grid: Thumbnail + text in horizontal card layout

**Modal Layout**:
- Desktop: Split layout (media left, content right, 50/50)
- Mobile: Stacked layout (media top, content bottom)
- Text in right panel, scrollable, sticky header

---

### 6. PLACEHOLDER / "FILL IN" INVENTORY

#### By Page + File Path

**Ventures** (`src/content/items/all.ts`):

- **`empowered`** (id: "empowered"):
  - `card.oneLiner`: "A short sprint where a team tried to build <FILL IN>."
  - `beats[3]`: "<FILL IN>"
  - `caseFile.context`: Contains multiple `<FILL IN>` references
  - `caseFile.whatIDid`: All 3 items are "<FILL IN>"
  - `caseFile.impact`: "<FILL IN>"

- **`meta-hackathon-win`** (id: "meta-hackathon-win"):
  - `card.oneLiner`: "Meta Hackathon winner — <FILL IN>."
  - `card.subhead`: "Presentation link included; details in vault: <FILL IN>."
  - `beats[3]`: "<FILL IN>"
  - `caseFile.context`: Contains `<FILL IN>` references
  - `caseFile.whatIDid`: All 3 items are "<FILL IN>"

**Experiences** (`src/content/items/all.ts`):

- **`dabka`** (id: "dabka"):
  - `caseFile.whatIDid[2]`: "<FILL IN: notable performances/roles if you want to specify>"

- **`meet`** (id: "meet"):
  - `caseFile.whatIDid[2]`: "<FILL IN: specific projects beyond RoofMate if you want listed>"
  - `caseFile.impact`: "<FILL IN: measurable outcomes you want publicly stated (if any)>"

- **`meet-ta`** (id: "meet-ta"):
  - `caseFile.impact`: "<FILL IN: number of sessions/students if you want stated publicly>"

- **`school-leyada`** (id: "school-leyada"):
  - `caseFile.whatIDid[2]`: "<FILL IN: specific school achievements you want summarized from g6 image>"
  - `caseFile.impact`: "<FILL IN: public academic outcomes if you want them stated explicitly>"

- **`volunteering`** (id: "volunteering"):
  - `card.subhead`: "<FILL IN>"
  - `beats[1]`: "<FILL IN>"
  - `caseFile.context`: Contains `<FILL IN>` references
  - `caseFile.whatIDid`: All 3 items are "<FILL IN>"
  - `caseFile.impact`: "<FILL IN>"

**Books** (`src/content/items/all.ts`):

All books have extensive `<FILL IN>` placeholders:

- **`be-useful`** (id: "be-useful"):
  - `date`: "<FILL IN>"
  - `card.subhead`: "<FILL IN: what you took from it>"
  - `beats[1]`, `beats[2]`: "<FILL IN>"
  - `caseFile.context`: "<FILL IN: your personal takeaway from this book>"
  - `caseFile.whatIDid`, `caseFile.impact`: "<FILL IN>"

- **`rich-dad-poor-dad`** (id: "rich-dad-poor-dad"):
  - Same pattern as above

- **`start-with-why`** (id: "start-with-why"):
  - Same pattern as above

- **`the-almanack`** (id: "the-almanack"):
  - Same pattern as above

- **`the-power-of-now`** (id: "the-power-of-now"):
  - Same pattern as above

- **`think-again`** (id: "think-again"):
  - Same pattern as above

- **`7-habits-teen`** (id: "7-habits-teen"):
  - Same pattern as above

#### Summary Count

- **Ventures**: 2 items with placeholders
- **Experiences**: 5 items with placeholders
- **Books**: 7 items with placeholders
- **Total**: 14 content items with `<FILL IN>` placeholders

---

### 7. CONTENT EDITING GUIDE (FOR NON-DEV WRITING)

#### How to Edit Content

**Main Content File**: `src/content/items/all.ts`

This is a large JSON-like array. Each item is a `ContentItem` object. To edit:

1. Find the item by `id` (e.g., `"roofmate"`, `"huji-hackathon-win"`)
2. Edit the specific field you want to change
3. Save the file
4. The site will hot-reload (in dev mode)

**Example: Editing a Venture**

```typescript
{
  id: "roofmate",
  type: "venture",
  // ... other fields ...
  card: {
    oneLiner: "Your new one-liner here",  // ← Edit this
    headline: "Your new headline",          // ← Or this
    subhead: "Your new subhead",           // ← Or this
  },
  // ... rest of item ...
}
```

**Example: Editing Story Timeline**

File: `src/content/storyTimeline.ts`

```typescript
{
  id: "scene-1",
  title: "Your scene title",              // ← Edit this
  beats: [
    "First beat text",                    // ← Edit these
    "Second beat text",
    "Third beat text",
  ],
  mediaRef: "/images/life/...",          // ← Change image path
  itemIds: ["school-leyada"],            // ← Link to content items
}
```

#### Rules for Quotes, Punctuation, Bullet Styles

**Quotes**:
- Use straight quotes (`"`) in JSON/TypeScript
- Use smart quotes (`"` `"`) in displayed text if desired (but be consistent)
- Escape quotes in strings: `"He said \"Hello\""`

**Punctuation**:
- End sentences with periods
- Use em dashes (`—`) for emphasis, not hyphens
- Use ellipses (`...`) sparingly
- Be consistent with Oxford commas

**Bullet Styles**:
- `caseFile.whatIDid` and `caseFile.impact` use bullet points (`•`)
- Start with action verbs when possible
- Keep parallel structure (same verb tense, same sentence structure)
- Example:
  ```typescript
  whatIDid: [
    "Built Android app with Firebase",
    "Implemented matching algorithm",
    "Led team of 5 developers",
  ]
  ```

**Tone Consistency**:
- Write in first person ("I built...", "I led...")
- Use active voice
- Be specific and concrete
- Avoid marketing speak
- Show, don't tell (use evidence, not claims)

#### How to Add New Media

**Adding Hero Image**:
1. Place image in `/public/images/` (appropriate subfolder)
2. Update `media.heroImage` with path: `"/images/life/roofmate/hero.jpg"`
3. Or use `media.heroMedia` for explicit role:
   ```typescript
   heroMedia: {
     type: "image",
     src: "/images/life/roofmate/hero.jpg",
     alt: "Descriptive alt text",
   }
   ```

**Adding Gallery Images**:
1. Place images in appropriate subfolder
2. Add paths to `media.gallery` array:
   ```typescript
   gallery: [
     "/images/life/roofmate/g1.jpg",
     "/images/life/roofmate/g2.jpg",
     // ... more images
   ]
   ```

**Adding Video**:
1. Place video in `/public/teasers/` or appropriate folder
2. Update `media.teaserVideo` or use `media.teaserMedia`:
   ```typescript
   teaserMedia: {
     type: "video",
     src: "/teasers/roofmate-demo.mp4",
     label: "App demo",
   }
   ```

**Media Carousel Order**:
The carousel uses `buildMediaArray()` which prioritizes:
1. `heroMedia` (if exists)
2. `demoMedia` (if exists)
3. `teaserMedia` (if exists)
4. `heroImage` (fallback)
5. `heroVideo` (fallback)
6. `teaserVideo` (fallback)
7. `gallery` images

So if you want a specific order, use the explicit `heroMedia`, `demoMedia`, `teaserMedia` fields.

#### How to Add a New Content Item

1. Open `src/content/items/all.ts`
2. Add a new object to the `ALL_ITEMS` array
3. Follow the `ContentItem` structure (see section 2)
4. Required fields: `id`, `type`, `title`, `date`, `tags`, `privacy`, `media`, `card`, `beats`, `caseFile`
5. Use a unique `id` (lowercase, hyphenated, e.g., `"my-new-item"`)
6. Choose appropriate `type`: `"venture"`, `"honor"`, `"experience"`, or `"book"`
7. Save and check the page where it should appear

#### How to Link Story Scenes to Content Items

In `src/content/storyTimeline.ts`, add `itemIds` to a scene:

```typescript
{
  id: "scene-3",
  title: "Roommates, Not Headlines",
  beats: [...],
  mediaRef: "/images/life/roofmate/hero.jpg",
  itemIds: ["roofmate"],  // ← Links to content item with id "roofmate"
}
```

When users click the scene, they can navigate to the linked content item.

---

### 8. QUICK "READY FOR ADMISSIONS" CHECKLIST

#### Dev HUD Removal

✅ **Status**: Dev HUD is conditionally rendered
- **File**: `src/app/views/StoryPage.tsx`
- **Logic**: Only shows if `import.meta.env.DEV || showDebug` (line 39)
- **Action**: Ensure `import.meta.env.DEV` is false in production build
- **Debug param**: `?debug=1` can still show HUD in production (remove if needed)

**Files to check**:
- `src/app/views/StoryPage.tsx` (line 39-48)
- `src/components/intro/DebugHUD.tsx` (if exists)

#### 404 / SPA Fallback (Vercel)

✅ **Status**: Configured
- **File**: `vercel.json`
- **Current config**:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/"
      }
    ]
  }
  ```
- **Action**: This should work, but test by visiting a non-existent route (e.g., `/test-404`)
- **Expected**: Should serve `index.html` and let React Router handle routing

#### Error Boundaries

✅ **Status**: Implemented
- **File**: `src/components/AppErrorFallback.tsx`
- **Usage**: Set as `errorElement` in router (`src/app/routes.tsx` line 16)
- **Action**: Test by intentionally breaking a component to ensure error boundary catches it

**Files to check**:
- `src/app/routes.tsx` (line 16)
- `src/components/AppErrorFallback.tsx`
- `src/components/ErrorBoundary.tsx` (if used elsewhere)

#### Mobile Safe-Area Padding

**Status**: Unknown - needs verification
- **Check**: Look for `safe-area-inset-*` classes or `env(safe-area-inset-*)` in CSS
- **Files to check**:
  - `src/index.css`
  - `src/App.css`
  - `tailwind.config.ts` (for safe-area utilities)
- **Action**: Test on iOS devices with notches, ensure content isn't cut off

#### Story CTA / Swipe Hints

✅ **Status**: Implemented
- **Files**:
  - `src/components/story/MobileScrollAffordance.tsx`
- **Action**: Test on mobile devices, ensure hints appear and behave correctly
- **Check**: Verify hints disappear after user interaction

#### Additional Pre-Launch Checks

**SEO**:
- ✅ `SEOHead` component exists (`src/components/ui/SEOHead.tsx`)
- Check: Verify meta tags are set correctly for each page
- Check: Ensure Open Graph tags are present

**Performance**:
- Check: Image optimization (lazy loading is implemented)
- Check: Video optimization (lazy loading, autoplay, muted)
- Check: Bundle size (run `npm run build` and check dist size)

**Accessibility**:
- Check: Keyboard navigation (focus traps in modals)
- Check: Screen reader labels (aria-labels)
- Check: Color contrast (verify text is readable)

**Content Completeness**:
- ✅ Placeholder inventory created (see section 6)
- Action: Replace all `<FILL IN>` placeholders
- Action: Verify all media paths are correct
- Action: Test all external links (evidence, proof links)

**Analytics** (if applicable):
- Check: Analytics tracking code (if using)
- Check: Privacy policy compliance

---

## APPENDIX: FILE REFERENCE

### Content Files
- `src/content/items/all.ts` - Main content array
- `src/content/items/index.ts` - Filtered exports + validation
- `src/content/storyTimeline.ts` - Story timeline scenes
- `src/content/meta.ts` - Site meta, tags
- `src/content/orgs.ts` - Organization registry
- `src/content/types.ts` - TypeScript types
- `src/content/validateOrgs.ts` - Org validation utilities

### Page Components
- `src/app/views/IntroGatePage.tsx` - Intro gate
- `src/app/views/StoryPage.tsx` - Story page
- `src/app/views/HonorsPage.tsx` - Honors page
- `src/app/views/VenturesPage.tsx` - Ventures page
- `src/app/views/AtlasPage.tsx` - Atlas page
- `src/app/views/BooksPage.tsx` - Books page
- `src/app/views/AboutPage.tsx` - About page
- `src/app/views/ContactPage.tsx` - Contact page

### Shared Components
- `src/components/modal/CaseFileModal.tsx` - Content detail modal
- `src/components/ui/Badge.tsx` - Badge component
- `src/components/ui/OrgBadges.tsx` - Org badges component
- `src/components/media/MediaCarousel.tsx` - Media carousel
- `src/components/atlas/AtlasTimelineGrid.tsx` - Atlas grid layout

### Configuration
- `vercel.json` - Vercel deployment config
- `tailwind.config.ts` - Tailwind config
- `src/styles/tokens.ts` - Design tokens

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Maintained By**: Content Infrastructure Audit

