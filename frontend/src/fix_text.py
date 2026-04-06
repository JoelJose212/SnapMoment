import os
import re

DIRECTORY = 'd:\\SSS\\SnapMoment\\frontend\\src'

def fix_card_color(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert color: 'var(--card)' to color: 'white'
    # as things explicitly colored white were on dark backgrounds
    new_content = re.sub(r"color:\s*['\"]var\(--card\)['\"]", "color: 'white'", content)
    # Also fix explicit inline tailwind style variants if any
    new_content = re.sub(r"color:\s*var\(--card\)", "color: white", new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed text color in {filepath}")

for root, _, files in os.walk(DIRECTORY):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_card_color(os.path.join(root, file))
