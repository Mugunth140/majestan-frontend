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
    <div className="bg-white! sticky! top-[64px]! md:top-[68px]! z-40! border-b! border-gray-100! shadow-sm!">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <nav className="mx-4! px-4! md:mx-0! md:px-0!" aria-label="Project sections">
          <div className="flex! items-center! gap-2! overflow-x-auto! hide-scrollbar! py-2! md:py-2! md:px-2!">
            {PROJECT_SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`relative! flex! items-center! gap-2! whitespace-nowrap! rounded-full! px-5! py-3! text-[13px]! font-semibold! transition-all! duration-300! shrink-0! cursor-pointer! ${
                    isActive
                      ? "bg-[#27427f]! text-white! shadow-md! shadow-[#27427f]/20!"
                      : "bg-transparent! text-gray-600! hover:text-[#27427f]! hover:bg-[#27427f]/10!"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className={`transition-colors! ${isActive ? "text-white/90!" : "text-gray-400!"}`}>
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
