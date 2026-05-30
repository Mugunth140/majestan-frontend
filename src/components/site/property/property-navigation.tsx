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
      icon: <LayoutDashboard className="w-4 h-4" />,
      section: "",
    },
    {
      href: `/${slug}/amenities`,
      label: "Amenities",
      icon: <Sparkles className="w-4 h-4" />,
      section: "amenities",
    },
    {
      href: `/${slug}/floor-plan`,
      label: "Floor Plan",
      icon: <Grid3X3 className="w-4 h-4" />,
      section: "floor-plan",
    },
    {
      href: `/${slug}/locality`,
      label: "Locality",
      icon: <MapPinned className="w-4 h-4" />,
      section: "locality",
    },
    {
      href: `/${slug}/photos`,
      label: "Photos",
      icon: <Images className="w-4 h-4" />,
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
    // Fallback to pathname matching
    return pathname === link.href;
  };

  return (
    <nav
      className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 -mx-4 px-4 md:-mx-0 md:px-0 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm"
      aria-label="Property sections"
    >
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-1 md:py-1.5 md:px-2">
        {links.map((link) => {
          const isActive = getIsActive(link);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 no-underline shrink-0
                ${
                  isActive
                    ? "bg-[#27427f] text-white shadow-lg shadow-[#27427f]/20"
                    : "text-gray-600 hover:bg-[#27427f]/5 hover:text-[#27427f]"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`transition-colors ${isActive ? "text-[#ffc900]" : "text-gray-400 group-hover:text-[#27427f]"}`}
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

/** Non-interactive version for use in property cards (search results) */
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
      <div className="flex flex-wrap gap-1.5 mt-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 rounded-full bg-[#27427f]/[0.04] px-2.5 py-1 text-[10px] font-semibold text-[#27427f]/70 no-underline transition-all hover:bg-[#27427f]/10 hover:text-[#27427f] border border-transparent hover:border-[#27427f]/10"
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-600 no-underline transition-all hover:bg-[#27427f] hover:text-white hover:shadow-md"
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </div>
  );
}
