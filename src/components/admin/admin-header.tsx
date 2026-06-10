"use client";
import { LogoutButton } from "./logout-button";
import { User, Bell } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="flex! items-center! justify-between! border-b! border-gray-100! bg-white/80! px-6! py-3! backdrop-blur-xl! sticky! top-0! z-20!">
      <div className="flex! items-center!">
        <h1 className="text-xl! font-sans! font-semibold! tracking-normal! text-gray-800!">DashBoard</h1>
      </div>

      <div className="flex! items-center! gap-4!">
        <button className="relative! p-2! text-gray-400! hover:text-gray-600! transition-colors! rounded-full! hover:bg-gray-50!">
          <Bell size={20} />
          <span className="absolute! top-1.5! right-2! w-2! h-2! rounded-full! bg-rose-500! border! border-rose-400!"></span>
        </button>

        <div className="h-8! w-px! bg-gray-300!"></div>

        <div className="flex! items-center! gap-3! rounded-full! bg-gray-50! p-1! pr-4! border! border-gray-100! shadow-sm!">
          <div className="flex! h-8! w-8! items-center! justify-center! rounded-full! bg-blue-600! font-bold! text-white! shadow-sm!">
            <User size={16} />
          </div>
          <div className="flex-col! hidden! sm:flex! px-1! py-0.5!">
            <p className="text-[12px]! font-semibold! text-gray-800! leading-none! mb-1!">Admin User</p>
            <p className="text-[10px]! font-medium! text-gray-500! leading-none!">admin@majestan.com</p>
          </div>
        </div>
        
        <LogoutButton />
      </div>
    </header>
  );
}
