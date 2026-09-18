import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { SITE_NAME, SITE_TITLE } from "../../content/meta";
import { clsx } from "clsx";
import OverlayMenu from "../nav/OverlayMenu";
import SmileLogo from "../ui/SmileLogo";
import SoundToggle from "../ui/SoundToggle";
import { useSound } from "../../app/providers/SoundProvider";
import HeaderBackdrop from "./HeaderBackdrop";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Story",
  "/dashboard": "Profile",
  "/story": "Story",
  "/honors": "Honors",
  "/ventures": "Ventures",
  "/atlas": "Atlas",
  "/books": "Books",
  "/about": "About",
  "/contact": "Contact",
};

export default function Header() {
  const location = useLocation();
  const sectionLabel = ROUTE_LABELS[location.pathname] || "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const { play } = useSound();
  
  // Track if we've already set up scroll listener (prevent duplicates)
  const scrollListenerSetupRef = useRef(false);

  // Track scroll - FIXED VERSION
  useEffect(() => {
    // Prevent duplicate setup
    if (scrollListenerSetupRef.current) return;
    
    let rafId: number | null = null;
    
    const handleScroll = () => {
      if (rafId !== null) return;
      
      rafId = requestAnimationFrame(() => {
        const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
        if (scrollContainer) {
          const shouldBeScrolled = scrollContainer.scrollTop > 10;
          // Only update if value actually changed
          setIsScrolled(prev => prev === shouldBeScrolled ? prev : shouldBeScrolled);
        }
        rafId = null;
      });
    };

    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
    if (scrollContainer) {
      scrollListenerSetupRef.current = true;
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      
      // Check initial scroll position AFTER a delay to avoid render loop
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          handleScroll();
        });
      });
      
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
        scrollListenerSetupRef.current = false;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, []); // Keep empty deps - only run once

  // Publish the header's real height as --header-h so the scroll container can
  // pad by exactly that much. It used to be hardcoded at 57px while the header
  // actually measures 67px, which slid the top 10px of every page underneath.
  // Measuring instead of guessing also survives the section chip appearing,
  // the font loading, and any future control landing in the row.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const menuId = "navigation-menu";

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    play("hover");
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Get button position - FIXED VERSION with debouncing
  useEffect(() => {
    if (!isMenuOpen) return;
    
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const updatePosition = () => {
      if (menuButtonRef.current) {
        const rect = menuButtonRef.current.getBoundingClientRect();
        const newPosition = {
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        };
        
        // Only update if position actually changed
        setButtonPosition(prev => {
          if (prev.top === newPosition.top && prev.right === newPosition.right) {
            return prev;
          }
          return newPosition;
        });
      }
    };
    
    const debouncedUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updatePosition, 150);
    };
    
    updatePosition(); // Initial position
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Header Backdrop - Shallow scrim gradient behind header for smooth transition */}
      <HeaderBackdrop />
      
      <motion.div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/10"
        data-header
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(10, 10, 12, 0.85)" : "rgba(10, 10, 12, 0)",
          backdropFilter: isScrolled ? "blur(12px) saturate(180%)" : "blur(0px)",
          boxShadow: isScrolled 
            ? "0 12px 40px rgba(0, 0, 0, 0.55)" 
            : "0 10px 30px rgba(0, 0, 0, 0.45)", // Subtle shadow always present
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* min-w-0 lets this column shrink instead of forcing the row wider than
            the viewport, so the title truncates rather than wrapping the header
            onto a second line. */}
        <div className="flex min-w-0 items-center gap-3">
          <SmileLogo className="w-6 h-6 shrink-0 text-[rgb(var(--fg-0))]" />
          <h1 className="truncate text-sm font-medium tracking-tight text-[rgb(var(--fg-0))]">
            <span className="sm:hidden">{SITE_NAME}</span>
            <span className="hidden sm:inline">{SITE_TITLE}</span>
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {sectionLabel && location.pathname !== "/" && (
            <span
              className={clsx(
                "text-xs tracking-wide uppercase transition-colors",
                "px-3 py-1 rounded-md",
                "bg-white/10 text-[rgb(var(--fg-0))] font-medium"
              )}
            >
              {sectionLabel}
            </span>
          )}

          <SoundToggle size="sm" />
          
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              ref={menuButtonRef}
              type="button"
              data-menu-button
              onClick={() => {
                play("click");
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-controls={menuId}
              className={clsx(
                "p-2 rounded-md transition-all duration-200 ease-out",
                "hover:bg-white/5 active:bg-white/10",
                "border border-white/10 hover:border-white/20",
                "hover:-translate-y-0.5 active:translate-y-0",
                "hover:shadow-[0_4px_12px_rgba(120,220,255,0.15)]",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
              )}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4 text-[rgb(var(--fg-0))]" />
                ) : (
                  <Menu className="w-4 h-4 text-[rgb(var(--fg-0))]" />
                )}
              </motion.div>
            </button>

            <OverlayMenu 
              id={menuId} 
              isOpen={isMenuOpen} 
              onClose={() => setIsMenuOpen(false)}
              buttonPosition={buttonPosition}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}