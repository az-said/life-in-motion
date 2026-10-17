import { useRouteError, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

/**
 * Error fallback component for React Router errors (used as errorElement)
 * This handles route-level errors (404s, loader errors, etc.)
 */
export default function AppErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isDev = import.meta.env.DEV;

  // Extract error information
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorName = error instanceof Error ? error.name : "Error";

  const handleCopyError = async () => {
    const errorDetails = `
Error: ${errorName}
Message: ${errorMessage}
${errorStack ? `Stack: ${errorStack}` : ""}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgb(var(--bg-0))] overflow-y-auto">
      {/* The same background field as AppLayout, rebuilt here because this
          screen replaces the layout rather than rendering inside it. It reads
          the same two tokens for exactly that reason: the glow and the vignette
          were written out as a literal cyan and a 60% black, which is the dark
          ground's field, so a crash on a paper-ground page used to flash a
          completely different site. */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[rgb(var(--bg-0))]" />

        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, var(--glow) 0%, transparent 70%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, var(--vignette) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-12 text-center">
        <div className="glass rounded-lg border border-line/10 p-8 md:p-12 backdrop-blur-xl">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--fg-0))] mb-4 tracking-tight">
            Something went off-script.
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-lg text-[rgb(var(--fg-1))] mb-8 leading-relaxed max-w-prose mx-auto">
            You're safe. Go back, or reload.
          </p>

          {/* Error details (dev only) */}
          {isDev && (
            <div className="mb-8 text-left">
              <details className="bg-scrim/20 rounded-lg border border-line/5 p-4 text-xs font-mono text-[rgb(var(--fg-1))]">
                <summary className="cursor-pointer text-[rgb(var(--fg-0))] mb-2 hover:text-[rgb(var(--accent))] transition-colors">
                  Error Details (Dev Only)
                </summary>
                <div className="mt-2 space-y-2 overflow-auto max-h-48">
                  <div>
                    <span className="text-[rgb(var(--fg-1))]">Error:</span>{" "}
                    <span className="text-red-400">{errorName}</span>
                  </div>
                  <div>
                    <span className="text-[rgb(var(--fg-1))]">Message:</span>{" "}
                    <span className="text-yellow-400">{errorMessage}</span>
                  </div>
                  {errorStack && (
                    <div className="mt-2">
                      <span className="text-[rgb(var(--fg-1))]">Stack:</span>
                      <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                        {errorStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/")}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                "bg-ink/5 hover:bg-ink/10 active:bg-ink/15",
                "border border-line/10 hover:border-line/20",
                "text-base font-medium text-[rgb(var(--fg-0))]",
                "hover:-translate-y-0.5 active:translate-y-0",
                "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-2 focus:ring-offset-transparent",
                "w-full sm:w-auto"
              )}
            >
              Go Home
            </button>

            <button
              onClick={() => window.location.reload()}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                "bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 active:bg-[rgb(var(--accent))]/25",
                "border border-[rgb(var(--accent))]/40 hover:border-[rgb(var(--accent))]/60",
                "text-base font-medium text-[rgb(var(--fg-0))]",
                "hover:-translate-y-0.5 active:translate-y-0",
                "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-2 focus:ring-offset-transparent",
                "w-full sm:w-auto"
              )}
            >
              Reload
            </button>

            {/* Copy error details button (dev only) */}
            {isDev && (
              <button
                onClick={handleCopyError}
                className={clsx(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  "bg-ink/5 hover:bg-ink/10 border border-line/10 hover:border-line/20",
                  "text-sm font-medium text-[rgb(var(--fg-1))]",
                  "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-2 focus:ring-offset-transparent",
                  "w-full sm:w-auto"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy error details</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

