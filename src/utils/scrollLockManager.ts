/**
 * Centralized scroll lock manager with ref-counting
 * Ensures multiple modals/overlays can lock scroll without conflicts
 */

interface LockState {
  scrollTop: number;
  originalOverflow: string;
  originalOverscrollBehavior: string;
  originalTouchAction: string;
  originalPaddingRight: string;
}

class ScrollLockManager {
  private lockCount = 0;
  private lockState: LockState | null = null;
  private scrollContainer: HTMLElement | null = null;

  private getScrollContainer(): HTMLElement | null {
    if (this.scrollContainer) {
      // Verify it still exists in DOM
      if (document.contains(this.scrollContainer)) {
        return this.scrollContainer;
      }
    }

    // Find scroll container
    const container = document.querySelector('[data-scroll-container]') as HTMLElement | null;
    if (container) {
      this.scrollContainer = container;
    }
    return container;
  }

  /**
   * Lock the scroll container
   * Uses ref-counting so multiple calls require multiple unlocks
   */
  lock(): void {
    const container = this.getScrollContainer();
    if (!container) {
      console.warn('[ScrollLockManager] Scroll container not found');
      return;
    }

    this.lockCount++;

    // Only lock on first call
    if (this.lockCount === 1) {
      // Store current state
      this.lockState = {
        scrollTop: container.scrollTop,
        originalOverflow: container.style.overflow || '',
        originalOverscrollBehavior: container.style.overscrollBehavior || '',
        originalTouchAction: container.style.touchAction || '',
        originalPaddingRight: container.style.paddingRight || '',
      };

      // Calculate scrollbar width (desktop only)
      let scrollbarWidth = 0;
      if (window.innerWidth >= 1024) {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        // msOverflowStyle is IE/legacy-Edge only, so it is absent from CSSStyleDeclaration
        (outer.style as CSSStyleDeclaration & { msOverflowStyle: string }).msOverflowStyle = 'scrollbar';
        outer.style.position = 'absolute';
        outer.style.width = '100px';
        outer.style.height = '100px';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '200px';
        outer.appendChild(inner);

        scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        document.body.removeChild(outer);
      }

      // Lock scroll
      container.style.overflow = 'hidden';
      container.style.overscrollBehavior = 'contain';
      container.style.touchAction = 'none';

      // Compensate for scrollbar width to prevent layout shift (desktop only)
      if (scrollbarWidth > 0) {
        const computed = window.getComputedStyle(container);
        const currentPaddingRight = parseInt(computed.paddingRight, 10) || 0;
        container.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
      }
    }
  }

  /**
   * Unlock the scroll container
   * Uses ref-counting - only unlocks when count reaches 0
   */
  unlock(): void {
    const container = this.getScrollContainer();
    if (!container || !this.lockState) {
      // Already unlocked or never locked
      if (this.lockCount > 0) {
        this.lockCount = 0;
      }
      return;
    }

    this.lockCount--;

    // Only unlock when all locks are released
    if (this.lockCount === 0) {
      // Restore original styles (empty string removes inline style, allowing CSS classes to apply)
      container.style.overflow = this.lockState.originalOverflow || '';
      container.style.overscrollBehavior = this.lockState.originalOverscrollBehavior || '';
      container.style.touchAction = this.lockState.originalTouchAction || '';
      container.style.paddingRight = this.lockState.originalPaddingRight || '';

      // Restore scroll position after styles are restored
      requestAnimationFrame(() => {
        if (container && this.lockState) {
          container.scrollTop = this.lockState.scrollTop;
          // Ensure overflow-y-auto is active (removing inline style should let className take over)
          // But explicitly ensure it if needed
          const computed = window.getComputedStyle(container);
          if (computed.overflow === 'hidden' && !container.classList.contains('overflow-hidden')) {
            // If somehow still hidden and not intentional, force restore
            container.style.overflow = '';
          }
        }
      });

      // Clear state
      this.lockState = null;
    }
  }

  /**
   * Force unlock (emergency cleanup)
   * Resets ref-count to 0 and unlocks immediately
   */
  forceUnlock(): void {
    const container = this.getScrollContainer();
    if (container) {
      // Always restore to default (remove all inline styles to let CSS classes apply)
      container.style.overflow = '';
      container.style.overscrollBehavior = '';
      container.style.touchAction = '';
      container.style.paddingRight = '';

      if (this.lockState) {
        requestAnimationFrame(() => {
          if (container && this.lockState) {
            container.scrollTop = this.lockState.scrollTop;
          }
        });
      }
    }

    this.lockCount = 0;
    this.lockState = null;
  }

  /**
   * Get current lock state (for debugging)
   */
  getState(): { isLocked: boolean; lockCount: number; scrollTop: number } {
    const container = this.getScrollContainer();
    return {
      isLocked: this.lockCount > 0,
      lockCount: this.lockCount,
      scrollTop: container?.scrollTop ?? 0,
    };
  }
}

// Export singleton instance
export const scrollLockManager = new ScrollLockManager();

// Force unlock on page unload as safety measure
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollLockManager.forceUnlock();
  });
}

