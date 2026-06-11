import os

def clean_classes(content):
    content = content.replace("focus:!ring-4 focus:!ring-4 focus:!ring-blue-500/10 focus:!border-blue-500", "focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500")
    content = content.replace("focus:!ring-4 focus:!ring-blue-500/10 focus:!border-blue-500", "focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500")
    
    # Fix the drag and drop area
    content = content.replace("!border-blue-500 !bg-blue-50/50", "!border-blue-500 !bg-blue-50")
    
    while "  " in content:
        content = content.replace("  ", " ")
    return content

search_dir = "src/components/admin/property-wizard"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = clean_classes(content)
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Cleaned {filepath}")
