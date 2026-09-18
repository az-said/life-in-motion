import {
  Users,
  Book,
  Dumbbell,
  FlaskConical,
  Network,
  GraduationCap,
  Heart,
  Code,
  Building2,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { ContentItem } from "../../content/types";
import type { Tag } from "../../content/meta";

// Map experience IDs to specific icons
const EXPERIENCE_ICON_MAP: Record<string, LucideIcon> = {
  meet: Network, // Bridge-building, cross-cultural
  "germany-internship": FlaskConical, // Research
  "technion-job": FlaskConical, // Research
  tutoring: GraduationCap, // Education, teaching
  dabka: Heart, // Cultural, identity, movement
  empowered: Users, // Community, leadership
  running: Dumbbell, // Movement, meditation
  books: Book, // Reading, knowledge
};

// Map tags to icon preferences (fallback)
const TAG_ICON_PRIORITY: Record<Tag, LucideIcon> = {
  "Bridge-building": Network,
  "Community": Users,
  "Leadership": Users,
  "Research": FlaskConical,
  "Entrepreneurship": Building2,
  "Movement": Dumbbell,
  "Craft": Code,
  "Identity": Heart,
};

/**
 * Get the appropriate icon for an experience
 * Priority: 1) Experience ID mapping, 2) Primary tag, 3) Default MapPin
 */
export function getExperienceIcon(experience: ContentItem): LucideIcon {
  // First, check if there's a specific icon for this experience ID
  const iconByID = EXPERIENCE_ICON_MAP[experience.id];
  if (iconByID) {
    return iconByID;
  }

  // Otherwise, use the first tag's icon (tags are ordered by relevance)
  if (experience.tags.length > 0) {
    const primaryTag = experience.tags[0] as Tag;
    const iconByTag = TAG_ICON_PRIORITY[primaryTag];
    if (iconByTag) {
      return iconByTag;
    }
  }

  // Default fallback
  return MapPin;
}
