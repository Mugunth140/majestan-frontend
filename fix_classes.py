import re

filepath = 'src/app/admin/sublocations/new/page.tsx'

with open(filepath, 'r') as f:
    content = f.read()

def swap_important(match):
    classes = match.group(1).split()
    new_classes = []
    for c in classes:
        # Strip all '!' first
        clean_c = c.replace('!', '')
        # Add a single '!' at the end
        new_classes.append(clean_c + '!')
    return 'className="' + " ".join(new_classes) + '"'

content = re.sub(r'className="([^"]+)"', swap_important, content)

with open(filepath, 'w') as f:
    f.write(content)
