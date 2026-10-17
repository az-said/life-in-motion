import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";

interface ProofLink {
  label: string;
  url: string;
}

interface ProofLinksStripProps {
  links: ProofLink[];
  /** Optional label text (defaults to "PROOF & LINKS") */
  label?: string;
  /** Optional className for the container */
  className?: string;
}

/**
 * Compact premium "Proof & Links" strip component
 * Displays links horizontally with subtle separators and icons
 */
export default function ProofLinksStrip({
  links,
  label = "PROOF & LINKS",
  className,
}: ProofLinksStripProps) {
  // Hide gracefully if no links
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      {/* Small caps label */}
      <span className="text-xs font-medium tracking-wider uppercase text-[rgb(var(--fg-1))]">
        {label}
      </span>

      {/* Links strip */}
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link, index) => (
          <div key={link.url} className="flex items-center gap-2">
            {/* Subtle separator (except before first item) */}
            {index > 0 && (
              <span
                className="text-[rgb(var(--fg-1))]/30 text-xs"
                aria-hidden="true"
              >
                /
              </span>
            )}

            {/* Link button */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
                "text-sm font-medium text-[rgb(var(--fg-0))]",
                "bg-ink/5 hover:bg-ink/10 active:bg-ink/15",
                "border border-line/10 hover:border-line/20",
                "transition-all duration-200 ease-out",
                "hover:-translate-y-0.5 active:translate-y-0",
                "hover:shadow-[0_2px_8px_rgba(120,220,255,0.1)]",
                "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-1 focus:ring-offset-transparent",
                "group"
              )}
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

