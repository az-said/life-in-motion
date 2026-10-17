/**
 * Document scroll lock, ref-counted so overlapping modals cannot unlock each
 * other's lock.
 *
 * The document is what scrolls (see the note in index.css), so this clamps
 * `<html>`. It used to clamp an inner `[data-scroll-container]`, which meant
 * finding that element first, caching it, and re-checking that the cached node
 * was still in the DOM on every call.
 *
 * Two things that used to live here are gone rather than ported:
 *
 *   - **Scrollbar-width compensation.** Roughly thirty lines built two
 *     throwaway divs, measured the difference between their widths, and added
 *     it back as padding so the page would not jump sideways when the scrollbar
 *     vanished. `scrollbar-gutter: stable` in index.css reserves that space
 *     permanently, so there is nothing left to compensate for.
 *   - **`touch-action: none`.** It was doing the real work of blocking touch
 *     scroll on a container that `overflow: hidden` alone would not stop. On
 *     the document it is both unnecessary and harmful: it blocks pinch-zoom,
 *     which some people need in order to read.
 */

class ScrollLockManager {
  private lockCount = 0;

  /**
   * Set while locked. Holds the inline value to put back, which is usually the
   * empty string — restoring `""` removes the inline declaration entirely and
   * lets the stylesheet take over again, rather than hardcoding a value this
   * module would then own.
   */
  private restore: { overflow: string; scrollY: number } | null = null;

  lock(): void {
    this.lockCount += 1;
    if (this.lockCount !== 1) return;

    const html = document.documentElement;
    this.restore = {
      overflow: html.style.overflow,
      scrollY: window.scrollY,
    };
    html.style.overflow = "hidden";
  }

  unlock(): void {
    if (this.lockCount === 0) return;

    this.lockCount -= 1;
    if (this.lockCount !== 0) return;

    this.applyRestore();
  }

  /** Emergency cleanup. Drops the count to zero whatever it was. */
  forceUnlock(): void {
    this.lockCount = 0;
    this.applyRestore();
  }

  getState(): { isLocked: boolean; lockCount: number; scrollY: number } {
    return {
      isLocked: this.lockCount > 0,
      lockCount: this.lockCount,
      scrollY: window.scrollY,
    };
  }

  private applyRestore(): void {
    if (!this.restore) return;

    const { overflow, scrollY } = this.restore;
    this.restore = null;

    document.documentElement.style.overflow = overflow;

    /*
     * Every current engine keeps the scroll offset across an `overflow: hidden`
     * round trip, so this is a guard rather than the mechanism — and it is
     * conditional because an unconditional `scrollTo` is itself a visible jump
     * on the common path where nothing moved. One pixel of tolerance absorbs
     * subpixel rounding on fractional-DPI displays.
     */
    if (Math.abs(window.scrollY - scrollY) > 1) {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    }
  }
}

export const scrollLockManager = new ScrollLockManager();

// Safety net: a lock that outlives the page would otherwise be restored from
// the back/forward cache still clamped.
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    scrollLockManager.forceUnlock();
  });
}
