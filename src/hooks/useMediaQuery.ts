import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query.
 *
 * A media query is an external store: the browser owns the value, we only read
 * and subscribe. useSyncExternalStore is the right primitive for that — it
 * reads the live value during render, so the very first paint is already
 * correct and there is no setState-in-effect cascade.
 *
 * Guarded for the no-window case so the module stays safe to import anywhere
 * (tests, tooling, a future prerender pass).
 */
const SUPPORTED =
  typeof window !== "undefined" && typeof window.matchMedia === "function";

function noopSubscribe(): () => void {
  return () => {};
}

export function useMediaQuery(query: string): boolean {
  const mql = useMemo(
    () => (SUPPORTED ? window.matchMedia(query) : null),
    [query],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!mql) return noopSubscribe();
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [mql],
  );

  const getSnapshot = useCallback(() => mql?.matches ?? false, [mql]);

  // Server snapshot: assume the query does not match. Every caller in this app
  // treats `false` as the conservative default (mobile surface, motion allowed).
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
