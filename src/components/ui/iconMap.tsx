import { createElement, type ReactElement } from "react";
import type { ContentItem } from "../../content/types";
import { getExperienceIcon } from "./experienceIcons";

/**
 * Render an icon component with consistent styling for the dark aesthetic
 */
export function ExperienceIcon({
  experience,
  className,
}: {
  experience: ContentItem;
  className?: string;
}): ReactElement {
  // createElement rather than JSX: the icon is picked from a fixed lookup table,
  // so it is not a component being constructed per render.
  return createElement(getExperienceIcon(experience), {
    className: className || "w-6 h-6 text-[rgb(var(--fg-0))]",
    strokeWidth: 1.5,
  });
}
