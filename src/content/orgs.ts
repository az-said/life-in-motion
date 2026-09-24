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
  },
  WEIZMANN: {
    id: "WEIZMANN",
    name: "Weizmann Institute of Science",
    logoSrc: "/images/logos/WEIZMANN.png",
    alt: "Weizmann Institute of Science logo",
  },
  MIT: {
    id: "MIT",
    name: "Massachusetts Institute of Technology",
    logoSrc: "/images/logos/mit.png",
    alt: "MIT logo",
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
  },
  CONTRARY: {
    id: "CONTRARY",
    name: "Contrary",
    alt: "Contrary",
    wordmark: "Contrary",
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

