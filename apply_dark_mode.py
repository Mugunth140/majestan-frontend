import os

mappings = {
    "!bg-[#fbfbfc]": "!bg-[#fbfbfc] dark:!bg-gray-950",
    "!bg-white/80": "!bg-white/80 dark:!bg-gray-900/80",
    "!bg-white": "!bg-white dark:!bg-gray-900",
    "!bg-gray-50": "!bg-gray-50 dark:!bg-gray-800",
    "!bg-gray-100": "!bg-gray-100 dark:!bg-gray-800",
    "!text-gray-900": "!text-gray-900 dark:!text-white",
    "!text-gray-800": "!text-gray-800 dark:!text-gray-100",
    "!text-gray-700": "!text-gray-700 dark:!text-gray-200",
    "!text-gray-600": "!text-gray-600 dark:!text-gray-300",
    "!text-gray-500": "!text-gray-500 dark:!text-gray-400",
    "!border-gray-50": "!border-gray-50 dark:!border-gray-800",
    "!border-gray-100": "!border-gray-100 dark:!border-gray-800",
    "!border-gray-200": "!border-gray-200 dark:!border-gray-700",
    "!border-gray-300": "!border-gray-300 dark:!border-gray-600",
    "hover:!bg-gray-50": "hover:!bg-gray-50 dark:hover:!bg-gray-800",
    "hover:!bg-gray-100": "hover:!bg-gray-100 dark:hover:!bg-gray-700",
    "hover:!border-gray-300": "hover:!border-gray-300 dark:hover:!border-gray-600",
    # Specific layout fixes
    "bg-[#fbfbfc]!": "!bg-[#fbfbfc] dark:!bg-gray-950",
    "bg-white/80!": "!bg-white/80 dark:!bg-gray-900/80",
    "text-gray-800!": "!text-gray-800 dark:!text-gray-100"
}

def apply_dark_mode(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for light, dark in mappings.items():
            # Don't double apply
            if dark in content: continue
            content = content.replace(light, dark)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added dark mode to {filepath}")
    except Exception as e:
        pass

targets = [
    "src/app/admin/layout.tsx",
    "src/components/admin/admin-header.tsx",
    "src/components/admin/admin-sidebar.tsx",
]

# Add all Wizard files
for root, dirs, files in os.walk("src/components/admin/property-wizard"):
    for file in files:
        if file.endswith(".tsx"):
            targets.append(os.path.join(root, file))

for t in targets:
    apply_dark_mode(t)

