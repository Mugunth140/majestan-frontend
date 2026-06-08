"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/admin") return "Dashboard Overview";
    if (pathname?.startsWith("/admin/properties/new")) return "Add Property";
    if (pathname?.startsWith("/admin/properties")) return "Properties";
    if (pathname?.startsWith("/admin/amenities")) return "Amenities";
    if (pathname?.startsWith("/admin/localities")) return "Localities";
    if (pathname?.startsWith("/admin/media")) return "Media Library";
    if (pathname?.startsWith("/admin/blogs")) return "Blog Posts";
    if (pathname?.startsWith("/admin/seo")) return "SEO Settings";
    if (pathname?.startsWith("/admin/leads")) return "Leads";
    return "Control Panel";
  };

  return (
    <header className="flex! items-center! justify-between! border-b! border-[#27427f]/10! bg-white! px-8! py-2.5! backdrop-blur-md!">
      <div className="flex! items-center!">
        <h1 className="text-2xl! font-sans! font-bold! tracking-tight! text-[#27427f]!">{getTitle()}</h1>
      </div>

      <div className="flex! items-center! gap-4!">
        <div className="flex! items-center! gap-3! rounded-3xl! bg-[#f7f8fb]! p-2! pr-4!">
          <div className="flex! h-10! w-10! items-center! justify-center! rounded-full! bg-[#27427f]! font-bold! text-white!">
            <User size={20}/>
          </div>
          <div className="flex-col! hidden! sm:flex!">
            <p className="text-[14px]! font-bold! text-[#27427f]! leading-none! mb-1!">Admin User</p>
            <p className="text-[12px]! font-medium! text-[#5c5e61]! leading-none!">admin@majestan.com</p>
          </div>
        </div>
        <div className="flex! gap-2!">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
