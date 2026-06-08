"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("majestan_access_token");
    const userStr = window.localStorage.getItem("majestan_user");

    if (!token || !userStr) {
      setIsAuthenticated(false);
      router.push(`/login`);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin" && user.role !== "staff") {
        setIsAuthenticated(false);
        router.push(`/`); 
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      setIsAuthenticated(false);
      router.push(`/login`);
    }
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex! h-screen! items-center! justify-center! bg-[#f7f8fb]!">
        <div className="h-10! w-10! animate-spin! rounded-full! border-4! border-[#27427f]! border-t-transparent!"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
