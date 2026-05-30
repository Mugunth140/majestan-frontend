import os
import re

files = [
    "src/components/site/about/AboutHero.tsx",
    "src/components/site/about/AboutMission.tsx",
    "src/components/site/about/AboutValues.tsx",
    "src/components/site/about/AboutStats.tsx",
    "src/app/about-us/page.tsx",
]

def add_important(match):
    classes = match.group(1).split()
    new_classes = []
    for c in classes:
        if c.endswith("!"):
            new_classes.append(c)
        else:
            new_classes.append(c + "!")
    return 'className="' + " ".join(new_classes) + '"'

def add_important_template(match):
    content = match.group(1)
    # Split taking into account ${} blocks is complex, 
    # but we can just split by space and ignore items with $
    classes = content.split()
    new_classes = []
    for c in classes:
        if "${" in c or c.endswith("!"):
            new_classes.append(c)
        else:
            new_classes.append(c + "!")
    return 'className={`' + " ".join(new_classes) + '`}'

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        content = re.sub(r'className="([^"]+)"', add_important, content)
        content = re.sub(r'className=\{`([^`]+)`\}', add_important_template, content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"File not found: {filepath}")
