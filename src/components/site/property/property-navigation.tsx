"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  section: string;
};

function buildNavLinks(slug: string): NavLink[] {
  return [
    {
      href: `/${slug}`,
      label: "Overview",
      icon: <LayoutDashboard className="w-4! h-4!" />,
      section: "",
    },
    {
      href: `/${slug}/amenities`,
      label: "Amenities",
      icon: <Sparkles className="w-4! h-4!" />,
      section: "amenities",
    },
    {
      href: `/${slug}/floor-plan`,
      label: "Floor Plan",
      icon: <Grid3X3 className="w-4! h-4!" />,
      section: "floor-plan",
    },
    {
      href: `/${slug}/locality`,
      label: "Locality",
      icon: <MapPinned className="w-4! h-4!" />,
      section: "locality",
    },
    {
      href: `/${slug}/photos`,
      label: "Photos",
      icon: <Images className="w-4! h-4!" />,
      section: "photos",
    },
  ];
}

export function PropertyNavigation({
  slug,
  activeSection,
}: {
  slug: string;
  activeSection?: string;
}) {
  const pathname = usePathname();
  const links = buildNavLinks(slug);

  const getIsActive = (link: NavLink): boolean => {
    if (activeSection !== undefined) {
      return link.section === activeSection;
    }
    return pathname === link.href;
  };

  return (
    <div className="bg-white/95! backdrop-blur-md! sticky! top-[64px]! z-40! border-b! border-gray-200/80! shadow-xs! transition-all! duration-300! font-['Manrope',sans-serif]!">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <nav
          className="flex! items-center! gap-6! md:gap-8! overflow-x-auto! hide-scrollbar!"
          aria-label="Property sections"
        >
          {links.map((link) => {
            const isActive = getIsActive(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group! relative! flex! items-center! gap-2! whitespace-nowrap! py-3.5! text-[14px]! font-medium! transition-colors! duration-300! no-underline! shrink-0! ${
                  isActive
                    ? "text-[#27427f]!"
                    : "text-gray-500! hover:text-gray-900!"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`transition-colors! duration-300! ${isActive ? "text-[#27427f]!" : "text-gray-400! group-hover:text-gray-500!"}`}
                >
                  {link.icon}
                </span>
                {link.label}
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

export function PropertySectionLinks({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const links = buildNavLinks(slug);

  if (compact) {
    return (
      <div className="flex! flex-wrap! gap-2! mt-4!">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex! items-center! gap-1.5! rounded-lg! bg-gray-50! border! border-gray-200/60! px-3! py-1.5! text-[11px]! font-bold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group!"
          >
            <span className="text-gray-400! group-hover:text-white/90! transition-colors!">
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex! flex-wrap! gap-2! mt-4! pt-4! border-t! border-gray-100!">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex! items-center! gap-2! rounded-xl! bg-gray-50! border! border-gray-200/60! px-4! py-2! text-[13px]! font-bold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group!"
        >
          <span className="text-gray-400! group-hover:text-white/90! transition-colors!">
            {link.icon}
          </span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
