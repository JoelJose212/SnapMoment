import io
import os
from PIL import Image, ImageDraw, ImageFont

def apply_text_watermark(image_bytes: bytes, text: str) -> bytes:
    """
    Overlays a semi-transparent watermark text at the bottom right.
    Highly optimized: Only composites a small text-sized region instead of the whole image.
    """
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
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

    dummy_draw = ImageDraw.Draw(img)
    
    # Calculate position (Bottom Right with premium padding)
    try:
        # For modern Pillow (10+)
        bbox = dummy_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow
        text_width, text_height = dummy_draw.textsize(text, font=font)

    # Add 4% padding from edges for a "magazine" feel
    padding = int(img.width * 0.04)
    x = img.width - text_width - padding
    y = img.height - text_height - padding
    
    # Create a small RGBA image just for the text (with buffer for shadow)
    txt_img = Image.new("RGBA", (text_width + 10, text_height + 10), (255, 255, 255, 0))
    txt_draw = ImageDraw.Draw(txt_img)
    
    # 1. Subtle soft shadow (spread out for elegance)
    shadow_color = (0, 0, 0, 45)
    for offset in range(1, 3):
        txt_draw.text((offset, offset), text, font=font, fill=shadow_color)
    
    # 2. Main text (Slightly more opaque for impact)
    txt_draw.text((0, 0), text, font=font, fill=(255, 255, 255, 210))
    
    # Combine directly via paste mask (100x faster than alpha_composite on full image)
    img.paste(txt_img, (x, y), txt_img)
    
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=85) # Optimize quality for speed and storage
    
    return out.getvalue()
