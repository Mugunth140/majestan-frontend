import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Home, MapPin, Image as ImageIcon, FileText, List, PlusCircle, Globe } from "lucide-react";
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata = {
  title: "Admin Dashboard | Majestan Realty",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="flex! h-screen! bg-[#f7f8fb]! bg-[linear-gradient(135deg,rgba(39,66,127,0.03),rgba(255,201,0,0.03))]! font-medium! font-sans!">
        {/* Sidebar */}
        <aside className="flex! w-72! flex-col! bg-white! shadow-[4px_0_24px_rgba(22,30,45,0.04)]! z-10!">
          <div className="flex! items-center! justify-center! border-b! border-[#27427f]/10! px-8! py-5!">
            <Image src="/assets/images/logo/logo.png" alt="Majestan Logo" width={180} height={60} className="object-contain!" priority />
          </div>
          
          <nav className="flex-1! overflow-y-auto! py-6! px-4! custom-scrollbar!">
            <p className="mb-3! px-4! text-[11px]! font-bold! tracking-[0.08em]! text-[#27427f]/60! uppercase! font-sans!">Main Menu</p>
            <ul className="space-y-1.5!">
              <li>
                <Link href="/admin" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <LayoutDashboard size={20} className="text-[#27427f]/70!" /> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/properties" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <Home size={20} className="text-[#27427f]/70!" /> Properties
                </Link>
              </li>
              <li>
                <Link href="/admin/properties/new" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <PlusCircle size={20} className="text-[#27427f]/70!" /> Add Property
                </Link>
              </li>
            </ul>

            <p className="mt-8! mb-3! px-4! text-[11px]! font-bold! tracking-[0.08em]! text-[#27427f]/60! uppercase! font-sans!">Content & Settings</p>
            <ul className="space-y-1.5!">
              <li>
                <Link href="/admin/amenities" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <List size={20} className="text-[#27427f]/70!" /> Amenities
                </Link>
              </li>
              <li>
                <Link href="/admin/localities" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <MapPin size={20} className="text-[#27427f]/70!" /> Cities & Areas
                </Link>
              </li>
              <li>
                <Link href="/admin/media" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <ImageIcon size={20} className="text-[#27427f]/70!" /> Media Library
                </Link>
              </li>
              <li>
                <Link href="/admin/blogs" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <FileText size={20} className="text-[#27427f]/70!" /> Blog Posts
                </Link>
              </li>
              <li>
                <Link href="/admin/seo" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <Globe size={20} className="text-[#27427f]/70!" /> SEO Settings
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1! flex! flex-col! h-full! overflow-hidden!">
          <AdminHeader />
          <div className="flex-1! overflow-y-auto! p-8! max-[640px]:p-4!">
            <div className="mx-auto! max-w-7xl!">
              {children}
            </div>
          </div>
        </main>
      </div>

    </AdminAuthProvider>
  );
}
