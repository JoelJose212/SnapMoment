import io
import os
from PIL import Image, ImageDraw, ImageFont

def apply_text_watermark(image_bytes: bytes, text: str) -> bytes:
    """
    Overlays a semi-transparent watermark text at the bottom right.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    txt_layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
    
    # Premium font sizing: ~4% of the image width
    font_size = max(28, int(img.width * 0.04))
    
    # Font Discovery: Try common attractive fonts
    font = None
    font_paths = [
        "C:\\Windows\\Fonts\\pala.ttf", # Palatino Linotype
        "C:\\Windows\\Fonts\\georgia.ttf",
        "C:\\Windows\\Fonts\\times.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "arial.ttf"
    ]
    
    for path in font_paths:
        try:
            if os.path.exists(path) or path == "arial.ttf":
                font = ImageFont.truetype(path, font_size)
                break
        except Exception:
            continue
            
    if font is None:
        font = ImageFont.load_default()

    draw = ImageDraw.Draw(txt_layer)
    
    # Calculate position (Bottom Right with premium padding)
    try:
        # For modern Pillow (10+)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow
        text_width, text_height = draw.textsize(text, font=font)

    # Add 4% padding from edges for a "magazine" feel
    padding = int(img.width * 0.04)
    x = img.width - text_width - padding
    y = img.height - text_height - padding
    
    # 1. Subtle soft shadow (spread out for elegance)
    shadow_color = (0, 0, 0, 45)
    for offset in range(1, 3):
        draw.text((x + offset, y + offset), text, font=font, fill=shadow_color)
    
    # 2. Main text (Slightly more opaque for impact)
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 210))
    
    # Combine and convert back to RGB
    combined = Image.alpha_composite(img, txt_layer)
    out = io.BytesIO()
    combined.convert("RGB").save(out, format="JPEG", quality=95)
    
    return out.getvalue()
