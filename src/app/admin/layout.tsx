"use client";

import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by avoiding rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} !w-full !h-full`}>
      <AdminAuthProvider>
        <div className="!flex !h-screen !bg-[#f8f9fa] dark:!bg-[#0f1015] !font-sans !text-gray-900 dark:!text-white !antialiased">
          <AdminSidebar />
          
          {/* Main Content */}
          <main className="!flex-1 !flex !flex-col !h-full !overflow-hidden !relative">
            <AdminHeader />
            <div className="!flex-1 !overflow-y-auto !p-6 max-[640px]:!p-4">
              <div className="!w-full !h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </AdminAuthProvider>
    </div>
  );
}
