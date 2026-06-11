"use client";

import { 
  Image as ImageIcon, 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  Eye
} from "lucide-react";

export default function AdminMediaPage() {
  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <h2 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">Media Library</h2>
        <button className="!inline-flex !items-center !gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-sm hover:!shadow-blue-500/20 !px-5 !py-2.5 !rounded-xl !font-medium !transition-all !shadow-sm">
          <Upload size={18} />
          Upload Files
        </button>
      </div>
      
      <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        {/* Toolbar */}
        <div className="!p-5 !border-b !border-gray-100 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
          <div className="!flex !items-center !gap-3 !w-full sm:!w-auto">
            <button className="!p-2.5 !text-gray-500 dark:!text-gray-400 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] dark:!bg-[#1c1d27] !rounded-xl !border !border-gray-100 dark:!border-[#262730] !shadow-sm !transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <form className="!relative !w-full sm:!w-80">
            <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none">
              <Search size={18} className="!text-gray-400" />
            </div>
            <input 
              type="text" 
              className="!bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !text-gray-800 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !block !w-full !pl-10 !p-2.5 !outline-none !transition-all" 
              placeholder="Search media..." 
            />
          </form>
        </div>

        {/* Empty State */}
        <div className="!p-12 !text-center">
          <div className="!inline-flex !items-center !justify-center !w-16 !h-16 !rounded-full !bg-gray-50 dark:!bg-[#1c1d27] !text-gray-400 !mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="!text-lg !font-medium !text-gray-800 dark:!text-white !mb-2">No media files yet</h3>
          <p className="!text-gray-500 dark:!text-gray-400 ">
            Upload images and documents to your Cloudflare R2 bucket. They will appear here once configured.
          </p>
        </div>
      </div>
    </div>
  );
}