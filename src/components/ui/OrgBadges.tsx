import { clsx } from "clsx";
import LazyImage from "./LazyImage";
import type { OrgId } from "../../content/types";
import { getOrgsByIds } from "../../content/orgs";

interface OrgBadgesProps {
  orgIds: OrgId[];
  className?: string;
}

/**
 * OrgBadges component for rendering organization logos from orgIds
 * - Small, consistent height (18-22px)
 * - Original colors preserved (no grayscale filter)
 * - Slightly transparent by default, increases opacity on hover/focus
 */
export default function OrgBadges({ orgIds, className }: OrgBadgesProps) {
  if (!orgIds || orgIds.length === 0) {
    return null;
  }

  const orgs = getOrgsByIds(orgIds);

  if (orgs.length === 0) {
    return null;
  }

  return (
    <>
      {orgs.map((org) => (
        <div
          key={org.id}
          className={clsx(
            "inline-flex items-center justify-center",
            "h-5 md:h-[22px] w-auto", // Consistent height: 20px mobile, 22px desktop
            "opacity-70 hover:opacity-100 transition-opacity duration-200",
            "bg-white/5 px-2 py-1 rounded backdrop-blur-sm", // Subtle background for visibility in dark mode
            className
          )}
        >
          {org.logoSrc ? (
            <LazyImage
              src={org.logoSrc}
              alt={org.alt}
              className="h-full w-auto max-w-[120px] object-contain object-center"
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] md:text-[11px] font-medium tracking-wide text-white/80 whitespace-nowrap">
              {org.wordmark ?? org.name}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

