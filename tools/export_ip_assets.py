from pathlib import Path

import numpy as np
from scipy import ndimage
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets"
DESKTOP = Path.home() / "Desktop"

SOURCES = [
    (
        DESKTOP / "赣小文平面三视图.png",
        "ganxiaowen",
    ),
    (
        DESKTOP / "鄱小明平面三视图.png",
        "poxiaoming",
    ),
]


def remove_edge_white_background(image: Image.Image) -> Image.Image:
    rgba = np.array(image.convert("RGBA"))
    rgb = rgba[:, :, :3]
    near_white = (rgb[:, :, 0] > 244) & (rgb[:, :, 1] > 244) & (rgb[:, :, 2] > 244)
    labels, _ = ndimage.label(near_white)

    edge_labels = np.unique(
        np.concatenate(
            [
                labels[0, :],
                labels[-1, :],
                labels[:, 0],
                labels[:, -1],
            ]
        )
    )
    edge_labels = edge_labels[edge_labels != 0]
    background = np.isin(labels, edge_labels)
    rgba[background, 3] = 0
    return Image.fromarray(rgba, "RGBA")


def crop_front_view(image: Image.Image) -> Image.Image:
    alpha = np.array(image.getchannel("A"))
    labels, label_count = ndimage.label(alpha > 8)
    objects = ndimage.find_objects(labels)
    candidates = []

    for label_id in range(1, label_count + 1):
        slices = objects[label_id - 1]
        if slices is None:
            continue
        y_slice, x_slice = slices
        area = int((labels[slices] == label_id).sum())
        if area < 20_000:
            continue
        center_x = (x_slice.start + x_slice.stop) / 2
        candidates.append((center_x, area, label_id, x_slice, y_slice))

    if not candidates:
        raise ValueError("Could not find a front-view character component")

    _, _, label_id, x_slice, y_slice = min(candidates, key=lambda item: item[0])
    component = labels == label_id
    isolated = Image.new("RGBA", image.size, (0, 0, 0, 0))
    isolated.paste(image, mask=Image.fromarray((component * 255).astype("uint8"), "L"))

    left, top, right, bottom = x_slice.start, y_slice.start, x_slice.stop, y_slice.stop
    pad_x = max(18, int((right - left) * 0.045))
    pad_y = max(24, int((bottom - top) * 0.035))
    crop = (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(image.width, right + pad_x),
        min(image.height, bottom + pad_y),
    )
    return isolated.crop(crop)


def resize_for_web(image: Image.Image, max_height: int = 960) -> Image.Image:
    if image.height <= max_height:
        return image
    ratio = max_height / image.height
    return image.resize((int(image.width * ratio), max_height), Image.Resampling.LANCZOS)


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    for source, name in SOURCES:
        image = remove_edge_white_background(Image.open(source))
        front = resize_for_web(crop_front_view(image))

        png_path = ASSET_DIR / f"{name}-front.png"
        webp_path = ASSET_DIR / f"{name}-front.webp"
        front.save(png_path, optimize=True)
        front.save(webp_path, "WEBP", quality=88, method=6)

        print(f"{name}: {front.size[0]}x{front.size[1]} -> {png_path.name}, {webp_path.name}")


if __name__ == "__main__":
    main()
