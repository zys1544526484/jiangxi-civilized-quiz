"""Prepare lightweight mobile delivery assets without changing the artwork."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SCENE_DIR = ROOT / "assets" / "scenes"
AUDIO_DIR = ROOT / "assets" / "audio"
MAX_SCENE_WIDTH = 960


def optimize_oversized_scenes() -> None:
    for path in sorted(SCENE_DIR.glob("*.webp")):
        with Image.open(path) as source:
            if source.width <= MAX_SCENE_WIDTH:
                continue
            height = round(source.height * MAX_SCENE_WIDTH / source.width)
            resized = source.resize((MAX_SCENE_WIDTH, height), Image.Resampling.LANCZOS)
            temporary = path.with_suffix(".optimized.webp")
            resized.save(temporary, "WEBP", quality=78, method=6)
        temporary.replace(path)
        print(f"optimized {path.name}: {MAX_SCENE_WIDTH}x{height}")


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
    create_mobile_title()
    create_mp3_delivery_copies()
