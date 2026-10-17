import { useState } from "react";
import { clsx } from "clsx";

interface AvatarProps {
  /** Image source path (e.g., "/profile/said.jpg") */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Size class - default "w-11 h-11 md:w-14 md:h-14" */
  size?: string;
  /** Additional className */
  className?: string;
  /** Initials to show on fallback (default: "SA") */
  initials?: string;
}

/**
 * Avatar component with graceful fallback to initials
 * 
 * Displays a circular avatar image. If the image fails to load,
 * shows initials in a circle with the same styling.
 */
export default function Avatar({
  src,
  alt,
  size = "w-11 h-11 md:w-14 md:h-14",
  className,
  initials = "SA",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  const avatarClasses = clsx(
    "rounded-full object-cover ring-1 ring-line/15 shadow-sm",
    "flex items-center justify-center",
    "flex-shrink-0",
    "bg-gradient-to-br from-[rgb(var(--bg-1))] to-[rgb(var(--bg-0))]",
    "text-[rgb(var(--fg-0))] font-semibold",
    size,
    className
  );

  if (imageError) {
    // Fallback: Show initials
    return (
      <div className={avatarClasses} role="img" aria-label={alt}>
        <span className="text-sm md:text-base">{initials}</span>
      </div>
    );
  }

  // Show image
  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={avatarClasses}
      loading="lazy"
    />
  );
}

