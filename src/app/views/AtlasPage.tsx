import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { experiences } from "../../content/items/experiences";
import { TAGS } from "../../content/meta";
import type { Tag, ContentItem } from "../../content/types";
import CaseFileModal from "../../components/modal/CaseFileModal";
import { clsx } from "clsx";
import LazyImage from "../../components/ui/LazyImage";
import LazyVideo from "../../components/ui/LazyVideo";
import Badge from "../../components/ui/Badge";
import OrgBadges from "../../components/ui/OrgBadges";
import SEOHead from "../../components/ui/SEOHead";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import Container from "../../components/layout/Container";
import AtlasTimelineGrid from "../../components/atlas/AtlasTimelineGrid";

export default function AtlasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clickedItem, setClickedItem] = useState<ContentItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
  const prefersReducedMotion = useReducedMotion();
  
  // Use ResizeObserver to detect container width (900px breakpoint)
  const containerRef = useRef<HTMLDivElement>(null);
  // Initialize with null to prevent flash - will be set immediately by ResizeObserver
  const [isMobileLayout, setIsMobileLayout] = useState<boolean | null>(null);

  // ResizeObserver for container width detection - switches layout at 900px (debounced)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const updateLayout = () => {
      const width = container.offsetWidth;
      setIsMobileLayout(width < 900);
    };

    // Set initial layout mode immediately
    updateLayout();

    // Debounced update function
    const debouncedUpdate = (entries: ResizeObserverEntry[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          setIsMobileLayout(width < 900);
        }
      }, 150);
    };

    // Create ResizeObserver to watch container width changes
    const resizeObserver = new ResizeObserver(debouncedUpdate);

    // Start observing
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // The focus query param (from Story linked items) is read during render
  // rather than copied into state by an effect.
  const focusId = searchParams.get("focus");
  const focusedItem = useMemo(
    () => (focusId ? experiences.find((e) => e.id === focusId) ?? null : null),
    [focusId]
  );

  const selectedItem = clickedItem ?? focusedItem;
  const isModalOpen = selectedItem !== null && !isClosing;

  // Filter experiences based on search and tags
  const filteredExperiences = useMemo(() => {
    return experiences.filter((experience) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        experience.card.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        experience.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchesTags =
        selectedTags.size === 0 ||
        experience.tags.some((tag) => selectedTags.has(tag));

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags]);

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags(new Set());
    setSearchParams({});
  };

  const handleExperienceClick = (experience: ContentItem) => {
    setIsClosing(false);
    setClickedItem(experience);
    setSearchParams({ focus: experience.id });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setClickedItem(null);
      setIsClosing(false);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("focus");
      setSearchParams(newParams);
    }, 300);
  };

  const hasActiveFilters = searchQuery !== "" || selectedTags.size > 0;

  return (
    <>
      <SEOHead title="Life Atlas" />
      <div className="py-12 pb-24">
        {/* Header */}
        <Container className="mb-12">
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--fg-0))] mb-4"
          >
            Life Atlas
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-[rgb(var(--fg-1))] max-w-prose leading-relaxed"
          >
            An interactive map of experiences, moments, and connections that shape the journey.
          </motion.p>
        </Container>

        {/* Filters */}
        <Container className="mb-8 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--fg-1))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences..."
              className={clsx(
                "w-full pl-12 pr-4 py-3 rounded-lg",
                "glass border border-white/10",
                "bg-[rgb(var(--bg-0))]/50 backdrop-blur-xl",
                "text-[rgb(var(--fg-0))] placeholder:text-[rgb(var(--fg-1))]",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent",
                "transition-all"
              )}
            />
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[rgb(var(--fg-1))] font-medium">Filter by:</span>
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "border",
                  selectedTags.has(tag)
                    ? "bg-[rgb(var(--accent))]/20 border-[rgb(var(--accent))]/40 text-[rgb(var(--fg-0))]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-[rgb(var(--fg-1))]",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
                )}
              >
                {tag}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  "bg-white/5 hover:bg-white/10 border border-white/10",
                  "text-[rgb(var(--fg-1))] transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
                )}
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>

          {/* Results count */}
          {hasActiveFilters && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[rgb(var(--fg-1))]"
            >
              Showing {filteredExperiences.length} of {experiences.length} experiences
            </motion.p>
          )}
        </Container>

        {/* Desktop: Two-column layout (lg+) | Mobile: Single-column (<lg) */}
        <Container>
          {/* Container ref for ResizeObserver */}
          <div ref={containerRef} className="min-h-0">
            {/* Wait for initial layout detection before rendering to prevent flash */}
            {isMobileLayout !== null && (
              <AnimatePresence mode="wait">
                {filteredExperiences.length > 0 ? (
                  <>
                    {/* Desktop: Timeline Grid (lg+) */}
                    {!isMobileLayout && (
                      <motion.div
                        key="desktop-timeline-grid"
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.2 }}
                        className="w-full"
                      >
                        <AtlasTimelineGrid
                          experiences={filteredExperiences}
                          onItemClick={handleExperienceClick}
                          highlightedId={searchParams.get("focus") || undefined}
                        />
                      </motion.div>
                    )}

                    {/* Mobile: Single-column List View (<900px) */}
                    {isMobileLayout && (
                      <motion.div
                        key="mobile-list"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.2 }}
                        className="space-y-4"
                      >
                        {filteredExperiences.map((experience, index) => (
                          <ExperienceListItem
                            key={experience.id}
                            experience={experience}
                            index={index}
                            onClick={() => handleExperienceClick(experience)}
                            isHighlighted={searchParams.get("focus") === experience.id}
                          />
                        ))}
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <p className="text-base sm:text-lg text-[rgb(var(--fg-1))] max-w-prose mx-auto">
                      No experiences found. Try adjusting your filters.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </Container>

        {/* Case File Modal */}
        <CaseFileModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}

interface ExperienceListItemProps {
  experience: ContentItem;
  index: number;
  onClick: () => void;
  isHighlighted: boolean;
}

function ExperienceListItem({
  experience,
  index,
  onClick,
  isHighlighted,
}: ExperienceListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "group relative w-full rounded-lg overflow-hidden",
        "glass border transition-all",
        isHighlighted
          ? "border-[rgb(var(--accent))]/60 ring-2 ring-[rgb(var(--accent))]/40"
          : "border-white/10 hover:border-white/20",
        "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        {experience.media.heroImage && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--fg-0))] mb-1 group-hover:text-[rgb(var(--accent))] transition-colors">
            {experience.card.headline}
          </h3>
          {experience.card.subhead && (
            <p className="text-xs sm:text-sm text-[rgb(var(--fg-1))] mb-2 max-w-prose">
              {experience.card.subhead}
            </p>
          )}
          <p className="text-xs sm:text-sm text-[rgb(var(--fg-1))] line-clamp-2 max-w-prose">
            {experience.card.oneLiner}
          </p>
          {/* Badges and Org Logos */}
          {(experience.badges && experience.badges.length > 0) || (experience.orgIds && experience.orgIds.length > 0) ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {experience.badges?.map((badge, badgeIndex) => (
                <Badge key={badgeIndex} badge={badge} />
              ))}
              {experience.orgIds && <OrgBadges orgIds={experience.orgIds} />}
            </div>
          ) : null}
          {experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {experience.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-[rgb(var(--fg-1))]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
