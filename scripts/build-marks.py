"""
Rebuilds the monochrome credential marks in public/images/logos/mono-*.png.

The sources are the original brand files kept outside the repo, in
~/Desktop/portfolio-media-originals/logos/. They are not in public/ on purpose:
Vite copies that directory verbatim into the deploy, and the originals are
multi-hundred-kilobyte plated exports nothing on the site references.

Two of the six need more than a recolour:

  - Weizmann ships as a framed bilingual lockup — tree emblem and Hebrew above a
    three-line English wordmark. At the rail's 26px cap each wordmark line lands
    at roughly four pixels, which is texture rather than type. Cropped to the
    tree panel, border included, so it stays a closed device rather than a
    fragment.
  - MEET carries a trademark superscript that is sub-pixel at rail size and
    inflates the bounding box, shrinking the wordmark inside its own slot.

Print output includes the optical scale each mark needs; those numbers live in
ORGS[...].mark.scale and have to be updated by hand when a source changes.
"""

from PIL import Image
import numpy as np

SRC = "/Users/saidazaizah/Desktop/portfolio-media-originals/logos/"
OUT = "/Users/saidazaizah/Desktop/said-life-in-motion/public/images/logos/"
CAP = 112
MARKS = ["mit", "contrary", "technion", "desy", "weizmann", "meet"]


def white_from_alpha(im):
    """Keep the shape, force every pixel white. Only valid on real alpha."""
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    o = np.zeros_like(a)
    o[..., :3] = 255.0
    o[..., 3] = a[..., 3]
    return Image.fromarray(o.astype(np.uint8))


def finish(im):
    """Trim transparent margin, then normalize to a common height."""
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    w = max(1, int(round(im.width * CAP / im.height)))
    return im.resize((w, CAP), Image.LANCZOS)


def ink_area(im):
    """Summed alpha in whole pixels — the mark's actual visual mass."""
    return float(np.asarray(im.convert("RGBA"))[..., 3].astype(np.float32).sum() / 255.0)


def main():
    wz = Image.open(SRC + "weizmann.png").convert("RGBA")
    wz = wz.crop(wz.getbbox())
    # Frame dividers measured on the trimmed original: the horizontal rule sits
    # at y=98..100 and the emblem's own right border at x=124..125.
    finish(white_from_alpha(wz.crop((0, 0, 126, 101)))).save(OUT + "mono-weizmann.png")

    mt = Image.open(OUT + "mono-meet.png").convert("RGBA")
    # Trademark glyph begins after the only wide column gap, at x=397.
    finish(mt.crop((0, 0, 392, CAP))).save(OUT + "mono-meet.png")

    loaded = [(n, Image.open(OUT + f"mono-{n}.png").convert("RGBA")) for n in MARKS]
    ref = dict((n, ink_area(im)) for n, im in loaded)["mit"]
    for n, im in loaded:
        # Heavily damped on purpose. The undamped form equalizes ink area and
        # renders Contrary at nearly twice MIT's height, which reads as a
        # ranking. 0.2 corrects most of the imbalance and none of the hierarchy.
        scale = (ref / ink_area(im)) ** 0.2
        print(f"{n:9} {im.width}x{im.height}  scale={scale:.2f}  aspect={im.width / im.height:.3f}")


if __name__ == "__main__":
    main()
