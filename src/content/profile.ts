/**
 * Recruiter profile — the single source of truth for the front door.
 *
 * Every fact here is traceable to Said_Azaizah_CV_SBC_2026-09.pdf. If a number
 * changes, it changes here first, then in the CV source, and nowhere else.
 *
 * Rule: no claim in this file may be softer or harder than the CV. The site and
 * the PDF are read side by side by the same person.
 */

/**
 * The actual PDF on disk. Only two places may reference this filename: the
 * vercel.json redirect and CvRedirect. Everything user-facing links to `/cv`,
 * which is the permanent, card-printed URL.
 */
export const CV_FILE = "/Said-Azaizah-CV.pdf";

/**
 * Two portraits, because the two arrival paths need different things.
 *
 * STUDIO is the half-frame the desktop gate already puts against the right edge
 * of the white breathe screen. The dashboard hero re-renders that same file, at
 * the same width, against the same edge — so crossing from the intro to the
 * page leaves the face exactly where it was and changes only what is behind it.
 * That is the whole bridge: nothing travels, so nothing can land wrong.
 *
 * CANDID is a square crop for phones, which never see the gate and so have
 * nothing to bridge from. The studio frame is literally half a face, cropped
 * down the midline to sit against a screen edge; in a circle it reads as a
 * mistake. Warm and whole beats moody and severed at a career-fair booth.
 *
 * If a full-frame version of the studio shoot turns up, it replaces both.
 */
export const STUDIO_PORTRAIT = "/images/portrait-half.jpg";
export const CANDID_PORTRAIT = "/images/profile/hero-portrait.jpg";

export const PROFILE = {
  name: "Said Azaizah",
  /** Printed on the business card, spoken at every booth. Keep it five words. */
  pitch: "Research infra @ Technion & DESY",
  course: "Computer Science + Economics + Data Science",
  courseCode: "Course 6-14",
  classYear: "MIT '30",
  location: "Cambridge, MA",
  site: "saidazaizah.com",
  siteUrl: "https://saidazaizah.com",
  email: "az_said@mit.edu",
  phone: "+1 617 803 5357",
  phoneHref: "+16178035357",
  linkedin: "https://www.linkedin.com/in/said-azaizah",
  github: "https://github.com/az-said",
  cvPath: "/cv",
} as const;

/** Headline numbers. Four is the limit — a fifth turns a claim into a list. */
export const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "4", label: "labs running PVL" },
  { value: "50+", label: "researchers served" },
  { value: "7,000+", label: "users shipped to" },
  { value: "3", label: "languages, full RTL" },
];

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  org: string;
  period: string;
  /** One line. If it wraps past two on mobile, it is too long. */
  summary: string;
  /** Hard numbers only. No adjectives. */
  metrics: string[];
  links: ProjectLink[];
  /** Deep-dive route on this site, when the admissions archive has the story. */
  more?: string;
}

export const PROJECTS: ReadonlyArray<Project> = [
  {
    id: "pvl",
    name: "Peptide Visual Lab",
    role: "Lead Developer",
    org: "Technion (Prof. Meytal Landau) / DESY-CSSB, Hamburg",
    period: "Sep 2025 — present",
    summary:
      "Structure-prediction platform for amyloid and antimicrobial peptide research.",
    metrics: [
      "50+ researchers across 4 labs",
      "~30 lab-hours/week saved",
      "Adopted by HIFIS (Helmholtz Association)",
      "$600+/month saved off managed cloud",
      "Open-source, MIT-licensed, 2 PyPI packages",
    ],
    links: [
      { label: "Docs", href: "https://az-said.github.io/peptide_prediction/" },
      { label: "Code", href: "https://github.com/az-said/peptide_prediction" },
    ],
    more: "/ventures?focus=pvl-internship",
  },
  {
    id: "interlock",
    name: "Interlock",
    role: "Co-Founder",
    org: "Battle of the Coasts — Cloud AI track",
    period: "Sep 2026 — present",
    summary:
      "Commit-gate and receipt layer that makes AI-agent payments at-most-once and auditable.",
    metrics: [
      "Plain retry pays wrong in 9 of 10 injected faults; the gate, 0",
      "Validated on live Stripe test mode",
      "Public claims ledger — every published number reproduced by a script in the repo",
    ],
    links: [{ label: "Live", href: "https://interlock-self.vercel.app" }],
    more: "/ventures?focus=interlock",
  },
  {
    id: "meet-crowdfunding",
    name: "MEET Crowdfunding",
    role: "Technical Product Manager",
    org: "MEET — Middle East Entrepreneurs of Tomorrow",
    period: "2026",
    summary:
      "Investment platform for student startups, built solo end to end.",
    metrics: [
      "7,000+ users across 14 student startups",
      "Shipped in 44 days",
      "Three languages with full RTL",
      "React · TypeScript · Supabase · Cloudflare",
    ],
    links: [{ label: "Live", href: "https://meet-kickstarter.com" }],
    more: "/ventures?focus=meet",
  },
  {
    id: "roofmate",
    name: "RoofMate",
    role: "Co-Founder & CTO",
    org: "AppsFlyer Accelerator",
    period: "Jan 2024 — present",
    summary:
      "Roommate matching for Israeli and Palestinian students, matched on habits rather than nationality.",
    metrics: [
      "500+ signups, 4 university partnerships, Haifa pilot planned",
      "11-person team shipped the Android MVP",
      "Bias-aware matching on MongoDB vector search + HuggingFace embeddings",
    ],
    links: [
      { label: "Code", href: "https://github.com/az-said/RoofMateExpoNight" },
    ],
    more: "/ventures?focus=roofmate",
  },
];

