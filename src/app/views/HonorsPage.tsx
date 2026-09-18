import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { honors } from "../../content/items/honors";
import { getItemById } from "../../content/items";
import type { ContentItem } from "../../content/types";
import CaseFileModal from "../../components/modal/CaseFileModal";
import SEOHead from "../../components/ui/SEOHead";
import LazyImage from "../../components/ui/LazyImage";
import LazyVideo from "../../components/ui/LazyVideo";
import Badge from "../../components/ui/Badge";
import OrgBadges from "../../components/ui/OrgBadges";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { clsx } from "clsx";
import Container from "../../components/layout/Container";

export default function HonorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clickedItem, setClickedItem] = useState<ContentItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // The focus query param (from Story linked items) is read during render
  // rather than copied into state by an effect.
  const focusId = searchParams.get("focus");
  const focusedItem = useMemo(() => {
    if (!focusId) return null;
    const item = getItemById(focusId);
    return item && item.type === "honor" ? item : null;
  }, [focusId]);

  const selectedItem = clickedItem ?? focusedItem;
  const isModalOpen = selectedItem !== null && !isClosing;

  const handleItemClick = (item: ContentItem) => {
    setIsClosing(false);
    setClickedItem(item);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setClickedItem(null);
      setIsClosing(false);
      // Remove focus from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("focus");
      setSearchParams(newParams);
    }, 300);
  };

  // Spotlight: first honor (or most recent)
  const spotlight = honors[0];
  const timeline = honors.slice(1);

  return (
    <>
      <SEOHead title="Honors" />
      <div className="pb-12">
        {/* Header */}
        <Container className="pt-12 pb-8">
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--fg-0))] mb-4"
          >
            Honors
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-[rgb(var(--fg-1))] max-w-prose leading-relaxed"
          >
            Recognition and achievements that reflect the journey and impact.
          </motion.p>
        </Container>

        {/* Spotlight */}
        {spotlight && (
          <Container className="mb-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 0.8 }}
                className="relative w-full aspect-[16/9] max-h-[44vh] sm:max-h-[min(56vh,520px)] overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => handleItemClick(spotlight)}
              >
                {/* Background Media */}
                <div className="absolute inset-0 w-full h-full">
                  {spotlight.media.teaserVideo ? (
                    <LazyVideo
                      src={spotlight.media.teaserVideo}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : spotlight.media.heroImage ? (
                    <LazyImage
                      src={spotlight.media.heroImage}
                      alt={spotlight.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[rgb(var(--bg-1))] to-[rgb(var(--bg-2))]" />
                  )}
                  {/* Top Scrim - Subtle header/media blending */}
                  <div 
                    className="absolute inset-x-0 top-0 h-12 md:h-16 pointer-events-none z-10"
                    style={{
                      background: `
                        linear-gradient(to bottom,
                          rgba(0, 0, 0, 0.6) 0%,
                          rgba(0, 0, 0, 0.2) 50%,
                          transparent 100%
                        )
                      `,
                    }}
                  />
                  {/* Bottom gradient for content readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                  <div className="max-w-3xl">
                    <motion.h2
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.2 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[rgb(var(--fg-0))] mb-4"
                    >
                      {spotlight.card.headline}
                    </motion.h2>
                    {spotlight.card.subhead && (
                      <motion.p
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.3 }}
                        className="text-xl sm:text-2xl text-[rgb(var(--fg-1))] mb-6 max-w-prose"
                      >
                        {spotlight.card.subhead}
                      </motion.p>
                    )}
                    <motion.button
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? {} : { duration: 0.8, delay: 0.4 }}
                      className={clsx(
                        "inline-flex items-center gap-2 px-6 py-3 rounded-lg",
                        "bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30",
                        "border border-[rgb(var(--accent))]/40 hover:border-[rgb(var(--accent))]/60",
                        "text-lg font-semibold text-[rgb(var(--fg-0))]",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-2 focus:ring-offset-transparent"
                      )}
                    >
                      View Case File
                    </motion.button>
                  </div>
                </div>
              </motion.div>
          </Container>
        )}

        {/* Vertical Timeline */}
        {timeline.length > 0 && (
          <Container size="4xl">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />

                {/* Timeline items */}
                <div className="space-y-12">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -40 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? {} : { duration: 0.6, delay: index * 0.1 }}
                      className="relative pl-24 cursor-pointer group"
                      onClick={() => handleItemClick(item)}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-[rgb(var(--accent))] border-4 border-[rgb(var(--bg-0))] group-hover:scale-125 transition-transform" />

                      {/* Hero Image Banner */}
                      {item.media.heroImage && (
                        <div className="relative w-full h-48 sm:h-56 mb-4 rounded-lg overflow-hidden">
                          <LazyImage
                            src={item.media.heroImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
                        </div>
                      )}

                      {/* Content card */}
                      <div className={clsx(
                        "glass rounded-lg border border-white/10 p-6 backdrop-blur-xl",
                        "transition-all duration-200",
                        "group-hover:border-white/20 group-hover:shadow-lg"
                      )}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--fg-0))] mb-2 group-hover:text-[rgb(var(--accent))] transition-colors">
                              {item.card.headline}
                            </h3>
                            {item.card.subhead && (
                              <p className="text-lg sm:text-xl text-[rgb(var(--fg-1))] max-w-prose">
                                {item.card.subhead}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-[rgb(var(--fg-1))] whitespace-nowrap">
                            {item.date}
                          </span>
                        </div>

                        {/* One liner */}
                        <p className="text-base sm:text-lg text-[rgb(var(--fg-1))] mb-4 max-w-prose">
                          {item.card.oneLiner}
                        </p>

                        {/* Badges and Org Logos */}
                        {(item.badges && item.badges.length > 0) || (item.orgIds && item.orgIds.length > 0) ? (
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {item.badges?.map((badge, badgeIndex) => (
                              <Badge key={badgeIndex} badge={badge} />
                            ))}
                            {item.orgIds && <OrgBadges orgIds={item.orgIds} />}
                          </div>
                        ) : null}

                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[rgb(var(--fg-1))]"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[rgb(var(--fg-1))]">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
          </Container>
        )}

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
