import type { Media } from "../../content/types";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
  autoplay?: boolean; // For videos
  loop?: boolean; // For videos
  muted?: boolean; // For videos (default: true)
}

/**
 * Builds a media array from ContentItem media with explicit role-based priority:
 * 1. heroMedia (image or video)
 * 2. demoMedia (video)
 * 3. teaserMedia (video)
 * 4. gallery images
 * 
 * Falls back to legacy fields if new explicit roles are not present.
 * Deduplicates by src (same src appears only once, hero wins).
 * Respects allowVideos flag (filters out videos when false).
 */
export function buildMediaArray(
  media: Media,
  allowVideos: boolean = true
): MediaItem[] {
  const items: MediaItem[] = [];
  const seen = new Set<string>();

  // Helper to add item if not duplicate
  const addIfNew = (src: string, type: "image" | "video", alt?: string, autoplay?: boolean, loop?: boolean, muted?: boolean) => {
    if (src && src.trim() && !seen.has(src)) {
      seen.add(src);
      items.push({ type, src: src.trim(), alt, autoplay, loop, muted });
    }
  };

  // Priority 1: heroMedia (explicit role - highest priority)
  if (media.heroMedia?.src) {
    const canAdd = media.heroMedia.type === "image" || allowVideos;
    if (canAdd) {
      addIfNew(
        media.heroMedia.src,
        media.heroMedia.type,
        media.heroMedia.label,
        media.heroMedia.type === "video",
        media.heroMedia.type === "video"
      );
    }
  }

  // Priority 2: demoMedia (explicit role - distinct from hero)
  // Skip RoofMate demo video - it's shown in intro overlay, not carousel
  if (allowVideos && media.demoMedia?.src && media.demoMedia.type === "video") {
    const isRoofMateDemo = media.demoMedia.src.includes("roofmate.MP4") || media.demoMedia.src.includes("roofmate.mp4");
    // Don't add RoofMate demo to carousel - it's in the intro overlay
    if (!isRoofMateDemo) {
      addIfNew(media.demoMedia.src, "video", media.demoMedia.label, true, true, true); // Muted
    }
  }

  // Priority 3: teaserMedia (explicit role)
  if (allowVideos && media.teaserMedia?.src && media.teaserMedia.type === "video") {
    addIfNew(media.teaserMedia.src, "video", media.teaserMedia.label, true, true, true); // Muted
  }

  // Priority 4: gallery images (excluding duplicates already added)
  if (media.gallery && Array.isArray(media.gallery)) {
    media.gallery.forEach((path) => {
      if (path && path.trim()) {
        addIfNew(path.trim(), "image");
      }
    });
  }

  // Fallback to legacy fields if no explicit roles were added
  // (for backward compatibility with items that haven't migrated yet)
  if (items.length === 0) {
    if (allowVideos && media.heroVideo) {
      addIfNew(media.heroVideo, "video", undefined, true, true, true); // Muted
    }

    if (media.heroImage) {
      addIfNew(media.heroImage, "image");
    }

    if (allowVideos && media.teaserVideo) {
      addIfNew(media.teaserVideo, "video", undefined, true, true, true); // Muted
    }

    // Add gallery images (excluding duplicates)
    if (media.gallery && Array.isArray(media.gallery)) {
      media.gallery.forEach((path) => {
        if (path && path.trim()) {
          addIfNew(path.trim(), "image");
        }
      });
    }
  }

  return items;
}