/**
 * Short credibility line under the projects. Institutions, not adjectives.
 *
 * Every entry is a selection someone else made — an admission, a placement, a
 * win. That is the only thing this row is for. The moment a chip becomes a
 * self-assessment it stops being evidence and starts being a résumé cliché, so
 * a chip that cannot name who did the selecting does not belong here.
 *
 * Languages are the exception and they earn it: at a career fair they are a
 * hard fact a recruiter screens on, and they are on the CV header.
 */
export const AFFILIATIONS: ReadonlyArray<string> = [
  "Venture Partner, Contrary — 1 of ~25 across 40+ North American campuses",
  "Martin Trust Center — Orbit Ambassador & Student Board of Advisors",
  "DESY Delegate — 1 of 3 selected in Israel",
  "1st Place, HUJI AI Hackathon",
  "CS Instructor, MEET — 120 binational students",
  "BetterMind Labs — Advanced Track, top 9 of ~1,100 applicants",
  "Sharpies Elite Tech Talent Cohort — selected 2025",
  "Arabic · Hebrew · English",
];

/**
 * The credential rail under the hero — the names a stranger recognizes before
 * they have read a single line.
 *
 * Set as type, not logos, and that is a decision rather than a shortcut. The
 * logo files in /public/images/logos are not fit for this row: mit.png is a
 * 300px stock-library export with the watermark checkerboard still baked into
 * its background, five of the eight are opaque white rectangles that punch
 * holes in a dark page, and the Weizmann lockup is half black plate. Six
 * mismatched heights and three different whites read as a sponsor wall from a
 * school fair. Six names in one weight read as a record.
 *
 * It also sidesteps the trademark question entirely. Naming an institution you
 * belong to is fair use in any jurisdiction that matters; reproducing its mark
 * is a licence question, and the MIT mark in particular has published rules.
 *
 * The heading is load-bearing. "Selected by" is a claim about who did the
 * choosing, which is the only thing this row is allowed to assert — the same
 * rule that governs AFFILIATIONS below. Every name here admitted, hired, or
 * appointed him. The moment one of them is somewhere he merely attended, the
 * heading has to change or the name has to go.
 *
 * Six is the cap. AppsFlyer, HUJI and BetterMind are just as real and live in
 * AFFILIATIONS; a seventh name turns a rail into a list and makes every
 * individual name worth less.
 */
export const CREDENTIAL_RAIL: ReadonlyArray<string> = [
  "MIT",
  "Contrary",
  "Technion",
  "DESY",
  "Weizmann",
  "MEET",
];

/** Routes worth surfacing to someone who has more than forty seconds. */
export const DEEPER: ReadonlyArray<{ label: string; to: string; note: string }> = [
  { label: "Story", to: "/story", note: "The long version, told in sequence" },
  { label: "Ventures", to: "/ventures", note: "Case files with evidence" },
  { label: "Atlas", to: "/atlas", note: "Everything, on a timeline" },
  { label: "Honors", to: "/honors", note: "Recognition and selection" },
  { label: "About", to: "/about", note: "Background and philosophy" },
];
