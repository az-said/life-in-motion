import { useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ContentItem } from "../../content/types";
import LazyImage from "../ui/LazyImage";
import LazyVideo from "../ui/LazyVideo";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface AtlasJourneyMapProps {
  experiences: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  highlightedId?: string;
}

interface NodePosition {
  x: number;
  y: number;
  year: number;
}


/**
 * Extract year from date string (e.g., "2022 - present" -> 2022, "may 2025" -> 2025)
 */
function extractYear(dateStr: string): number {
  // Match 4-digit year at the start or after a month name
  const yearMatch = dateStr.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  // Fallback: try to find any 4-digit number
  const fallbackMatch = dateStr.match(/\d{4}/);
  if (fallbackMatch) {
    return parseInt(fallbackMatch[0], 10);
  }
  // Default fallback
  return new Date().getFullYear();
}

/**
 * Calculate node positions for journey map
 * Groups by year, assigns x by year buckets, y alternating along curve
 */
function calculateNodePositions(
  experiences: ContentItem[],
  containerWidth: number,
  containerHeight: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  
  if (experiences.length === 0) return positions;

  // Extract years and sort experiences by year
  const experiencesWithYear = experiences.map((exp, index) => ({
    ...exp,
    year: extractYear(exp.date),
    originalIndex: index,
  }));

  experiencesWithYear.sort((a, b) => a.year - b.year);

  // Group by year
  const yearBuckets = new Map<number, Array<ContentItem & { originalIndex: number; year: number }>>();
  experiencesWithYear.forEach((exp) => {
    if (!yearBuckets.has(exp.year)) {
      yearBuckets.set(exp.year, []);
    }
    yearBuckets.get(exp.year)!.push(exp);
  });

  // Get year range
  const years = Array.from(yearBuckets.keys()).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearRange = maxYear - minYear || 1; // Avoid division by zero

  // Calculate positions
  const paddingX = 120; // Padding for year labels
  const paddingY = 100; // Top/bottom padding
  const availableWidth = containerWidth - paddingX * 2;

  yearBuckets.forEach((nodes, year) => {
    // X position based on year (linear mapping)
    const yearProgress = (year - minYear) / yearRange;
    const x = paddingX + yearProgress * availableWidth;

    // Calculate curve y position at this x (approximate the curve)
    const centerY = containerHeight / 2;
    const controlOffset = 80;
    // Approximate y position on the S-curve
    const curveProgress = (x - paddingX) / availableWidth;
    const curveY = centerY + (Math.sin(curveProgress * Math.PI - Math.PI / 2) * controlOffset * 0.5);

    // For each node in this year bucket, alternate y positions around the curve
    nodes.forEach((node, nodeIndex) => {
      // Alternate pattern: up, down, up, down...
      const offset = nodeIndex % 2 === 0 ? -1 : 1;
      const yOffset = (Math.floor(nodeIndex / 2) + 1) * 100 * offset;
      const y = curveY + yOffset;

      positions.set(node.id, {
        x: Math.max(paddingX, Math.min(containerWidth - paddingX, x)),
        y: Math.max(paddingY + 60, Math.min(containerHeight - paddingY - 60, y)),
        year,
      });
    });
  });

  return positions;
}

/**
 * Generate SVG path for the journey curve
 */
function generatePath(
  containerWidth: number,
  containerHeight: number,
  _minYear: number,
  _maxYear: number,
  paddingX: number
): string {
  const startX = paddingX;
  const endX = containerWidth - paddingX;
  const centerY = containerHeight / 2;
  
  // Create a gentle S-curve using cubic bezier
  const midX = (startX + endX) / 2;
  const controlOffset = 80; // How much the curve bends

  return `M ${startX} ${centerY} C ${midX} ${centerY - controlOffset}, ${midX} ${centerY + controlOffset}, ${endX} ${centerY}`;
}

export default function AtlasJourneyMap({
  experiences,
  onItemClick,
  highlightedId,
}: AtlasJourneyMapProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({
        width: rect.width || 1200,
        height: Math.max(600, rect.height || 600),
      });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate node positions
  const nodePositions = useMemo(
    () => calculateNodePositions(experiences, dimensions.width, dimensions.height),
    [experiences, dimensions.width, dimensions.height]
  );

  // Get unique years for labels
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    experiences.forEach((exp) => {
      const year = extractYear(exp.date);
      yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [experiences]);

  const minYear = years[0] || new Date().getFullYear();
  const maxYear = years[years.length - 1] || new Date().getFullYear();
  const yearRange = maxYear - minYear || 1;

  // Generate path
  const paddingX = 120;
  const path = generatePath(dimensions.width, dimensions.height, minYear, maxYear, paddingX);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[600px] rounded-lg overflow-hidden glass border border-line/10 p-8"
    >
      {/* SVG Path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(120, 220, 255)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(120, 220, 255)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(120, 220, 255)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#journeyGradient)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity={0.4}
        />
      </svg>

      {/* Year Labels */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {years.map((year) => {
          const yearProgress = (year - minYear) / yearRange;
          const x = paddingX + yearProgress * (dimensions.width - paddingX * 2);
          
          return (
            <div
              key={year}
              className="absolute top-4 transform -translate-x-1/2"
              style={{ left: `${x}px` }}
            >
              <div className="text-xs font-medium text-[rgb(var(--fg-1))] opacity-60">
                {year}
              </div>
              {/* Vertical line indicator */}
              <div
                className="absolute top-6 left-1/2 w-px h-4 bg-[rgb(var(--accent))]/20 transform -translate-x-1/2"
                style={{ top: '20px' }}
              />
            </div>
          );
        })}
      </div>

      {/* Experience Nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 3 }}>
        {experiences.map((experience, index) => {
          const position = nodePositions.get(experience.id);
          if (!position) return null;

          const isHighlighted = highlightedId === experience.id;

          return (
            <motion.button
              key={experience.id}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1,
                scale: 1,
              }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.03,
              }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onItemClick(experience)}
              className={clsx(
                "absolute group cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 rounded-lg",
                "transition-all duration-200"
              )}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Node Card */}
              <div
                className={clsx(
                  "glass rounded-lg border backdrop-blur-xl transition-all",
                  isHighlighted
                    ? "border-[rgb(var(--accent))]/60 ring-2 ring-[rgb(var(--accent))]/40"
                    : "border-line/10 hover:border-line/30",
                  "p-3 min-w-[120px]"
                )}
              >
                {/* Thumbnail */}
                {experience.media.heroImage && (
                  <div className="relative w-20 h-20 mb-2 rounded overflow-hidden mx-auto">
                    {experience.media.teaserVideo ? (
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
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-scrim/40 to-scrim/80" />
                  </div>
                )}

                {/* Title - shown on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-xs font-semibold text-[rgb(var(--fg-0))] text-center truncate max-w-[100px] group-hover:text-[rgb(var(--accent))] transition-colors">
                    {experience.card.headline || experience.title}
                  </h3>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

