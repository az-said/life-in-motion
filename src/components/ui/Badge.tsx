import { clsx } from "clsx";
import LazyImage from "./LazyImage";
import type { Badge as BadgeType } from "../../content/types";

interface BadgeProps {
  badge: BadgeType;
  className?: string;
}

/**
 * Badge component for organization logos or text
 * - Small, consistent height (18-22px)
 * - Original colors preserved for logos (no grayscale filter)
 * - Slightly transparent by default, increases opacity on hover/focus
 */
export default function Badge({ badge, className }: BadgeProps) {
  if (badge.type === "logo" && badge.src) {
    return (
      <div
        className={clsx(
          "inline-flex items-center justify-center",
          "h-5 md:h-[22px] w-auto", // Consistent height: 20px mobile, 22px desktop
          "opacity-70 hover:opacity-100 transition-opacity duration-200",
          "bg-ink/5 px-2 py-1 rounded backdrop-blur-sm", // Subtle background for visibility in dark mode
          className
        )}
      >
        <LazyImage
          src={badge.src}
          alt={badge.alt || "Organization logo"}
          className="h-full w-auto max-w-[120px] object-contain object-center"
          loading="lazy"
        />
      </div>
    );
  }

  if (badge.type === "text" && badge.text) {
    return (
      <span
        className={clsx(
          "inline-flex items-center justify-center",
          "px-2 py-0.5 h-5 md:h-[22px]",
          "text-xs font-medium text-[rgb(var(--fg-1))]",
          "bg-ink/5 border border-line/10 rounded",
          "opacity-60 hover:opacity-90 transition-opacity duration-200",
          className
        )}
      >
        {badge.text}
      </span>
    );
  }

  return null;
}

