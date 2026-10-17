import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { ContentItem } from "../../content/types";
import { clsx } from "clsx";
import LazyImage from "../ui/LazyImage";
import LazyVideo from "../ui/LazyVideo";
import SkeletonCard from "../ui/SkeletonCard";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface HonorCardProps {
  honor: ContentItem;
  onClick: () => void;
  index: number;
}

export default function HonorCard({ honor, onClick, index }: HonorCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!isLoaded) {
    return (
      <SkeletonCard 
        className="min-h-[400px]"
        variant="default"
      />
    );
  }

  return (
    <motion.button
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className={clsx(
        "group relative w-full h-full rounded-lg overflow-hidden cursor-pointer",
        "glass border border-line/10",
        "hover:border-line/30 hover:shadow-[0_8px_24px_rgba(120,220,255,0.2)]",
        "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-2 focus:ring-offset-transparent",
        "transition-all duration-300 ease-out"
      )}
      style={{
        perspective: "1000px",
      }}
    >
      {/* 3D tilt effect on hover */}
      <motion.div
        className="relative w-full h-full"
        whileHover={{
          rotateX: -1.5,
          rotateY: 1.5,
          scale: 1.02,
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.15, ease: "easeOut" }
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Background media */}
        <div className="absolute inset-0 overflow-hidden">
          {honor.media.teaserMedia?.type === "image" ? (
            <LazyImage
              src={honor.media.teaserMedia.src}
              alt={honor.media.teaserMedia.label || honor.title}
              className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              onLoad={() => setIsLoaded(true)}
            />
          ) : honor.media.teaserMedia?.type === "video" ? (
            <LazyVideo
              src={honor.media.teaserMedia.src}
              className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              autoPlay
              loop
              muted
              playsInline
              onLoad={() => setIsLoaded(true)}
            />
          ) : honor.media.heroImage ? (
            <LazyImage
              src={honor.media.heroImage}
              alt={honor.title}
              className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              onLoad={() => setIsLoaded(true)}
            />
          ) : null}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-scrim/60 via-scrim/40 to-scrim/80" />
        </div>

        {/* Highlight sweep effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-ink/10 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 min-h-[400px]">
          {/* Top section */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[rgb(var(--fg-0))] mb-2 group-hover:text-[rgb(var(--accent))] transition-colors">
              {honor.title}
            </h3>
            <p className="text-sm text-[rgb(var(--fg-1))] leading-relaxed">
              {honor.card.oneLiner}
            </p>
          </div>

          {/* Bottom section */}
          <div className="mt-auto">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {honor.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-ink/10 border border-line/20 text-xs text-[rgb(var(--fg-1))]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* View details hint */}
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--fg-1))] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View case file</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

