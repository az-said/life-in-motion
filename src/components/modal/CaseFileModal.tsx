import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import type { ContentItem } from "../../content/types";
import ProofLinksStrip from "../ui/ProofLinksStrip";
import YouTubeEmbed from "../media/YouTubeEmbed";
import Badge from "../ui/Badge";
import OrgBadges from "../ui/OrgBadges";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollContainerLock } from "../../hooks/useScrollContainerLock";
import MediaCarousel, { buildMediaArray } from "../media/MediaCarousel";
import RoofMateIntroOverlay from "./RoofMateIntroOverlay";
import { devLog } from "../../utils/devLog";

interface CaseFileModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseFileModal({
  item,
  isOpen,
  onClose,
}: CaseFileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const [showYouTube, setShowYouTube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Lock internal scroll container when modal is open
  useScrollContainerLock(isOpen);

  // Check if RoofMate intro should be shown
  // MUST be called before early return to maintain consistent hook order
  const [showRoofMateIntro, setShowRoofMateIntro] = useState(false);
  const [introHasBeenShown, setIntroHasBeenShown] = useState(false);
  
  useEffect(() => {
    devLog('[DEBUG] Modal opened:', { 
      isOpen, 
      itemId: item?.id, 
      itemTitle: item?.title,
      isRoofMate: item?.id === "roofmate",
      introHasBeenShown
    });
    
    // Show intro for RoofMate only if not already shown in this modal session
    if (isOpen && item?.id === "roofmate" && !introHasBeenShown) {
      devLog('[DEBUG] Showing RoofMate intro');
      setShowRoofMateIntro(true);
    } else if (!isOpen) {
      // Reset when modal closes completely
      setShowRoofMateIntro(false);
      setIntroHasBeenShown(false);
    }
  }, [isOpen, item?.id, introHasBeenShown]);

  const handleIntroClose = () => {
    devLog('[DEBUG] Intro closing');
    setShowRoofMateIntro(false);
    setIntroHasBeenShown(true); // Mark as shown so it doesn't reopen
  };

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showYouTube) {
          setShowYouTube(false);
          setYoutubeUrl(null);
        } else if (showRoofMateIntro) {
          handleIntroClose();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, showYouTube, showRoofMateIntro]);

  // Reset YouTube state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowYouTube(false);
      setYoutubeUrl(null);
      setIsDeepDiveOpen(false);
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || showRoofMateIntro) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen, showRoofMateIntro]);

  const handleWatchVideo = (url: string) => {
    setYoutubeUrl(url);
    setShowYouTube(true);
  };

  const handleCloseYouTube = () => {
    setShowYouTube(false);
    setYoutubeUrl(null);
  };

  // Manage robots meta tag for unlisted items
  useEffect(() => {
    if (!isOpen || !item) return;

    const isUnlisted = item.privacy === "unlisted";
    let robotsMeta: HTMLMetaElement | null = document.querySelector('meta[name="robots"]');
    
    if (isUnlisted) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex,nofollow";
    }

    return () => {
      // Clean up: remove noindex when modal closes (or keep it if site-wide noindex is preferred)
      // For now, we'll remove it on close to allow normal indexing when modal is closed
      if (isUnlisted && robotsMeta) {
        robotsMeta.remove();
      }
    };
  }, [isOpen, item]);

  // Set aria-hidden on app content when modal is open
  // Always call this hook (even if item is null) to maintain consistent hook count
  useEffect(() => {
    if (!isOpen || showRoofMateIntro) return;

    const scrollContainer = document.querySelector('[data-scroll-container]');
    const header = document.querySelector('header, [data-header]');
    
    if (scrollContainer) {
      scrollContainer.setAttribute('aria-hidden', 'true');
    }
    if (header) {
      header.setAttribute('aria-hidden', 'true');
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeAttribute('aria-hidden');
      }
      if (header) {
        header.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen, showRoofMateIntro]);

  // Early return after all hooks are called (hooks must always be called in same order)
  if (!item) {
    return null;
  }

  const { media, card, beats, caseFile, privacy } = item;
  
  // Privacy rules
  const isProofOnly = privacy === "proof-only";
  const allowVideos = !isProofOnly;
  
  // Build media array for carousel (prioritizes heroMedia > demoMedia > teaserMedia > gallery, removes duplicates)
  // Note: RoofMate demo video is excluded from carousel - it's shown in intro overlay
  const mediaItems = buildMediaArray(media, allowVideos);
  
  const initialMediaIndex = 0; // Start at first item (hero image for RoofMate)
  
  // Safe field checks with fallbacks
  const hasYouTube = allowVideos && media?.youtubeUrl && media.youtubeUrl.trim() !== "";
  const hasDeepDive = caseFile?.deepDive && caseFile.deepDive.trim() !== "";
  
  // Safe access with fallbacks
  const safeBeats = beats && Array.isArray(beats) ? beats : [];
  const safeWhatIDid = caseFile?.whatIDid && Array.isArray(caseFile.whatIDid) ? caseFile.whatIDid : [];
  const safeImpact = caseFile?.impact && Array.isArray(caseFile.impact) ? caseFile.impact : [];
  const safeEvidence = caseFile?.evidence && Array.isArray(caseFile.evidence) ? caseFile.evidence : [];
  const safeTags = item.tags && Array.isArray(item.tags) ? item.tags : [];
  const safeContext = caseFile?.context || "";
  const safeDeepDive = caseFile?.deepDive || "";
  const safeHeadline = card?.headline || item.title || "Untitled";
  const safeSubhead = card?.subhead || "";

  // Render modal in portal at document.body level
  // Always render AnimatePresence to avoid hooks changing
  // Only render modal content if both isOpen AND item exist
  const modalContent = (
    <>
      {/* RoofMate Intro Overlay - shows INSTEAD OF modal content */}
      {showRoofMateIntro ? (
        <RoofMateIntroOverlay
          isOpen={showRoofMateIntro}
          onClose={handleIntroClose}
        />
      ) : (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop - single overlay layer with blur/dim */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.4 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md pointer-events-auto"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={prefersReducedMotion ? {} : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className={clsx(
                "fixed inset-0 z-[101] overflow-hidden pointer-events-auto",
                // Add subtle radius to modal container (for books: clips image to radius)
                "rounded-lg lg:rounded-xl"
              )}
              role="dialog"
              aria-modal="true"
              aria-label={`Case file: ${item.title}`}
              onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="h-full flex flex-col lg:flex-row">
                  {/* Left Panel - Media Carousel */}
                  <div className={clsx(
                    "relative w-full lg:w-1/2 bg-black flex flex-col min-h-0",
                    // Clip image to panel radius (full-bleed for books)
                    "overflow-hidden",
                    // Round corners only on left side (desktop) or top (mobile)
                    item.type === "book" ? "lg:rounded-l-xl rounded-t-lg lg:rounded-t-none" : ""
                  )}>
                    {/* For books: full-bleed image, for others: padded container */}
                    {item.type === "book" ? (
                      <>
                        {/* Full-bleed media container for books */}
                        <div className="relative flex-1 min-h-0 w-full h-full">
                          {/* Media Carousel - full-bleed */}
                          <MediaCarousel
                            items={mediaItems}
                            className="w-full h-full"
                            showArrows={true}
                            isFullBleed={true}
                            initialIndex={initialMediaIndex}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Padded container for other content types */}
                        <div className="relative flex-1 min-h-0 p-4 lg:p-6 flex items-center justify-center">
                          {/* Media Carousel */}
                          <MediaCarousel
                            items={mediaItems}
                            className="w-full"
                            showArrows={true}
                            initialIndex={initialMediaIndex}
                          />

                          {/* Film grain overlay */}
                          <div
                            className="absolute inset-4 lg:inset-6 pointer-events-none opacity-30 mix-blend-overlay rounded-lg overflow-hidden"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`,
                            }}
                          />

                          {/* Gradient overlay */}
                          <div className="absolute inset-4 lg:inset-6 rounded-lg bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                          {/* Watch YouTube button (if available) */}
                          {hasYouTube && (
                            <div className="absolute top-8 lg:top-10 right-8 lg:right-10 z-20">
                              <button
                                onClick={() => handleWatchVideo(media.youtubeUrl)}
                                className={clsx(
                                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                                  "bg-black/60 hover:bg-black/80 backdrop-blur-sm",
                                  "border border-white/20 hover:border-white/30",
                                  "text-white font-medium transition-colors",
                                  "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
                                )}
                              >
                                <span>Watch full video</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Panel - Content */}
                  <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-0))] min-h-0">
                    <div className="min-h-full flex flex-col">
                      {/* Header */}
                      <div className="sticky top-0 z-10 glass border-b border-white/10 p-6 lg:p-8 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[rgb(var(--fg-0))] mb-2">
                            {safeHeadline}
                          </h2>
                          {safeSubhead && (
                            <p className="text-lg text-[rgb(var(--fg-1))]">
                              {safeSubhead}
                            </p>
                          )}
                          {/* Badges and Org Logos */}
                          {(item.badges && item.badges.length > 0) || (item.orgIds && item.orgIds.length > 0) ? (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {item.badges?.map((badge, badgeIndex) => (
                                <Badge key={badgeIndex} badge={badge} />
                              ))}
                              {item.orgIds && <OrgBadges orgIds={item.orgIds} />}
                            </div>
                          ) : null}
                          
                          {/* "We Love What We Do" replay button - only for RoofMate */}
                          {item.id === "roofmate" && (
                            <button
                              onClick={() => {
                                devLog('[DEBUG] Replaying intro');
                                setIntroHasBeenShown(false);
                                setShowRoofMateIntro(true);
                              }}
                              className={clsx(
                                "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                                "bg-[rgb(var(--accent))]/10 hover:bg-[rgb(var(--accent))]/20",
                                "border border-[rgb(var(--accent))]/30 hover:border-[rgb(var(--accent))]/50",
                                "text-[rgb(var(--accent))] text-sm font-medium",
                                "transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-2 focus:ring-offset-transparent"
                              )}
                            >
                              <span>❤️</span>
                              <span>We Love What We Do</span>
                            </button>
                          )}
                        </div>
                        <button
                          ref={firstFocusableRef}
                          onClick={onClose}
                          className={clsx(
                            "p-2 rounded-md transition-colors flex-shrink-0",
                            "hover:bg-white/5 active:bg-white/10",
                            "border border-white/10 hover:border-white/20",
                            "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
                          )}
                          aria-label="Close case file"
                        >
                          <X className="w-5 h-5 text-[rgb(var(--fg-0))]" />
                        </button>
                      </div>

                      {/* Content Sections */}
                      <div className="p-6 lg:p-8 xl:p-12 space-y-12 pb-24">
                        {/* Beats */}
                        {safeBeats.length > 0 && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.1 }}
                            className="space-y-3"
                          >
                            {safeBeats.map((beat, index) => (
                              <p
                                key={index}
                                className="text-lg md:text-xl text-[rgb(var(--fg-1))] leading-relaxed"
                              >
                                {beat}
                              </p>
                            ))}
                          </motion.section>
                        )}

                        {/* Context Section */}
                        <motion.section
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                          transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.2 }}
                          className="glass rounded-lg border border-white/10 p-6 lg:p-8 backdrop-blur-xl"
                        >
                          <h3 className="text-2xl font-semibold text-[rgb(var(--fg-0))] mb-4">
                            Context
                          </h3>
                          {safeContext && (
                            <p className="text-base md:text-lg text-[rgb(var(--fg-1))] leading-relaxed whitespace-pre-line">
                              {safeContext}
                            </p>
                          )}
                        </motion.section>

                        {/* What I Did Section */}
                        {safeWhatIDid.length > 0 && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.3 }}
                            className="glass rounded-lg border border-white/10 p-6 lg:p-8 backdrop-blur-xl"
                          >
                            <h3 className="text-2xl font-semibold text-[rgb(var(--fg-0))] mb-4">
                              What I Did
                            </h3>
                            <ul className="space-y-3">
                              {safeWhatIDid.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-base md:text-lg text-[rgb(var(--fg-1))]"
                                >
                                  <span className="text-[rgb(var(--accent))] mt-1 flex-shrink-0">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.section>
                        )}

                        {/* Impact Section */}
                        {safeImpact.length > 0 && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.4 }}
                            className="glass rounded-lg border border-white/10 p-6 lg:p-8 backdrop-blur-xl"
                          >
                            <h3 className="text-2xl font-semibold text-[rgb(var(--fg-0))] mb-4">
                              Impact
                            </h3>
                            <ul className="space-y-3">
                              {safeImpact.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-base md:text-lg text-[rgb(var(--fg-1))]"
                                >
                                  <span className="text-[rgb(var(--accent))] mt-1 flex-shrink-0">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.section>
                        )}

                        {/* Evidence Section */}
                        {safeEvidence.length > 0 && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.5 }}
                            className="glass rounded-lg border border-white/10 p-6 lg:p-8 backdrop-blur-xl"
                          >
                            <ProofLinksStrip links={safeEvidence} label="EVIDENCE" />
                          </motion.section>
                        )}

                        {/* Deep Dive Section (Collapsible) */}
                        {hasDeepDive && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.6 }}
                            className="glass rounded-lg border border-white/10 backdrop-blur-xl overflow-hidden"
                          >
                            <button
                              onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
                              className={clsx(
                                "w-full p-6 lg:p-8 flex items-center justify-between gap-4",
                                "text-left transition-colors",
                                "hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-inset"
                              )}
                              aria-expanded={isDeepDiveOpen}
                              aria-controls="deep-dive-content"
                            >
                              <h3 className="text-2xl font-semibold text-[rgb(var(--fg-0))]">
                                Deep Dive
                              </h3>
                              {isDeepDiveOpen ? (
                                <ChevronUp className="w-5 h-5 text-[rgb(var(--fg-1))] flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[rgb(var(--fg-1))] flex-shrink-0" />
                              )}
                            </button>
                            <AnimatePresence>
                              {isDeepDiveOpen && (
                                <motion.div
                                  id="deep-dive-content"
                                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                                  animate={prefersReducedMotion ? {} : { height: "auto", opacity: 1 }}
                                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                                  transition={prefersReducedMotion ? {} : { duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                                    {safeDeepDive && (
                                      <p className="text-base md:text-lg text-[rgb(var(--fg-1))] leading-relaxed whitespace-pre-line">
                                        {safeDeepDive}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.section>
                        )}

                        {/* Tags */}
                        {safeTags.length > 0 && (
                          <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.7 }}
                            className="flex flex-wrap gap-2"
                          >
                            {safeTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[rgb(var(--fg-1))]"
                              >
                                {tag}
                              </span>
                            ))}
                          </motion.section>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );

  // Render modal in portal at document.body level
  return (
    <>
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
      
      {/* YouTube Embed - also in portal */}
      {youtubeUrl && typeof document !== 'undefined' && createPortal(
        <YouTubeEmbed
          videoId={youtubeUrl}
          isOpen={showYouTube}
          onClose={handleCloseYouTube}
        />,
        document.body
      )}
    </>
  );
}