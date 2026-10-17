import { clsx } from "clsx";

interface SkeletonCardProps {
  className?: string;
  variant?: "default" | "tile" | "spine";
}

export default function SkeletonCard({
  className,
  variant = "default",
}: SkeletonCardProps) {
  if (variant === "tile") {
    return (
      <div
        className={clsx(
          "aspect-square rounded-lg glass border border-line/10",
          "animate-pulse",
          className
        )}
      >
        <div className="h-full flex flex-col justify-between p-6">
          <div className="h-8 w-8 rounded bg-ink/10" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded bg-ink/10" />
            <div className="h-4 w-full rounded bg-ink/5" />
            <div className="h-4 w-2/3 rounded bg-ink/5" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "spine") {
    return (
      <div
        className={clsx(
          "h-20 md:h-24 rounded-lg glass border border-line/10",
          "animate-pulse",
          className
        )}
      >
        <div className="h-full flex items-center gap-4 px-6 md:px-8">
          <div className="h-10 w-10 rounded bg-ink/10" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 rounded bg-ink/10" />
            <div className="h-4 w-1/2 rounded bg-ink/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-lg glass border border-line/10 p-6 md:p-8",
        "animate-pulse",
        className
      )}
    >
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-ink/10" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-ink/5" />
          <div className="h-4 w-full rounded bg-ink/5" />
          <div className="h-4 w-5/6 rounded bg-ink/5" />
        </div>
      </div>
    </div>
  );
}

