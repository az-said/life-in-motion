/**
 * Organization Registry
 * 
 * Central registry for all organizations that have logos.
 * Use orgIds in ContentItem to reference organizations instead of manually creating Badge objects.
 */

export const ORG_IDS = [
  "MEET",
  "HUJI",
  "DESY",
  "WEIZMANN",
  "MIT",
  "APPSFLYER",
  "BML", // BetterMind Labs
  "TECHNION",
  "CONTRARY",
  "TRUST_CENTER",
] as const;

export type OrgId = (typeof ORG_IDS)[number];

export interface Org {
  id: OrgId;
  name: string;
  /**
   * Path to a logo in /public/images/logos/, or omitted.
   *
   * Omitted is a legitimate state, not a TODO. An affiliation is real whether
   * or not a logo file has been licensed for it, and the wordmark fallback in
   * OrgBadges reads as deliberate rather than broken. Prefer no logo over a
   * hotlinked one — third-party marks come with usage terms, and a 404 in
   * production is worse than a word.
   */
  logoSrc?: string;
  alt: string; // Alt text for logo
  /** Rendered in place of a missing logo. Keep it to one or two words. */
  wordmark?: string;
  /**
   * The monochrome mark, for the hero credential rail only. Distinct from
   * `logoSrc`: that one is the org's own colours inside a plate, this one is a
   * white glyph on real alpha, recoloured at render time through a CSS mask.
   */
  mark?: OrgMark;
}

/**
 * A logo prepared for the credential rail.
 *
 * The rail draws these as masks over `currentColor`, not as `<img>`, which is
 * the only way one code path serves six sources: four of the originals shipped
 * with a background plate baked in rather than real alpha, so the usual
 * `filter: brightness(0) invert(1)` trick turns them into solid rectangles.
 * They were flattened to white-on-transparent offline instead, and a mask then
 * tints that to any colour the page asks for — including the accent, which no
 * sane filter chain can reach from a pre-whitened PNG.
 *
 * `width`/`height` are the file's intrinsic pixels. They are here to derive the
 * aspect ratio, so a mark's box is exactly its glyph and the row has no
 * invisible padding deciding the gaps.
 */
export interface OrgMark {
  src: string;
  width: number;
  height: number;
  /**
   * Optical weight correction, multiplied into the rail's cap height.
   *
   * Equal height is not equal presence. Measured ink coverage across the six at
   * a common 112px height runs from 52% (MIT) to 18% (Weizmann), so a rail set
   * to one height reads as MIT shouting next to five apologies. Equalizing ink
   * *area* is the other extreme — it inflates the sparse marks to nearly twice
   * the dense ones — so these are the damped middle: `(A_mit / A_i) ** 0.2`,
   * which corrects most of the imbalance without making a logo's size look like
   * a ranking.
   *
   * Recompute if a file is replaced: `python3 scripts/build-marks.py` prints
   * the whole set.
   */
  scale: number;
}

/**
 * Organization registry mapping OrgId to Org data
 * 
 * Logo files live in /public/images/logos/.
 *
 * These paths must match the filename on disk EXACTLY, including case. macOS is
 * case-insensitive and will happily serve DESY.png for a request to desy.png,
 * so a mismatch looks fine locally and 404s once deployed to Linux. If a logo
 * renders on your machine but not in production, check the case first.
 */
export const ORGS: Record<OrgId, Org> = {
  MEET: {
    id: "MEET",
    name: "MEET (Middle East Entrepreneurs of Tomorrow)",
    logoSrc: "/images/logos/meet.png",
    alt: "MEET logo",
    mark: { src: "/images/logos/mono-meet.png", width: 392, height: 112, scale: 0.91 },
  },
  HUJI: {
    id: "HUJI",
    name: "Hebrew University of Jerusalem",
    logoSrc: "/images/logos/HUJI.jpg",
    alt: "Hebrew University of Jerusalem logo",
  },
  DESY: {
    id: "DESY",
    name: "DESY (Deutsches Elektronen-Synchrotron)",
    logoSrc: "/images/logos/DESY.png",
    alt: "DESY logo",
    mark: { src: "/images/logos/mono-desy.png", width: 112, height: 112, scale: 1.31 },
  },
  WEIZMANN: {
    id: "WEIZMANN",
    name: "Weizmann Institute of Science",
    /*
     * No logoSrc, and that is deliberate twice over. `WEIZMANN.png` is a GIF87a
     * wearing a .png extension — browsers sniff the bytes and render it anyway,
     * build tooling does not — and the mark below is cropped to the tree panel,
     * which carries no name and so cannot stand in for a badge. A wordmark says
     * "Weizmann" at any size; that is what a badge is for.
     */
    alt: "Weizmann Institute of Science",
    wordmark: "Weizmann",
    mark: { src: "/images/logos/mono-weizmann.png", width: 140, height: 112, scale: 1.23 },
  },
  MIT: {
    id: "MIT",
    name: "Massachusetts Institute of Technology",
    logoSrc: "/images/logos/mit.png",
    alt: "MIT logo",
    mark: { src: "/images/logos/mono-mit.png", width: 217, height: 112, scale: 1 },
  },
  APPSFLYER: {
    id: "APPSFLYER",
    name: "AppsFlyer",
    logoSrc: "/images/logos/appsflyer.png",
    alt: "AppsFlyer logo",
  },
  BML: {
    id: "BML",
    name: "BetterMind Labs",
    logoSrc: "/images/logos/better_mind_labs_logo.jpeg",
    alt: "BetterMind Labs logo",
  },
  TECHNION: {
    id: "TECHNION",
    name: "Technion — Israel Institute of Technology",
    alt: "Technion",
    wordmark: "Technion",
    mark: { src: "/images/logos/mono-technion.png", width: 76, height: 112, scale: 1.24 },
  },
  CONTRARY: {
    id: "CONTRARY",
    name: "Contrary",
    alt: "Contrary",
    wordmark: "Contrary",
    mark: { src: "/images/logos/mono-contrary.png", width: 99, height: 112, scale: 1.36 },
  },
  TRUST_CENTER: {
    id: "TRUST_CENTER",
    name: "Martin Trust Center for MIT Entrepreneurship",
    alt: "Martin Trust Center for MIT Entrepreneurship",
    wordmark: "Martin Trust Center",
  },
};

/**
 * Get an organization by its ID
 */
export function getOrgById(id: OrgId): Org | undefined {
  return ORGS[id];
}

/**
 * Get all organizations for a given array of orgIds
 */
export function getOrgsByIds(orgIds: OrgId[]): Org[] {
  return orgIds.map((id) => ORGS[id]).filter((org): org is Org => org !== undefined);
}

