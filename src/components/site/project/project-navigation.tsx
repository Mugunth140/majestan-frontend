"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
} from "lucide-react";

export const PROJECT_SECTIONS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4! h-4!" /> },
  { id: "amenities", label: "Amenities", icon: <Sparkles className="w-4! h-4!" /> },
  { id: "floor-plans", label: "Floor Plan", icon: <Grid3X3 className="w-4! h-4!" /> },
  { id: "locality", label: "Locality", icon: <MapPinned className="w-4! h-4!" /> },
  { id: "photos", label: "Photos", icon: <Images className="w-4! h-4!" /> },
];

export function ProjectNavigation() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    PROJECT_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white/95! backdrop-blur-md! sticky! top-[64px]! z-40! border-b! border-gray-200/80! shadow-xs! transition-all! duration-300! font-['Manrope',sans-serif]!">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <nav className="flex! items-center! gap-6! md:gap-8! overflow-x-auto! hide-scrollbar!" aria-label="Project sections">
          {PROJECT_SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`group! relative! flex! items-center! gap-2! whitespace-nowrap! py-3.5! text-[14px]! font-medium! transition-colors! duration-300! shrink-0! cursor-pointer! ${
                  isActive
                    ? "text-[#27427f]!"
                    : "text-gray-500! hover:text-gray-900!"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className={`transition-colors! duration-300! ${isActive ? "text-[#27427f]!" : "text-gray-400! group-hover:text-gray-500!"}`}>
                  {s.icon}
                </span>
                {s.label}
                {isActive && (
                  <div className="absolute! bottom-0! left-0! right-0! h-0.5! bg-[#27427f]! rounded-t-full!" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
