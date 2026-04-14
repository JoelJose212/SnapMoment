import io
import os
from PIL import Image, ImageDraw, ImageFont

def apply_text_watermark(image_bytes: bytes, text: str) -> bytes:
    """
    Overlays a semi-transparent watermark text at the bottom right.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    txt_layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
    
    # Smart font sizing: ~3% of the image width
    font_size = max(20, int(img.width * 0.03))
    
    # Font Discovery: Try common system fonts
    font = None
    font_paths = [
        "C:\\Windows\\Fonts\\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
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
    
    # Calculate position (Bottom Right with padding)
    try:
        # For modern Pillow (10+)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow
        text_width, text_height = draw.textsize(text, font=font)

    x = img.width - text_width - int(img.width * 0.02)
    y = img.height - text_height - int(img.height * 0.02)
    
    # Draw shadow/outline for readability
    outline_color = (0, 0, 0, 100)
    draw.text((x+1, y+1), text, font=font, fill=outline_color)
    
    # Draw main text (Semi-transparent white)
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 160))
    
    # Combine and convert back to RGB
    combined = Image.alpha_composite(img, txt_layer)
    out = io.BytesIO()
    combined.convert("RGB").save(out, format="JPEG", quality=90)
    
    return out.getvalue()
