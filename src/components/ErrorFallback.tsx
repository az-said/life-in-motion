import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Copy, Check } from "lucide-react";

// Error fallback UI component (extracted for reuse)
function ErrorFallbackUI({ error, errorInfo }: { error: Error | null; errorInfo?: React.ErrorInfo | null }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isDev = import.meta.env.DEV;

  const handleCopyError = async () => {
    if (!error) return;
    
    const errorDetails = `
Error: ${error.name}
Message: ${error.message}
Stack: ${error.stack || "No stack trace available"}
${errorInfo ? `Component Stack: ${errorInfo.componentStack}` : ""}
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
      {/* Cinematic background layers */}
      <div className="absolute inset-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[rgb(var(--bg-0))]" />
        
        {/* Subtle animated gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(120, 220, 255, 0.1) 0%, transparent 70%)",
          }}
        />
        
        {/* Vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-12 text-center">
        <div className="glass rounded-lg border border-white/10 p-8 md:p-12 backdrop-blur-xl">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[rgb(var(--fg-0))] mb-4 tracking-tight">
            Something went off-script.
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-lg text-[rgb(var(--fg-1))] mb-8 leading-relaxed max-w-prose mx-auto">
            You're safe. Go back, or reload.
          </p>

          {/* Error details (dev only) */}
          {isDev && error && (
            <div className="mb-8 text-left">
              <details className="bg-black/20 rounded-lg border border-white/5 p-4 text-xs font-mono text-[rgb(var(--fg-1))]">
                <summary className="cursor-pointer text-[rgb(var(--fg-0))] mb-2 hover:text-[rgb(var(--accent))] transition-colors">
                  Error Details (Dev Only)
                </summary>
                <div className="mt-2 space-y-2 overflow-auto max-h-48">
                  <div>
                    <span className="text-[rgb(var(--fg-1))]">Error:</span>{" "}
                    <span className="text-red-400">{error.name}</span>
                  </div>
                  <div>
                    <span className="text-[rgb(var(--fg-1))]">Message:</span>{" "}
                    <span className="text-yellow-400">{error.message}</span>
                  </div>
                  {error.stack && (
                    <div className="mt-2">
                      <span className="text-[rgb(var(--fg-1))]">Stack:</span>
                      <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
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
                "bg-white/5 hover:bg-white/10 active:bg-white/15",
                "border border-white/10 hover:border-white/20",
                "text-base font-medium text-[rgb(var(--fg-0))]",
                "hover:-translate-y-0.5 active:translate-y-0",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent",
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
            {isDev && error && (
              <button
                onClick={handleCopyError}
                className={clsx(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
                  "text-sm font-medium text-[rgb(var(--fg-1))]",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent",
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

// Wrapper to use navigate hook inside class component
export function ErrorFallbackWithNavigate({ error, errorInfo }: { error: Error | null; errorInfo?: React.ErrorInfo | null }) {
  return <ErrorFallbackUI error={error} errorInfo={errorInfo} />;
}
