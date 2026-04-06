import os
import re

DIRECTORY = 'd:\\SSS\\SnapMoment\\frontend\\src'

def fix_gradients(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert var(--foreground) inside gradients back to #18101F since they were hardcoded dark backgrounds
    new_content = re.sub(r"linear-gradient\([^)]*var\(--foreground\)[^)]*\)", lambda m: m.group(0).replace("var(--foreground)", "#18101F"), content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed gradients in {filepath}")

for root, _, files in os.walk(DIRECTORY):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_gradients(os.path.join(root, file))
