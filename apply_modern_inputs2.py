import os

def clean_custom(content):
    content = content.replace("!flex !items-center !cursor-pointer !group", "flex items-center cursor-pointer group")
    content = content.replace("!relative !flex !items-center !justify-center !w-5 !h-5 !mr-3", "relative flex items-center justify-center w-5 h-5 mr-3")
    content = content.replace("!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100 !pointer-events-none", "absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none")
    content = content.replace("!text-[14px] !font-semibold !text-gray-800 group-hover:!text-gray-900", "text-sm font-medium text-gray-700 group-hover:text-gray-900")
    
    # Amenities
    content = content.replace("!bg-blue-600 !border-blue-600 !text-white !shadow-lg !shadow-blue-500/20", "bg-gray-900 border-gray-900 text-white shadow-sm ring-2 ring-gray-900/10")
    content = content.replace("!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 !shadow-sm", "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm")
    content = content.replace("!flex !items-center !gap-3 !p-3 !rounded-2xl !border !text-[14px] !font-semibold !transition-all", "flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all")
    content = content.replace("!w-5 !h-5 !rounded-md !border !flex !items-center !justify-center !transition-colors", "w-5 h-5 rounded flex items-center justify-center transition-colors")
    content = content.replace("!bg-white/20 !border-transparent", "bg-white/20 border-transparent")
    content = content.replace("!bg-white !border-gray-300", "bg-white border-gray-300")
    
    # Media
    content = content.replace("!w-full !rounded-3xl !border-2 !border-dashed !flex !flex-col !items-center !justify-center !p-10 !text-center !transition-all !duration-200", "w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-12 text-center transition-all duration-200 bg-gray-50/50")
    content = content.replace("!border-blue-500 !bg-blue-50", "border-gray-900 bg-gray-50")
    content = content.replace("!border-gray-200 !bg-white hover:!bg-gray-50", "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300")
    content = content.replace("!w-16 !h-16 !rounded-full !bg-white !shadow-sm !flex !items-center !justify-center !mb-4", "w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5")
    content = content.replace("!w-8 !h-8", "w-8 h-8")
    content = content.replace("!text-[16px] !font-bold !text-gray-900 !mb-2", "text-base font-semibold text-gray-900 mb-2")
    content = content.replace("!text-[13px] !font-medium !text-gray-500 !mb-6", "text-sm text-gray-500 mb-6")
    content = content.replace("!inline-flex !items-center !gap-2 !px-6 !py-2.5 !bg-white !border !border-gray-200 hover:!border-gray-300 hover:!bg-gray-50 !rounded-xl !text-[14px] !font-semibold !text-gray-700 !shadow-sm !cursor-pointer !transition-all", "inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer")
    
    return content

search_dir = "src/components/admin/property-wizard/steps"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = clean_custom(content)
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Cleaned {filepath}")
