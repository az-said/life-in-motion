/**
 * Dev-only validation utilities for orgIds
 * 
 * Use this to validate that all orgIds in content items exist in the ORGS registry.
 * Call validateContentOrgs() during development to catch missing org definitions.
 */

import type { ContentItem } from "./types";
import { ORGS, ORG_IDS } from "./orgs";
import { devLog } from "../utils/devLog";

/**
 * Validate that all orgIds in a content item exist in the ORGS registry
 * 
 * @param item - The content item to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateItemOrgs(item: ContentItem): string[] {
  const errors: string[] = [];

  if (!item.orgIds || item.orgIds.length === 0) {
    return errors; // No orgIds to validate
  }

  item.orgIds.forEach((orgId) => {
    if (!ORG_IDS.includes(orgId)) {
      errors.push(
        `ContentItem "${item.id}" has invalid orgId "${orgId}". Valid orgIds: ${ORG_IDS.join(", ")}`
      );
    } else if (!ORGS[orgId]) {
      errors.push(
        `ContentItem "${item.id}" references orgId "${orgId}" but it's missing from ORGS registry.`
      );
    }
  });

  return errors;
}

/**
 * Validate all content items for orgId issues
 * 
 * @param items - Array of content items to validate
 * @returns Array of validation errors (empty if all valid)
 */
export function validateContentOrgs(items: ContentItem[]): string[] {
  const errors: string[] = [];

  items.forEach((item) => {
    const itemErrors = validateItemOrgs(item);
    errors.push(...itemErrors);
  });

  return errors;
}

/**
 * Log validation errors to console (dev-only)
 * 
 * @param items - Array of content items to validate
 */
export function logOrgValidationErrors(items: ContentItem[]): void {
  if (import.meta.env.DEV) {
    const errors = validateContentOrgs(items);
    if (errors.length > 0) {
      console.warn("[Org Validation] Found orgId validation errors:");
      errors.forEach((error) => console.warn(`  - ${error}`));
    } else {
      devLog("[Org Validation] All orgIds are valid ✓");
    }
  }
}

