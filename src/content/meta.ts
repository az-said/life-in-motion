export const SITE_TITLE = "Said Azaizah — Life in Motion";

/**
 * The name alone, for places too narrow for the full lockup — chiefly the
 * mobile header, where "— Life in Motion" wraps to a second line and makes the
 * header two rows tall.
 */
export const SITE_NAME = "Said Azaizah";

export const TAGS = [
  "Identity",
  "Bridge-building",
  "Leadership",
  "Research",
  "Community",
  "Entrepreneurship",
  "Movement",
  "Craft",
] as const;

export type Tag = (typeof TAGS)[number];
