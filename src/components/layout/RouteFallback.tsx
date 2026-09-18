/**
 * Shown while a lazily-loaded route chunk is in flight.
 *
 * Deliberately almost nothing: a centred pulse on the existing dark canvas. A
 * spinner or skeleton here would be louder than the wait itself — on a warm
 * connection these chunks land in well under 100ms, and anything with structure
 * would flash in and out. min-h keeps the footer from jumping up to meet it.
 */
export default function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--fg-0))]/40" />
    </div>
  );
}
