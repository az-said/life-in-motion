import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { scrollLockManager } from "../../utils/scrollLockManager";

/**
 * Dev-only readout: route, modal detection, and scroll-lock state.
 *
 * Reads `<html>` now. It used to read `[data-scroll-container]` and report
 * "not found" once the document took over scrolling — which would have made
 * this panel lie about the exact thing it exists to watch.
 */
export default function DebugHelper() {
  const location = useLocation();
  const [scrollState, setScrollState] = useState({
    htmlOverflow: "",
    bodyOverflow: "",
    scrollY: 0,
    scrollHeight: 0,
    clientHeight: 0,
    lockCount: 0,
    isLocked: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkState = () => {
      const html = document.documentElement;
      const lockState = scrollLockManager.getState();

      setScrollState({
        // Inline first: that is what the lock manager writes, and seeing it
        // empty while the count is non-zero is the signature of a leak.
        htmlOverflow: html.style.overflow || window.getComputedStyle(html).overflow || "",
        bodyOverflow:
          document.body.style.overflow || window.getComputedStyle(document.body).overflow || "",
        scrollY: Math.round(window.scrollY),
        scrollHeight: Math.round(html.scrollHeight),
        clientHeight: Math.round(html.clientHeight),
        lockCount: lockState.lockCount,
        isLocked: lockState.isLocked,
      });

      // Check if modal/overlay is open by looking for:
      // - Fixed positioned elements with high z-index (>= 50, < 10000 to exclude debug helper)
      // - That cover significant screen area (indicating backdrop/modal)
      // Optimized: check fixed elements first (most modals/backdrops use fixed positioning)
      const fixedElements = Array.from(document.querySelectorAll('.fixed, [style*="position: fixed"]'));
      let hasModal = false;
      
      // Also check all elements for any fixed positioning (in case class isn't used)
      if (fixedElements.length === 0) {
        const allElements = Array.from(document.querySelectorAll('*'));
        fixedElements.push(...allElements.filter(el => {
          const computed = window.getComputedStyle(el);
          return computed.position === 'fixed';
        }));
      }
      
      for (const el of fixedElements) {
        const computed = window.getComputedStyle(el);
        const zIndex = parseInt(computed.zIndex, 10);
        const opacity = parseFloat(computed.opacity);
        
        if (!isNaN(zIndex) && zIndex >= 50 && zIndex < 10000 && opacity > 0) {
          const rect = el.getBoundingClientRect();
          // Check if it covers a significant portion of the screen (like a backdrop)
          const screenCoverage = (rect.width * rect.height) / (window.innerWidth * window.innerHeight);
          if (screenCoverage > 0.3) { // Covers at least 30% of screen
            hasModal = true;
            break;
          }
        }
      }
      
      setIsModalOpen(hasModal);
    };

    // Check initially
    checkState();

    // Watch for changes with MutationObserver for DOM changes
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true,
      childList: true,
    });

    // Also poll periodically for style changes that MutationObserver might miss
    const interval = setInterval(checkState, 250);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Only show in dev mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed top-2 left-2 z-[9999] px-2 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-xs font-mono text-white/80 opacity-60 pointer-events-none max-w-[300px]">
      <div className="font-semibold mb-1 text-white/90">Debug</div>
      <div>Route: {location.pathname}</div>
      <div>Modal: {isModalOpen ? "✅ OPEN" : "❌ CLOSED"}</div>
      <div>
        Lock: {scrollState.isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"} ({scrollState.lockCount})
      </div>
      <div className="mt-1 pt-1 border-t border-white/10">
        <div className="font-semibold text-white/90">Document</div>
        <div>ScrollY: {scrollState.scrollY}px</div>
        <div>ScrollHeight: {scrollState.scrollHeight}px</div>
        <div>ClientHeight: {scrollState.clientHeight}px</div>
        <div>html overflow: {scrollState.htmlOverflow || "default"}</div>
        <div>body overflow: {scrollState.bodyOverflow || "default"}</div>
      </div>
    </div>
  );
}

