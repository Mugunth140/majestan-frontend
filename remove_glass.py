import os

replacements = {
    # Container & general glass backgrounds
    "!bg-white/40 !backdrop-blur-xl !border !border-white/60": "!bg-white !border !border-gray-100",
    "!bg-white/40 !backdrop-blur-xl !border-white/60": "!bg-white !border-gray-100",
    "!bg-white/30 !backdrop-blur-md !border !border-white/50": "!bg-white !border !border-gray-200",
    "!bg-white/30 !backdrop-blur-md !border-white/50": "!bg-white !border-gray-200",
    "!bg-white/10 !backdrop-blur-sm !border !border-white/30": "!bg-gray-50 !border !border-gray-200",
    "!bg-white/10 !backdrop-blur-sm !border-white/30": "!bg-gray-50 !border-gray-200",
    
    # Shadows
    "!shadow-[0_8px_30px_rgb(0,0,0,0.04)]": "!shadow-sm",
    "!shadow-inner": "!shadow-sm",
    
    # Input Focus States
    "focus:!ring-blue-500/20 focus:!border-white/80": "focus:!ring-4 focus:!ring-blue-500/10 focus:!border-blue-500",
    
    # Button / Element specific
    "!bg-white/40 !backdrop-blur-md !border-white/60": "!bg-white !border-gray-200",
    "hover:!bg-white/60": "hover:!bg-gray-50",
    "hover:!bg-white/40": "hover:!bg-gray-50",
    "!bg-white/20 !border-transparent": "!bg-blue-600 !border-blue-600", # Amenities selected state
    "!bg-white/!90 !backdrop-blur-sm": "!bg-white",
    "!bg-white/90 !backdrop-blur-sm": "!bg-white",
    "!border-white/60": "!border-gray-200",
    "!bg-white/30": "!bg-white",
    "!backdrop-blur-md": "",
    "!border-white/50": "!border-gray-200"
}

def clean_classes(content):
    for old, new in replacements.items():
        content = content.replace(old, new)
    # Cleanup double spaces
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

