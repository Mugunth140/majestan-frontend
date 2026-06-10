import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Admin Dashboard | Majestan Realty",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="flex! h-screen! bg-[#fbfbfc]! font-sans! text-gray-800! antialiased!">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1! flex! flex-col! h-full! overflow-hidden! relative!">
          <AdminHeader />
          <div className="flex-1! overflow-y-auto! p-6! max-[640px]:p-4!">
            <div className="w-full! h-full!">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </AdminAuthProvider>
  );
}
