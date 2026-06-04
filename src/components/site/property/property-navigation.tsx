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
    <nav
      className="sticky! top-[72px]! z-40! bg-white/95! backdrop-blur-md! border-b! border-gray-200/80! -mx-4! px-4! md:-mx-0! md:px-0! md:rounded-2xl! md:border! md:border-gray-100! md:shadow-sm!"
      aria-label="Property sections"
    >
      <div className="flex! items-center! gap-2! overflow-x-auto! hide-scrollbar! py-2! md:py-2.5! md:px-3!">
        {links.map((link) => {
          const isActive = getIsActive(link);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative! flex! items-center! gap-2! whitespace-nowrap! rounded-xl! px-4! py-2! text-[14px]! font-bold! transition-all! duration-300! no-underline! shrink-0! ${
                isActive
                  ? "bg-[#27427f]! text-white! shadow-md! shadow-[#27427f]/20!"
                  : "bg-transparent! text-gray-600! hover:bg-[#27427f]/10! hover:text-[#27427f]!"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`transition-colors! ${isActive ? "text-white/90!" : "text-gray-400! group-hover:text-[#27427f]!"}`}
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
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
