import os
import re

# We will replace hardcoded hex colors with the tailwind variables mapped to index.css
REPLACEMENTS = {
    r"#FAFAF8": "var(--background)",
    r"#F8F9FA": "var(--background)",
    r"#18101F": "var(--foreground)",
    r"#1C1E21": "var(--foreground)",
    r"#1C1018": "var(--foreground)",
    r"#E8DFF0": "var(--border)",
    r"#E5E7EB": "var(--border)",
    r"#6B5E72": "var(--muted)",
    r"#6B7280": "var(--muted)",
    r"white": "var(--card)",
    r"#FFFFFF": "var(--card)",
}

DIRECTORY = 'd:\\SSS\\SnapMoment\\frontend\\src'

def replace_colors(filepath):
    # Only touch files with 'style={{' that have these hardcoded variables
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # For safe replacing, we only want to replace inside style={{ ... }}
    # We will just replace globally because these exact hex codes are only used for css
    for old, new in REPLACEMENTS.items():
        # Edge case: 'white' might match other things, but only if preceded by '#' or inside quotes
        if old == 'white':
            new_content = re.sub(r"'white'", "'var(--card)'", new_content)
            new_content = re.sub(r'"white"', '"var(--card)"', new_content)
        else:
            # hex strings
            new_content = re.sub(f"'{old}'", f"'var(--{new[6:-1]})'", new_content, flags=re.IGNORECASE)
            new_content = re.sub(f'"{old}"', f'"var(--{new[6:-1]})"', new_content, flags=re.IGNORECASE)
            new_content = re.sub(old, new, new_content, flags=re.IGNORECASE)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Refactored colors in {filepath}")

for root, _, files in os.walk(DIRECTORY):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            replace_colors(os.path.join(root, file))
