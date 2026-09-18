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
] as const;

export type OrgId = (typeof ORG_IDS)[number];

export interface Org {
  id: OrgId;
  name: string;
  logoSrc: string; // Path to logo in /public/images/logos/
  alt: string; // Alt text for logo
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

