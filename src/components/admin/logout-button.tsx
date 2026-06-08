"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = () => {
    window.localStorage.removeItem("majestan_access_token");
    window.localStorage.removeItem("majestan_user");
    window.location.href = "/login";
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex! items-center! justify-center! rounded-2xl! bg-[#b42318]/10! px-4! py-2.5! text-[13px]! font-bold! text-[#b42318]! transition-all! hover:bg-[#b42318]/20!"
      title="Logout"
    >
      <LogOut size={16} />
    </button>
  );
}
