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
    <div className="w-full! max-w-7xl! mx-auto! space-y-6!">
      <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4!">
        <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Media Library</h2>
        <button className="inline-flex! items-center! gap-2! bg-gray-900! hover:bg-gray-800! text-white! px-5! py-2.5! rounded-xl! font-medium! transition-all! shadow-sm!">
          <Upload size={18} />
          Upload Files
        </button>
      </div>
      
      <div className="bg-white! rounded-3xl! shadow-sm! border! border-gray-100! overflow-hidden!">
        {/* Toolbar */}
        <div className="p-5! border-b! border-gray-100! flex! flex-col! sm:flex-row! gap-4! items-center! justify-between!">
          <div className="flex! items-center! gap-3! w-full! sm:w-auto!">
            <button className="p-2.5! text-gray-500! hover:bg-gray-50! rounded-xl! border! border-gray-200! transition-colors!">
              <Filter size={18} />
            </button>
          </div>
          
          <form className="relative! w-full! sm:w-80!">
            <div className="absolute! inset-y-0! left-0! flex! items-center! pl-3! pointer-events-none!">
              <Search size={18} className="text-gray-400!" />
            </div>
            <input 
              type="text" 
              className="bg-gray-50! border! border-gray-200! text-gray-900! text-sm! rounded-xl! focus:ring-gray-900! focus:border-gray-900! block! w-full! pl-10! p-2.5! outline-none! transition-all!" 
              placeholder="Search media..." 
            />
          </form>
        </div>

        {/* Empty State */}
        <div className="p-12! text-center!">
          <div className="inline-flex! items-center! justify-center! w-16! h-16! rounded-full! bg-gray-50! text-gray-400! mb-4!">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-lg! font-medium! text-gray-900! mb-2!">No media files yet</h3>
          <p className="text-gray-500! max-w-sm! mx-auto!">
            Upload images and documents to your Cloudflare R2 bucket. They will appear here once configured.
          </p>
        </div>
      </div>
    </div>
  );
}