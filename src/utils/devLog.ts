/**
 * console.log that disappears in production.
 *
 * The app traces a lot while you are working on it — route changes, overlay
 * mount/unmount, video lifecycle, scene intersection ratios. That is genuinely
 * useful in dev and pure noise to anyone who opens devtools on the live site.
 *
 * This is a source-level guard rather than a bundler `drop` option because the
 * project builds through rolldown-vite, whose Oxc transform does not expose
 * esbuild's `drop`. Vite statically replaces `import.meta.env.DEV` with `false`
 * in production, so the body folds away and the calls minify out.
 *
 * Warnings and errors are deliberately NOT routed through here: a real failure
 * should still surface in production.
 */
export function devLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}
