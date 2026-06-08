import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Home, MapPin, Image as ImageIcon, FileText, List, PlusCircle, Globe } from "lucide-react";
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { LogoutButton } from "@/components/admin/logout-button";

export const metadata = {
  title: "Admin Dashboard | Majestan Realty",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="flex! h-screen! bg-[#f7f8fb]! bg-[linear-gradient(135deg,rgba(39,66,127,0.03),rgba(255,201,0,0.03))]! font-['Lexend',sans-serif]!">
        {/* Sidebar */}
        <aside className="flex! w-72! flex-col! bg-white! shadow-[4px_0_24px_rgba(22,30,45,0.04)]! z-10!">
          <div className="flex! items-center! justify-center! border-b! border-[#27427f]/10! p-8!">
            <Image src="/assets/images/logo/logo.png" alt="Majestan Logo" width={160} height={45} className="object-contain!" priority />
          </div>
          
          <nav className="flex-1! overflow-y-auto! py-6! px-4! custom-scrollbar!">
            <p className="mb-3! px-4! text-[11px]! font-black! tracking-[0.15em]! text-[#27427f]/40! uppercase!">Main Menu</p>
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

            <p className="mt-8! mb-3! px-4! text-[11px]! font-black! tracking-[0.15em]! text-[#27427f]/40! uppercase!">Content & Settings</p>
            <ul className="space-y-1.5!">
              <li>
                <Link href="/admin/amenities" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <List size={20} className="text-[#27427f]/70!" /> Amenities
                </Link>
              </li>
              <li>
                <Link href="/admin/localities" className="flex! items-center! gap-3! rounded-2xl! px-4! py-3! text-[14px]! font-semibold! text-[#5c5e61]! transition-all! hover:bg-[#27427f]/5! hover:text-[#27427f]!">
                  <MapPin size={20} className="text-[#27427f]/70!" /> Localities
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

          <div className="border-t! border-[#27427f]/10! p-6!">
            <div className="flex! items-center! gap-4! rounded-3xl! bg-[#f7f8fb]! p-3!">
              <div className="flex! h-10! w-10! items-center! justify-center! rounded-full! bg-[#27427f]! font-bold! text-[#ffc900]!">
                A
              </div>
              <div className="flex-1! overflow-hidden!">
                <p className="truncate! text-[14px]! font-bold! text-[#27427f]!">Admin User</p>
                <p className="truncate! text-[12px]! font-medium! text-[#5c5e61]!">admin@majestan.com</p>
              </div>
            </div>
            <div className="mt-4! flex! gap-2!">
              <Link href="/" className="flex-1! flex! items-center! justify-center! gap-2! rounded-2xl! bg-white! px-4! py-2.5! text-[13px]! font-bold! text-[#5c5e61]! shadow-sm! border! border-[#27427f]/10! transition-all! hover:bg-[#f7f8fb]! hover:text-[#27427f]!">
                Website
              </Link>
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1! flex! flex-col! h-full! overflow-hidden!">
          <header className="flex! items-center! justify-between! border-b! border-[#27427f]/10! bg-white/80! px-8! py-5! backdrop-blur-md!">
            <h1 className="text-[22px]! font-extrabold! tracking-tight! text-[#27427f]!">Control Panel</h1>
            <div className="flex! items-center! gap-4!">
              {/* Optional header actions */}
            </div>
          </header>
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
