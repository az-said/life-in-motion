#!/usr/bin/env python3
"""
Shrink the photo and video payload under public/ to web sizes.

Why this exists: the gallery images came straight off a phone — 4032x3024,
2-3 MB each — and the teaser clips were screen recordings. None of it loads on
the dashboard, but every case-file a recruiter opens pulls multi-megabyte JPEGs
over conference wifi, and the whole lot ships on every deploy.

Targets: 1920px on the long edge, JPEG quality 80, H.264 MP4 for video. That is
indistinguishable on a laptop screen and roughly an order of magnitude smaller.

Only touches public/images/life and public/teasers. Logos are left alone — they
are small already and re-encoding flat colour costs quality for no gain.

Originals were copied to ~/Desktop/portfolio-media-originals before the first
run. Re-running is safe but lossy, so do not run it repeatedly on the same files.

Usage:
    python3 scripts/compress-media.py --dry-run
    python3 scripts/compress-media.py
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "public" / "images" / "life"
VIDEO_DIR = ROOT / "public" / "teasers"

MAX_EDGE = 1920
JPEG_QUALITY = "80"
JPEG_SUFFIXES = {".jpg", ".jpeg"}
PNG_SUFFIXES = {".png"}
VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v"}


def human(num_bytes: int) -> str:
    value = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f}{unit}"
        value /= 1024
    return f"{value:.1f}GB"


def long_edge(path: Path) -> int | None:
    """Longest pixel dimension, or None if sips cannot read the file."""
    try:
        out = subprocess.run(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    except subprocess.CalledProcessError:
        return None

    dims = [int(line.split(":")[1]) for line in out.splitlines() if ":" in line and line.split(":")[0].strip() in ("pixelWidth", "pixelHeight")]
    return max(dims) if dims else None


def compress_image(path: Path, dry_run: bool) -> tuple[int, int]:
    before = path.stat().st_size
    edge = long_edge(path)
    if edge is None:
        return before, before

    cmd = ["sips"]
    if edge > MAX_EDGE:
        cmd += ["-Z", str(MAX_EDGE)]
    if path.suffix.lower() in JPEG_SUFFIXES:
        cmd += ["-s", "format", "jpeg", "-s", "formatOptions", JPEG_QUALITY]
    cmd += [str(path), "--out", str(path)]

    # A PNG that is already small enough has nothing left to do.
    if edge <= MAX_EDGE and path.suffix.lower() in PNG_SUFFIXES:
        return before, before

    if dry_run:
        return before, before

    subprocess.run(cmd, capture_output=True, check=False)
    return before, path.stat().st_size


def compress_video(path: Path, dry_run: bool) -> tuple[int, int, Path]:
    """Re-encode to a web-friendly MP4. Returns (before, after, new_path)."""
    before = path.stat().st_size
    target = path.with_suffix(".mp4")
    temp = path.with_name(path.stem + ".compressed.mp4")

    if dry_run:
        return before, before, target

    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(path),
            "-vf", f"scale='min({MAX_EDGE},iw)':-2",
            "-c:v", "libx264", "-crf", "26", "-preset", "slow",
            "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "128k",
            str(temp),
        ],
        capture_output=True,
        check=False,
    )

    if not temp.exists() or temp.stat().st_size == 0:
        temp.unlink(missing_ok=True)
        return before, before, path

    # Only keep the re-encode if it actually won.
    if temp.stat().st_size >= before:
        temp.unlink()
        return before, before, path

    if target != path:
        path.unlink()
    temp.replace(target)
    return before, target.stat().st_size, target


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report sizes without writing")
    args = parser.parse_args()

    total_before = 0
    total_after = 0
    renames: list[tuple[Path, Path]] = []

    images = sorted(
        p for p in IMAGE_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in JPEG_SUFFIXES | PNG_SUFFIXES
    )
    for path in images:
        before, after = compress_image(path, args.dry_run)
        total_before += before
        total_after += after
        if before != after:
            print(f"  {path.relative_to(ROOT)}: {human(before)} -> {human(after)}")

    videos = sorted(
        p for p in VIDEO_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in VIDEO_SUFFIXES
    )
    for path in videos:
        before, after, new_path = compress_video(path, args.dry_run)
        total_before += before
        total_after += after
        if before != after:
            print(f"  {path.relative_to(ROOT)}: {human(before)} -> {human(after)}")
        if new_path != path:
            renames.append((path, new_path))

    print()
    print(f"total: {human(total_before)} -> {human(total_after)}")
    if renames:
        print("\nfilenames changed — update the references in src/content:")
        for old, new in renames:
            print(f"  {old.relative_to(ROOT)} -> {new.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
