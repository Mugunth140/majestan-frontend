"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { User, Bell } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/admin") return "Dashboard Overview";
    if (pathname?.startsWith("/admin/properties/new")) return "Add Property";
    if (pathname?.startsWith("/admin/properties")) return "Properties";
    if (pathname?.startsWith("/admin/amenities")) return "Amenities";
    if (pathname?.startsWith("/admin/cities")) return "Cities";
    if (pathname?.startsWith("/admin/sublocations")) return "Sublocations";
    if (pathname?.startsWith("/admin/media")) return "Media Library";
    if (pathname?.startsWith("/admin/blogs")) return "Blog Posts";
    if (pathname?.startsWith("/admin/seo")) return "SEO Settings";
    if (pathname?.startsWith("/admin/leads")) return "Leads";
    return "Control Panel";
  };

  return (
    <header className="flex! items-center! justify-between! border-b! border-gray-100! bg-white/80! px-8! py-4! backdrop-blur-xl! sticky! top-0! z-20!">
      <div className="flex! items-center!">
        <h1 className="text-[22px]! font-sans! font-semibold! tracking-tight! text-gray-800!">{getTitle()}</h1>
      </div>

      <div className="flex! items-center! gap-5!">
        <button className="relative! p-2! text-gray-400! hover:text-gray-600! transition-colors! rounded-full! hover:bg-gray-50!">
          <Bell size={20} />
          <span className="absolute! top-1.5! right-2! w-2! h-2! rounded-full! bg-rose-500! border-2! border-white!"></span>
        </button>

        <div className="h-8! w-[1px]! bg-gray-200!"></div>

        <div className="flex! items-center! gap-3! rounded-full! bg-gray-50! p-1.5! pr-4! border! border-gray-100! shadow-sm!">
          <div className="flex! h-9! w-9! items-center! justify-center! rounded-full! bg-blue-600! font-bold! text-white! shadow-sm!">
            <User size={18} />
          </div>
          <div className="flex-col! hidden! sm:flex!">
            <p className="text-[13px]! font-semibold! text-gray-800! leading-none! mb-1!">Admin User</p>
            <p className="text-[11px]! font-medium! text-gray-500! leading-none!">admin@majestan.com</p>
          </div>
        </div>
        
        <LogoutButton />
      </div>
    </header>
  );
}
