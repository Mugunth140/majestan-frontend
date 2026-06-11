import os
import re

input_class = 'className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-400 hover:bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"'
select_class = 'className="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 font-medium rounded-xl pl-4 pr-10 py-3 text-[14px] outline-none transition-all cursor-pointer hover:bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"'
label_class = 'className="block text-[13px] font-semibold text-gray-700 mb-1.5"'
error_class = 'className="text-rose-500 text-[12px] font-medium mt-1.5"'

def replace_classes(content):
    # Inputs
    content = re.sub(
        r'className="w-full! bg-white! border! border-gray-200! rounded-xl! px-4! py-2.5! text-\[14px\]! font-medium! text-gray-800! focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all"',
        input_class, content
    )
    content = re.sub(
        r'className="w-full! bg-white! border! border-gray-200! rounded-xl! px-4! py-3! text-\[14px\]! font-medium! text-gray-800! focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all"',
        input_class, content
    )
    
    # Selects
    content = re.sub(
        r'className="w-full! appearance-none! bg-white! border! border-gray-200! text-gray-800! font-medium! rounded-xl! pl-4! pr-10! py-2.5! text-\[14px\]! focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"',
        select_class, content
    )
    content = re.sub(
        r'className="w-full! appearance-none! bg-white! border! border-gray-200! text-gray-800! font-medium! rounded-xl! pl-4! pr-10! py-3! text-\[14px\]! focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"',
        select_class, content
    )
    
    # Labels
    content = re.sub(r'className="text-\[14px\]! font-semibold! text-gray-800!"', label_class, content)
    content = re.sub(r'className="text-\[13px\]! font-semibold! text-gray-800!"', label_class, content)
    
    # Errors
    content = re.sub(r'className="text-rose-500! text-xs! font-medium! mt-1!"', error_class, content)
    
    # Readonly inputs
    content = re.sub(
        r'className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-\[14px\]! font-medium! text-gray-500! !shadow-sm !outline-none !cursor-not-allowed"',
        'className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-[14px] rounded-xl px-4 py-3 outline-none cursor-not-allowed"', content
    )

    # General specific replacements
    content = content.replace("!space-y-6", "space-y-6")
    content = content.replace("!space-y-8", "space-y-8")
    content = content.replace("!space-y-2", "space-y-1.5")
    content = content.replace("!grid !grid-cols-1 md:!grid-cols-2 !gap-6", "grid grid-cols-1 md:grid-cols-2 gap-6")
    content = content.replace("!grid !grid-cols-2 md:!grid-cols-4 !gap-5", "grid grid-cols-2 md:grid-cols-4 gap-5")
    content = content.replace("md:!col-span-2", "md:col-span-2")
    content = content.replace("!text-[16px] !font-bold !text-gray-900 !mb-4 !pb-2 !border-b !border-gray-200", "text-[16px] font-bold text-gray-900 mb-5")
    content = content.replace("!relative", "relative")
    content = content.replace("!absolute !right-3 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-500", "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400")
    
    # Checkbox
    content = content.replace("peer! appearance-none! w-5! h-5! border! border-gray-300! rounded-md! checked:bg-blue-600! checked:border-blue-600! transition-all! cursor-pointer!", "peer appearance-none w-5 h-5 border border-gray-300 rounded-md checked:bg-gray-900 checked:border-gray-900 transition-all cursor-pointer")
    
    return content

search_dir = "src/components/admin/property-wizard/steps"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = replace_classes(content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned {filepath}")
