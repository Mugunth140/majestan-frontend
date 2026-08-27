"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Module-level: track the native fetch so re-mounts don't stack wrappers.
// In StrictMode, effects run twice (mount → unmount → mount). Without this guard,
// each mount captures the already-wrapped fetch as "original", nesting layers.
let nativeFetch: typeof window.fetch | null = null;

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Capture the true native fetch only on first application.
    if (!nativeFetch) {
      nativeFetch = window.fetch;
    }
    const original = nativeFetch;

    window.fetch = async (...args) => {
      const response = await original(...args);
      if (response.status === 401) {
        window.localStorage.removeItem("majestan_access_token");
        window.localStorage.removeItem("majestan_user");
        window.location.href = "/login";
      }
      return response;
    };

    return () => {
      // Restore to native on unmount; nativeFetch reference persists for re-mount.
      window.fetch = original;
    };
  }, []);

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
      <div className="flex! h-screen! items-center! justify-center! bg-[#fbfbfc]!">
        <div className="h-10! w-10! animate-spin! rounded-full! border-4! border-blue-600! border-t-transparent!"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
