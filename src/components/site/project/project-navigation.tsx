"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
} from "lucide-react";
import { getFloorPlanLabel } from "@/lib/property-sections";

export const PROJECT_SECTIONS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4! h-4!" /> },
  { id: "amenities", label: "Amenities", icon: <Sparkles className="w-4! h-4!" /> },
  { id: "floor-plans", label: "Floor Plan", icon: <Grid3X3 className="w-4! h-4!" /> },
  { id: "locality", label: "Locality", icon: <MapPinned className="w-4! h-4!" /> },
  { id: "photos", label: "Photos", icon: <Images className="w-4! h-4!" /> },
];

/**
 * Multi-page project navigation — mirrors PropertyNavigation pages mode.
 * Every tab is a real sub-page URL (/{slug}, /{slug}/amenities,
 * /{slug}/floor-plans, /{slug}/locality, /{slug}/photos) for all three
 * project types; `activeSection` (""/overview for the overview page)
 * drives the highlight.
 */
export function ProjectNavigation({
  slug,
  activeSection = "",
  projectType,
}: {
  slug: string;
  activeSection?: string;
  projectType?: string;
}) {
  const planLabel = projectType ? getFloorPlanLabel(projectType) : "Floor Plan";

  return (
    <div className="bg-white/95! backdrop-blur-md! sticky! top-[64px]! z-40! border-b! border-gray-200/80! shadow-xs! transition-all! duration-300! font-manrope">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <nav className="flex! items-center! gap-6! md:gap-8! overflow-x-auto! hide-scrollbar!" aria-label="Project sections">
          {PROJECT_SECTIONS.map((s) => {
            const isActive = activeSection === s.id || (s.id === "overview" && activeSection === "");
            const label = s.id === "floor-plans" ? planLabel : s.label;
            const href = s.id === "overview" ? `/${slug}` : `/${slug}/${s.id}`;
            return (
              <Link
                key={s.id}
                href={href}
                className={`group! relative! flex! items-center! gap-2! whitespace-nowrap! py-3.5! text-[14px]! font-medium! transition-colors! duration-300! shrink-0! no-underline! ${
                  isActive
                    ? "text-[#27427f]!"
                    : "text-gray-500! hover:text-gray-900!"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`transition-colors! duration-300! ${isActive ? "text-[#27427f]!" : "text-gray-400! group-hover:text-gray-500!"}`}>
                  {s.icon}
                </span>
                {label}
                {isActive && (
                  <div className="absolute! bottom-0! left-0! right-0! h-0.5! bg-[#27427f]! rounded-t-full!" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
