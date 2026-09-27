"""
Rebuilds the monochrome credential marks in public/images/logos/mono-*.png.

Sources are the original brand files kept outside the repo, in
~/Desktop/portfolio-media-originals/logos/. They are not in public/ on purpose:
Vite copies that directory verbatim into the deploy, and the originals are
multi-hundred-kilobyte plated exports nothing on the site references.

Every mark is derived from its original on every run, so this is idempotent —
re-running cannot compound a crop. Output is white-on-transparent at a common
height; the rail tints it through a CSS mask (see .cred-mark in index.css).

The four recovery modes exist because only half the originals have real alpha:

  alpha     Real transparency already. Keep the shape, force the pixels white.
  ink       Art sitting on an opaque white plate. Darkness becomes opacity, so
            antialiased edges survive instead of stair-stepping.
  knockout  A light glyph on a dark plate, where `ink` would produce a negative.
  keyline   Real alpha, but the shape is drawn with a white outline around it.
            `alpha` would fuse the glyphs to their own outline and hand back a
            solid blob — TNT's three letters share one keyline and merge into a
            single slab. This drops anything near white and takes everything
            else at full weight, so the letters separate and the arc keeps the
            same density as the type instead of ghosting behind it.

Two marks need geometry, not just colour:

  - Weizmann ships as a framed bilingual lockup — tree emblem and Hebrew above a
    three-line English wordmark. At the rail's 26px cap each wordmark line lands
    at roughly four pixels, which is texture rather than type. Cropped to the
    tree panel, border included, so it stays a closed device rather than a
    fragment.
  - MEET carries a trademark superscript that is sub-pixel at rail size and
    inflates the bounding box, shrinking the wordmark inside its own slot.

Printed output is the optical scale and aspect each mark needs. Those numbers
live in ORGS[...].mark and have to be copied across by hand when a source
changes — deliberately manual, since a silent size change is hard to notice.
"""

from PIL import Image
import numpy as np

SRC = "/Users/saidazaizah/Desktop/portfolio-media-originals/logos/"
OUT = "/Users/saidazaizah/Desktop/said-life-in-motion/public/images/logos/"
CAP = 112

# name -> (source file, recovery mode)
MARKS = [
    ("mit", "mit.png", "alpha"),
    ("contrary", "contrary.png", "knockout"),
    ("technion", "technion.png", "alpha"),
    ("desy", "desy.png", "ink"),
    ("weizmann", "weizmann.png", "alpha"),
    ("trust-center", "trust-center.png", "alpha"),
    ("meet", "meet.png", "alpha"),
    ("yc", "yc.png", "ink"),
    ("zfellows", "zfellows.png", "ink"),
    ("rho", "rho.png", "ink"),
    ("tnt", "tnt.png", "keyline"),
]


def recover(im, mode):
    """Flatten any of the three source shapes to white on real alpha."""
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    mn = rgb.min(axis=-1)

    if mode == "alpha":
        out = al
    elif mode == "ink":
        # Distance from white is the ink. Normalizing to the 99th percentile
        # matters for flat brand colours: Y Combinator's orange bottoms out at a
        # min-channel of 30, so the raw form would render the whole mark at 88%
        # opacity and read as washed out next to a true black wordmark.
        raw = 255.0 - mn
        peak = np.percentile(raw, 99)
        out = np.clip(raw * (255.0 / peak), 0, 255) * (al / 255.0) if peak > 0 else raw
    elif mode == "keyline":
        # A 40-wide ramp starting just off white. The source is bimodal — the
        # min-channel sits at 19..22 across the letters and arc and at 252..255
        # on the keyline, with almost nothing between — so the ramp only has to
        # clear the white and everything real arrives at full opacity.
        out = np.clip((255.0 - mn - 40.0) / 40.0, 0, 1) * 255.0 * (al / 255.0)
    elif mode == "knockout":
        # A hard ramp, not a threshold. Contrary's plate is a gradient whose
        # min-channel sits at 52/67/76 across the p50/p80/p90 band and only
        # jumps to 215 at p95, so anything gentler leaves the plate behind as a
        # faint rectangle.
        out = np.clip((mn - 100.0) / 100.0, 0, 1) * 255.0 * (al / 255.0)
    else:
        raise ValueError(mode)

    o = np.zeros_like(a)
    o[..., :3] = 255.0
    o[..., 3] = np.clip(out, 0, 255)
    return Image.fromarray(o.astype(np.uint8))


def finish(im):
    """Trim transparent margin, then normalize to a common height."""
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    w = max(1, int(round(im.width * CAP / im.height)))
    return im.resize((w, CAP), Image.LANCZOS)


def drop_trailing_fragment(im, max_share=0.12):
    """
    Strip a small detached glyph off the right edge — MEET's trademark sign.

    Measured rather than hardcoded so replacing the source file cannot silently
    reintroduce it. Only fires on a genuinely detached fragment worth less than
    `max_share` of the width, so it can never bite off a real letter.
    """
    cols = (np.asarray(im)[..., 3] > 20).any(axis=0)
    gaps = []
    start = None
    for i, filled in enumerate(cols):
        if not filled and start is None:
            start = i
        elif filled and start is not None:
            gaps.append((start, i))
            start = None
    # Right to left, and only gaps wide enough to be a real separator. The
    # rightmost gap of any kind is not the one wanted: MEET's trademark sign is
    # itself two glyphs with a one-pixel gap between them, so the last gap sits
    # inside the fragment rather than before it.
    for gap_start, gap_end in reversed(gaps):
        if gap_end - gap_start <= 3:
            continue
        if (len(cols) - gap_end) / len(cols) < max_share:
            return im.crop((0, 0, gap_start, im.height))
        break
    return im


def ink_area(im):
    """Summed alpha in whole pixels — the mark's actual visual mass."""
    return float(np.asarray(im.convert("RGBA"))[..., 3].astype(np.float32).sum() / 255.0)


def build(name, src, mode):
    im = Image.open(SRC + src).convert("RGBA")
    im = im.crop(im.getbbox() or (0, 0, im.width, im.height))

    if name == "weizmann":
        # Frame rules measured on the trimmed original: the horizontal divider
        # sits at y=98..100 and the emblem's own right border at x=124..125.
        im = im.crop((0, 0, 126, 101))

    mark = finish(recover(im, mode))
    if name == "meet":
        mark = finish(drop_trailing_fragment(mark))
    mark.save(OUT + f"mono-{name}.png")
    return mark


def main():
    built = [(n, build(n, s, m)) for n, s, m in MARKS]
    ref = next(ink_area(im) for n, im in built if n == "mit")
    for n, im in built:
        # Heavily damped on purpose. The undamped form equalizes ink area and
        # renders Contrary at nearly twice MIT's height, which reads as a
        # ranking. 0.2 corrects most of the imbalance and none of the hierarchy.
        scale = (ref / ink_area(im)) ** 0.2
        print(
            f"{n:13} {im.width:>3}x{im.height}  "
            f"scale: {scale:.2f}  width: {im.width}, height: {im.height}"
        )


if __name__ == "__main__":
    main()
