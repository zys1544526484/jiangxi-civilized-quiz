"""Prepare lightweight mobile delivery assets without changing the artwork."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SCENE_DIR = ROOT / "assets" / "scenes"
AUDIO_DIR = ROOT / "assets" / "audio"
MAX_SCENE_WIDTH = 720
SCENE_QUALITY = 72
COVER_WIDTH = 720
IP_HEIGHT = 600


def optimize_oversized_scenes() -> None:
    for path in sorted(SCENE_DIR.glob("*.webp")):
        with Image.open(path) as source:
            if source.width <= MAX_SCENE_WIDTH:
                continue
            height = round(source.height * MAX_SCENE_WIDTH / source.width)
            resized = source.resize((MAX_SCENE_WIDTH, height), Image.Resampling.LANCZOS)
            temporary = path.with_suffix(".optimized.webp")
            resized.save(temporary, "WEBP", quality=SCENE_QUALITY, method=6)
        temporary.replace(path)
        print(f"optimized {path.name}: {MAX_SCENE_WIDTH}x{height}")


def optimize_cover_and_ip() -> None:
    cover_path = ROOT / "assets" / "cover-four-scenes.webp"
    with Image.open(cover_path) as source:
        if source.width <= COVER_WIDTH:
            print(f"kept {cover_path.name}: {source.width}x{source.height}")
        else:
            height = round(source.height * COVER_WIDTH / source.width)
            resized = source.convert("RGB").resize((COVER_WIDTH, height), Image.Resampling.LANCZOS)
            resized.save(cover_path, "WEBP", quality=76, method=6)
            print(f"optimized {cover_path.name}: {COVER_WIDTH}x{height}")

    for name in ("ganxiaowen-front.webp", "poxiaoming-front.webp"):
        path = ROOT / "assets" / name
        with Image.open(path) as source:
            if source.height <= IP_HEIGHT:
                print(f"kept {path.name}: {source.width}x{source.height}")
                continue
            width = round(source.width * IP_HEIGHT / source.height)
            resized = source.convert("RGBA").resize((width, IP_HEIGHT), Image.Resampling.LANCZOS)
            resized.save(path, "WEBP", quality=84, method=6)
            print(f"optimized {path.name}: {width}x{IP_HEIGHT}")


def create_mobile_title() -> None:
    source_path = ROOT / "assets" / "title-logo-jiangxi-quiz.png"
    target_path = ROOT / "assets" / "title-logo-jiangxi-quiz.webp"
    with Image.open(source_path) as source:
        target_width = 1200
        target_height = round(source.height * target_width / source.width)
        resized = source.resize((target_width, target_height), Image.Resampling.LANCZOS)
        resized.save(target_path, "WEBP", quality=90, method=6)
    print(f"created {target_path.name}: {target_width}x{target_height}")


def create_mp3_delivery_copies() -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required to create MP3 delivery copies")

    for stem in ("cover-loop", "game-loop"):
        source = AUDIO_DIR / f"{stem}.wav"
        target = AUDIO_DIR / f"{stem}.mp3"
        subprocess.run(
            [
                ffmpeg,
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(source),
                "-codec:a",
                "libmp3lame",
                "-b:a",
                "80k",
                str(target),
            ],
            check=True,
        )
        print(f"created {target.name}")


if __name__ == "__main__":
    optimize_oversized_scenes()
    optimize_cover_and_ip()
    create_mobile_title()
    create_mp3_delivery_copies()
