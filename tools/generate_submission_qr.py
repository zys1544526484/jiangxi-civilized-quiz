from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageEnhance, ImageFont
from qrcode.constants import ERROR_CORRECT_H


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "submission"
URL = "https://zys1544526484.github.io/jiangxi-civilized-quiz/"
TITLE = "四境点亮"
SUBTITLE = "江西文明答题挑战"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "msyhbd.ttc" if bold else "msyh.ttc"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size=size)


def centered_text(draw: ImageDraw.ImageDraw, y: int, text: str, text_font: ImageFont.FreeTypeFont, fill, **kwargs) -> None:
    box = draw.textbbox((0, 0), text, font=text_font, stroke_width=kwargs.get("stroke_width", 0))
    x = (1080 - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=text_font, fill=fill, **kwargs)


def build_qr(box_size: int) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=box_size,
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    return qr.make_image(fill_color="#102f25", back_color="white").convert("RGB")


def contain(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / image.width, max_height / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    return image.resize(size, Image.Resampling.LANCZOS)


def make_pure_qr() -> None:
    qr = build_qr(24)
    canvas = Image.new("RGB", (1200, 1200), "white")
    x = (canvas.width - qr.width) // 2
    y = (canvas.height - qr.height) // 2
    canvas.paste(qr, (x, y))
    canvas.save(OUTPUT / "experience-qr.png", quality=100)


def make_poster() -> None:
    background = Image.open(ROOT / "assets" / "cover-four-scenes.webp").convert("RGB")
    background = background.resize((1080, 1920), Image.Resampling.LANCZOS)
    background = ImageEnhance.Contrast(background).enhance(0.9)
    background = ImageEnhance.Brightness(background).enhance(0.78).convert("RGBA")

    overlay = Image.new("RGBA", background.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle((0, 0, 1080, 430), fill=(245, 250, 238, 218))
    overlay_draw.rectangle((0, 1430, 1080, 1920), fill=(7, 69, 48, 206))
    poster = Image.alpha_composite(background, overlay)
    draw = ImageDraw.Draw(poster)

    centered_text(draw, 105, TITLE, font(104, True), "#c73325", stroke_width=3, stroke_fill="#fff4cf")
    centered_text(draw, 236, SUBTITLE, font(55, True), "#075b40")
    centered_text(draw, 320, "文明观赛 · 文明旅游 · 文明交通 · 文明餐桌", font(27, True), "#715521")

    panel = (105, 435, 975, 1400)
    draw.rounded_rectangle(panel, radius=34, fill=(255, 253, 239, 246), outline="#e2b84f", width=6)
    qr = build_qr(14)
    qr_x = (1080 - qr.width) // 2
    poster.alpha_composite(qr.convert("RGBA"), (qr_x, 510))
    centered_text(draw, 1260, "微信扫码  开始30秒限时答题", font(37, True), "#0b6547")
    centered_text(draw, 1320, "点亮你的文明选择", font(28, False), "#8d3a26")

    boy = contain(Image.open(ROOT / "assets" / "poxiaoming-front.webp").convert("RGBA"), 260, 430)
    girl = contain(Image.open(ROOT / "assets" / "ganxiaowen-front.webp").convert("RGBA"), 340, 465)
    poster.alpha_composite(boy, (55, 1450))
    poster.alpha_composite(girl, (1080 - girl.width - 48, 1418))

    centered_text(draw, 1482, "四境待启，等你点亮", font(48, True), "#fff3be", stroke_width=2, stroke_fill="#07553d")
    centered_text(draw, 1560, "跟随鄱小明、赣小文", font(29, True), "#ffffff")
    centered_text(draw, 1605, "在江西特色场景中做出文明判断", font(29, True), "#ffffff")

    link_font = font(19, False)
    centered_text(draw, 1840, URL, link_font, "#e7f3e7")
    poster.convert("RGB").save(OUTPUT / "experience-qr-poster.png", quality=95)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    make_pure_qr()
    make_poster()
    print(OUTPUT / "experience-qr.png")
    print(OUTPUT / "experience-qr-poster.png")


if __name__ == "__main__":
    main()
