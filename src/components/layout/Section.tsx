import type { ReactNode } from "react";
import { clsx } from "clsx";
import { SPACING } from "../../styles/tokens";

interface SectionProps {
  children: ReactNode;
  /** Vertical spacing preset */
  spacing?: "section" | "sectionLarge" | "none";
  /** Vertical padding preset */
  padding?: "pageY" | "pageYLarge" | "none";
  /** Optional background variant (glass panel) */
  variant?: "glass" | "none";
  /** Additional className */
  className?: string;
}

/**
 * Section component for consistent vertical spacing and optional styling
 * Drop-in wrapper for consistent section layouts
 */
export default function Section({
  children,
  spacing = "section",
  padding = "none",
  variant = "none",
  className,
}: SectionProps) {
  return (
    <section
      className={clsx(
        spacing !== "none" && SPACING[spacing],
        padding !== "none" && SPACING[padding],
        variant === "glass" && "glass rounded-lg border border-line/10 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </section>
  );
}

