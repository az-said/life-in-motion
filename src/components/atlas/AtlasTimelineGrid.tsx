import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import type { ContentItem } from "../../content/types";
import LazyImage from "../ui/LazyImage";
import LazyVideo from "../ui/LazyVideo";
import Badge from "../ui/Badge";
import OrgBadges from "../ui/OrgBadges";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface AtlasTimelineGridProps {
  experiences: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  highlightedId?: string;
}

/**
 * Extract year from date string (e.g., "2022 - present" -> 2022, "may 2025" -> 2025)
 */
function extractYear(dateStr: string): number {
  const yearMatch = dateStr.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  const fallbackMatch = dateStr.match(/\d{4}/);
  if (fallbackMatch) {
    return parseInt(fallbackMatch[0], 10);
  }
  return new Date().getFullYear();
}

/**
 * Group experiences by year, sorted descending (most recent first)
 */
function groupByYear(experiences: ContentItem[]): Map<number, ContentItem[]> {
  const grouped = new Map<number, ContentItem[]>();

  experiences.forEach((exp) => {
    const year = extractYear(exp.date);
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(exp);
  });

  // Sort years descending (most recent first)
  const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);
  const sortedMap = new Map<number, ContentItem[]>();
  sortedYears.forEach((year) => {
    sortedMap.set(year, grouped.get(year)!);
  });

  return sortedMap;
}

export default function AtlasTimelineGrid({
  experiences,
  onItemClick,
  highlightedId,
}: AtlasTimelineGridProps) {
  const prefersReducedMotion = useReducedMotion();

  // Group experiences by year
  const groupedByYear = useMemo(() => groupByYear(experiences), [experiences]);

  if (experiences.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-base sm:text-lg text-[rgb(var(--fg-1))] max-w-prose mx-auto">
          No experiences found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      {Array.from(groupedByYear.entries()).map(([year, yearExperiences]) => (
        <section key={year} className="space-y-6">
          {/* Year Header */}
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[rgb(var(--fg-0))]">
              {year}
            </h2>
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-sm text-[rgb(var(--fg-1))] font-medium">
              {yearExperiences.length} {yearExperiences.length === 1 ? "experience" : "experiences"}
            </span>
          </div>

          {/* Experience Cards Grid - Wider cards when fewer items per row */}
          <div className={clsx(
            "grid gap-6",
            yearExperiences.length === 1 
              ? "grid-cols-1 max-w-2xl" 
              : yearExperiences.length === 2
              ? "grid-cols-1 lg:grid-cols-2 max-w-5xl"
              : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          )}>
            {yearExperiences.map((experience, index) => {
              const isHighlighted = highlightedId === experience.id;
              const microSummary = experience.card.microSummary || experience.card.oneLiner;

              return (
                <motion.button
                  key={experience.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
                  whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={() => onItemClick(experience)}
                  className={clsx(
                    "group relative w-full text-left rounded-lg overflow-hidden",
                    "glass border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-2 focus:ring-offset-transparent",
                    isHighlighted
                      ? "border-[rgb(var(--accent))]/60 ring-2 ring-[rgb(var(--accent))]/40"
                      : "border-line/10 hover:border-line/30"
                  )}
                >
                  <div className="flex gap-4 p-5">
                    {/* Thumbnail */}
                    {experience.media.heroImage && (
                      <div className="relative w-24 h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--bg-1))]">
                        {/* Prioritize image for MEET, show video only if no image or video explicitly preferred */}
                        {experience.media.teaserVideo && experience.id !== "meet" ? (
                          <LazyVideo
                            src={experience.media.teaserVideo}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <LazyImage
                            src={experience.media.heroImage}
                            alt={experience.title}
                            className={clsx(
                              "w-full h-full object-cover",
                              experience.id === "volunteering" && "object-top"
                            )}
                          />
                        )}
                        {/* Subtle gradient overlay - lighter for better image visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-scrim/10 to-scrim/30" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2 pr-8">
                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-[rgb(var(--fg-0))] group-hover:text-[rgb(var(--accent))] transition-colors line-clamp-2">
                        {experience.card.headline}
                      </h3>

                      {/* Micro Summary */}
                      {microSummary && (
                        <p className="text-sm text-[rgb(var(--fg-1))] leading-relaxed line-clamp-2">
                          {microSummary}
                        </p>
                      )}

                      {/* Badges and Org Logos */}
                      {(experience.badges && experience.badges.length > 0) || (experience.orgIds && experience.orgIds.length > 0) ? (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {experience.badges?.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} badge={badge} />
                          ))}
                          {experience.orgIds && <OrgBadges orgIds={experience.orgIds} />}
                        </div>
                      ) : null}

                      {/* Tags */}
                      {experience.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {experience.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-ink/5 border border-line/10 text-xs text-[rgb(var(--fg-1))]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-[rgb(var(--accent))]" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

