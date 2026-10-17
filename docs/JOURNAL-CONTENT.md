# Journal content inventory

Source material for the `/journal` section, surveyed 2026-10-16 from the Obsidian
vault and `~/Desktop`. Paths are sources, not copies — nothing has been moved
into this repo yet.

**Read before writing any entry copy:**
`02 Areas/Career/LinkedIn/_Voice Reference.md` and `_Positioning.md` in the
vault. They are the editorial constitution and they are stricter than house
style: no labeled sections, no bullets, no hashtags, no em dashes, no
comment-bait CTAs in post-shaped entries.

---

## DO NOT PUBLISH

This list is a hard gate. Nothing here may be published, quoted, paraphrased,
or used as the basis for an entry, including in rewritten form.

1. **`05 Journal/2026-08-25.md` — asserts a "$100k scholarship."**
   **No scholarship was received.** This is a standing hard stop and it does not
   soften to "finalist," "offered," or "awarded." The vault file is wrong and
   needs correcting at source; see "Handoffs" below.
2. `05 Journal/2026-09-20.md` — grief about parents aging, a named romantic
   interest, a therapist reference. Private.
3. `05 Journal/2026-09-04.md` — same thread, plus laptop value and named
   roommates.
4. `05 Journal/2026-08-09.md` — judgements about named MEET staff and named
   individuals. Reputationally unsafe.
5. `02 Areas/Finances/` (12 files) and
   `~/Desktop/Desktop/CSS_2027-28_MASTER_BRIEF.md` — financial aid, accounts.
6. `~/Desktop/CAREER-BRAIN/CAREER-DOSSIER.md` — self-diagnosis, immigration
   planning, named people.
7. `03 Resources/MIT/Account IDs.md`, `MEGA-RECOVERYKEY.txt` — credentials.
8. `04 People/` (89 files) — private notes on named individuals.
9. Any therapy or DAS-accommodation reference, wherever it appears.
10. `_Idea Bank.md` scaffold meta-commentary.

Rule of thumb for anything not listed: a named third party who did not consent
is a blocker, not a detail to soften.

---

## Publishable now — no rewrite needed

Five pieces are paste-ready. These seed the section.

| Source | Words | Subject |
|---|---|---|
| `~/Desktop/linkedin/drafts/2026-09-PVL-launch.md` | 357 | PVL v1 ship. Lab lineage, 479 commits, 85k lines, 1,275 tests. The flagship. |
| `~/Desktop/linkedin/drafts/2026-08-21-meet-handover.md` | 390 | Leaked API key, $40 burned, Cloudflare Worker proxy. 68 students, Israeli/Palestinian pairing. Strongest narrative he has. |
| `~/Desktop/linkedin/drafts/2026-08-15-dancing-wrap.md` | 297 | Twelve months in the lab, the pegboard career metaphor, jazz. Most personal voice. |
| `~/Desktop/linkedin/drafts/2026-08-15-space-code-of-conduct.md` | 293 | Argument essay on anti-territorial space governance. Finished, never shipped. |
| `~/Desktop/linkedin/drafts/2026-08-10-skills-nobody-ran-B.md` | 226 | 35 skills built, none run by anyone else. Sharpest self-critical piece. |

Near-ready, needs his sign-off rather than editing:

| Source | Words | Note |
|---|---|---|
| `~/Desktop/linkedin/drafts/2026-09-38-terminals.md` | 389 | Context decomposition across 38 sessions. Its own header says he must reread and own it first. |
| `02 Areas/Career/LinkedIn/Drafts/3 Hackathons and the Pivot.md` | 829 | Contains a paste-ready Version A. Only recent piece he wrote himself (Oct 15). Time-decaying. |

## Needs real editing — but the ideas are the differentiated ones

