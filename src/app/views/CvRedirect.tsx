import { useEffect } from "react";
import { CV_FILE } from "../../content/profile";

/**
 * /cv fallback.
 *
 * In production this route is never reached: vercel.json answers /cv with a 307
 * before the SPA rewrite runs. This exists for two cases.
 *
 *   1. `npm run dev` — Vite knows nothing about vercel.json.
 *   2. The day the vercel.json redirect is accidentally deleted. The URL is
 *      printed on a business card that cannot be reprinted, so it gets a
 *      belt-and-braces fallback in the app itself.
 *
 * `location.replace` rather than `assign` keeps /cv out of the history stack —
 * Back from the PDF returns to wherever the visitor came from.
 */
export default function CvRedirect() {
  useEffect(() => {
    window.location.replace(CV_FILE);
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6">
      <p className="text-sm text-[rgb(var(--fg-1))]">
        Opening the CV…{" "}
        <a
          href={CV_FILE}
          className="text-[rgb(var(--fg-0))] underline underline-offset-4"
        >
          Download directly
        </a>
      </p>
    </div>
  );
}
