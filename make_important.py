import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def replace_quotes(match):
        inner = match.group(1)
        new_inner = []
        for t in inner.split():
            if ':' in t:
                parts = t.rsplit(':', 1)
                if not parts[1].startswith('!'):
                    parts[1] = '!' + parts[1]
                new_inner.append(':'.join(parts))
            else:
                if not t.startswith('!'):
                    new_inner.append('!' + t)
                else:
                    new_inner.append(t)
        return 'className="' + " ".join(new_inner) + '"'
        
    content = re.sub(r'className="([^"]+)"', replace_quotes, content)
    
    def replace_template(match):
        inner = match.group(1)
        def word_replacer(w_match):
            word = w_match.group(0)
            if word in ['!', '?', ':', '&&', '||', 'null', 'undefined', 'true', 'false']: return word
            if ':' in word:
                parts = word.rsplit(':', 1)
                if not parts[1].startswith('!'):
                    parts[1] = '!' + parts[1]
                return ':'.join(parts)
            if not word.startswith('!'):
                return '!' + word
            return word

        new_inner = re.sub(r'(?<![\$\{\w\-])([a-z\-]+:[a-z0-9\-\/\[\]\.]+)(?![\w\-])', word_replacer, inner)
        new_inner = re.sub(r'(?<![\$\{\w\-])([a-z]+-[a-z0-9\-\/\[\]\.]+)(?![\w\-])', word_replacer, new_inner)
        
        standalone = ['flex', 'relative', 'absolute', 'block', 'hidden', 'grid', 'border', 'shadow', 'rounded', 'outline-none', 'transition-all', 'cursor-pointer', 'overflow-hidden', 'group', 'p-4', 'p-6', 'p-8', 'p-10']
        for s in standalone:
            new_inner = re.sub(r'(?<![\$\{\w\-])(' + s + r')(?![\w\-])', '!' + s, new_inner)
            
        return 'className={`' + new_inner + '`}'
        
    content = re.sub(r'className=\{\`([^`]+)`\}', replace_template, content)
    
    content = content.replace("!max-w-5xl", "!max-w-full")
    content = content.replace("!max-w-6xl", "!max-w-full")
    content = content.replace("!!", "!") # Fix double bangs if any

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Processed " + filepath)

search_dir = "src/components/admin/property-wizard"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            process_file(os.path.join(root, file))

process_file("src/app/admin/properties/new/page.tsx")
process_file("src/app/post-property/page.tsx")