| Source | Words | Note |
|---|---|---|
| `03 Resources/AI and the Future of Teaching.md` | 784 | Syntax errors → API key errors; token-efficiency prediction. His highest-differentiation thesis, in an unpunctuated stream. |
| `03 Resources/Passion Is the Heat.md` | 515 | Passion as heat not light. Founder/VC audience. |
| `03 Resources/The Cooperative Default.md` | 1,123 | Game-theory cooperation. Pairs with the space post. |
| `03 Resources/FEE - Space Code of Conduct.md` | 1,359 | Long-form source for the space post. |
| `05 Journal/2026-07-22.md` | 1,513 | Jazz, Fairouz, a judgement framework. Strip the therapist and people-pleasing material. |
| `03 Resources/Focus and the MIT Trap.md`, `Fear Is the Root.md`, `Knowing When to Stop.md` | ~400 ea | Short insight notes. |

## Back catalog

`02 Areas/Career/LinkedIn/_Published Archive.md` holds **all six published posts
verbatim** (2,009 words): Hamburg/DESY, RoofMate, PVL launch, Shaman hackathon
win, MEET instructor tool, and a 40-name gratitude post.

Consequence: **no LinkedIn export is needed for text.** Hamburg and RoofMate
publish near as-is. The PVL post reads as a press release and needs a rewrite.
The gratitude post is a tag dump — skip it.

Missing from the archive: engagement metrics (`POST-LOG.md` is empty) and the
images that ran with each post.

---

## Schema implications

**Mirror the vault's frontmatter**, which is already consistent:
`created`, `updated`, `tags`, `status`, and `source` on drafts.

**Reuse the existing tag taxonomy** at
`03 Resources/Vault System/_Tag Taxonomy.md` rather than inventing categories.
It is closed and already approved, on three axes:

- Status — `active / pending / done / someday / blocked`
- Type — `idea / insight / question / meeting / lecture / reference / dashboard`
- Domain — `cs / ai / econ / startup / vc / career / finance / research / health / mit`

**Domain is the journal's category axis.** Status and Type stay internal.

**Length is bimodal**, which the layout has to accommodate rather than average:

- Post-shaped: 225–400 words, pure prose, **no headings**
- Essay-shaped: 450–1,400 words, `##` sections with `---` dividers

So the renderer supports headings but must not require them, and the type scale
has to look deliberate at 250 words as well as 1,400.

**`[[wikilinks]]` appear throughout** and need resolving or stripping at import.
No code blocks in any post, so syntax highlighting is not a launch requirement.

---

## Images — the real constraint

`_Performance Log.md` records that **personal photos are his only confirmed
reach driver**; the Hamburg post won on them. So images are not decorative here
and the schema must treat them as first-class.

The problem is that almost nothing is curated:

| Location | Contents | State |
|---|---|---|
| Vault `Attachments/` | 2 images total | No convention, no post mapping |
| `~/Desktop/Pictures/` | 127 HEIC, 92 JPG, 41 MOV | Raw camera-roll names (`IMG_1132.JPG`), unsorted |
| `~/Desktop/Memories/סרטונים של החיים/` | ~40 videos | Same |
| `~/Desktop/DESY/desy_internship/ScreenShots/` | 12 product screenshots (Nov 2025) | Usable for PVL entries |
| `~/Desktop/linkedin/reference/videos/` | 3 copies of one file | Redundant |
| `~/Desktop` root | ~20 loose `Screenshot 2026-*.png` | Unsorted |

There is a shot-list convention in the vault's `Asset Briefs/` worth mirroring
as a per-entry `assets:` field.

**HEIC does not render in browsers** — anything from `Pictures/` needs
converting to AVIF or WebP on the way in.

---

## Handoffs

Things only Said can do. Vault writes are blocked, so these cannot be done here.

1. **Correct `05 Journal/2026-08-25.md`** to remove the $100k scholarship claim.
   It is wrong and it is the kind of error that is fatal if it ever surfaces.
2. **Curate images.** Pick the photos for the first five entries from
   `~/Desktop/Pictures/`; nothing else can do this selection.
3. **Reread and own `2026-09-38-terminals.md`** — its own header asks for this.
4. **Decide on `3 Hackathons and the Pivot.md`**, which decays with time.
