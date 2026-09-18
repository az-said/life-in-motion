import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { createNavLogger } from "../../utils/navigation";
import { useScrollContainerLock } from "../../hooks/useScrollContainerLock";
import { useSound } from "../../app/providers/SoundProvider";

/**
 * The site's only navigation surface: a panel anchored under the header's menu
 * button.
 *
 * This component used to carry a second, full-screen "sheet" layout behind
 * `buttonPosition ? ... : ...` on roughly every line — two paddings, two type
 * scales, a close-button header, a backdrop, a Quick Jumps chip row and a
 * route-conditional "Skip to Honors" item that only the sheet rendered. None of
 * it ever ran. Header holds `buttonPosition` in `useState({ top: 0, right: 0 })`
 * and only ever replaces it with another object, so the value is never falsy
 * and the sheet branch was unreachable on every screen size, phone included.
 *
 * What shipped, therefore, was the dropdown — at a fixed `w-96`, anchored 24px
 * from the right edge, which is 408px of demand on a 390px phone. It hung off
 * the left of the window. That is fixed below with a width that yields to the
 * viewport.
 */

interface OverlayMenuProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Measured by Header and kept current through a resize observer. */
  buttonPosition: { top: number; right: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  // Profile sits first: it is the front door and the target of the card's QR.
  { label: "Profile", path: "/dashboard", description: "Work, numbers, CV" },
  { label: "Story", path: "/story", description: "Journey through time" },
  { label: "Honors", path: "/honors", description: "Recognition and achievements" },
  { label: "Ventures", path: "/ventures", description: "Projects and initiatives" },
  { label: "Life Atlas", path: "/atlas", description: "Interactive journey map" },
  { label: "Books", path: "/books", description: "Reading and recommendations" },
  { label: "About", path: "/about", description: "Background and philosophy" },
  { label: "Contact", path: "/contact", description: "Get in touch" },
];

export default function OverlayMenu({
  id,
  isOpen,
  onClose,
  buttonPosition,
  onMouseEnter,
  onMouseLeave,
}: OverlayMenuProps) {
  const navigate = useNavigate();
  const nav = createNavLogger(navigate);
  const location = useLocation();
  const { play } = useSound();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Robust pointerdown outside handler (React 18 StrictMode safe)
  // Track when menu opened to ignore events that happened before handler was attached
  const menuOpenedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Record when menu was opened (with small delay to let button click finish)
      menuOpenedAtRef.current = performance.now() + 10;
    } else {
      menuOpenedAtRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Get button ref synchronously when handler is attached
    const button = document.querySelector(
      'button[data-menu-button]'
    ) as HTMLButtonElement;
    menuButtonRef.current = button;

    const handlePointerDown = (event: PointerEvent) => {
      // Ignore events that happened before the menu was opened
      // This prevents catching the button's own click event
      if (menuOpenedAtRef.current && event.timeStamp < menuOpenedAtRef.current) {
        return;
      }

      const target = event.target as Node;

      // Ignore if clicking inside the menu panel
      if (menuRef.current?.contains(target)) {
        return;
      }

      // Ignore if clicking the menu button itself (check both ref and direct query)
      if (
        menuButtonRef.current?.contains(target) ||
        button?.contains(target) ||
        (target instanceof Element && target.closest('button[data-menu-button]'))
      ) {
        return;
      }

      // Close menu on outside click
      onClose();
    };

    // Use capture phase to catch events before they bubble
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isOpen, onClose]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  /**
   * Focus trap.
   *
   * The focusable set is queried live rather than held in refs — the opening
   * focus used to target a ref on the close button, which lived in the branch
   * that never rendered, so opening the menu focused nothing at all.
   */
  useEffect(() => {
    if (!isOpen) return;

    const focusable = () =>
      menuRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const elements = focusable();
      if (!elements || elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    const focusTimer = setTimeout(() => focusable()?.[0]?.focus(), 100);

    return () => {
      document.removeEventListener("keydown", handleTab);
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Lock internal scroll container when menu is open
  useScrollContainerLock(isOpen);

  const handleNavClick = (path: string) => {
    play("click");
    // Prevent navigation if already on the same route
    if (location.pathname === path) {
      onClose();
      return;
    }

    // Navigate first
    nav(path, undefined, `OverlayMenu: clicked ${path}`);

    // Close menu AFTER navigation completes (next tick)
    // This prevents parent re-render from interfering with navigation
    setTimeout(() => {
      onClose();
    }, 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          // Opacity, scale and translate only. This used to animate `rotateY`,
          // a 3D transform, on an element that also carries `backdrop-blur-xl`
          // — which makes the browser re-sample the blur through a perspective
          // transform on every frame of the open.
          initial={{ scale: 0.96, opacity: 0, y: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{
            transformOrigin: "top right",
            top: `${buttonPosition.top}px`,
            right: `${buttonPosition.right}px`,
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          id={id}
          // 20rem on a laptop, but never wider than the screen minus a gutter.
          className="fixed z-[201] pointer-events-auto w-[min(20rem,calc(100vw-2rem))]"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className={clsx(
              "flex flex-col glass overflow-hidden rounded-lg",
              "border border-white/10 bg-[rgb(var(--bg-0))]/90 backdrop-blur-xl",
              "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
              // Sizes to its content. It only becomes a scroller once the list
              // is taller than the space left under the header.
              "max-h-[calc(100dvh-5.5rem)]",
            )}
          >
            <nav className="overflow-y-auto p-2 space-y-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isCurrent = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    onMouseEnter={() => play("hover")}
                    aria-current={isCurrent ? "page" : undefined}
                    className={clsx(
                      "w-full rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                      "hover:bg-white/5 active:bg-white/10",
                      "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20",
                      isCurrent && "bg-white/[0.07]",
                    )}
                  >
                    <div className="text-sm font-medium text-[rgb(var(--fg-0))]">
                      {item.label}
                    </div>
                    <div className="text-xs text-[rgb(var(--fg-1))]">
                      {item.description}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
