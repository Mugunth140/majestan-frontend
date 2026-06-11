import os
import re

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return

    def replacer(match):
        class_name = match.group(1)
        if ':' in class_name:
            parts = class_name.split(':')
            variant = ':'.join(parts[:-1])
            utility = parts[-1]
            return f"{variant}:!{utility}"
        else:
            return f"!{class_name}"

    fixed_content = re.sub(r'([a-z0-9A-Z\-\/\[\]\.\#\%\:]+)!', replacer, content)

    if content != fixed_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed {filepath}")

search_dir = "src/components/admin/property-wizard"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            fix_file(os.path.join(root, file))

fix_file("src/app/admin/properties/new/page.tsx")
fix_file("src/app/post-property/page.tsx")
fix_file("src/components/site/auth/user-auth-modal.tsx")

