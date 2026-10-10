"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
} from "lucide-react";
import { getFloorPlanLabel } from "@/lib/property-sections";

/** Anchor ids for the single-page (stacked-sections) property layout. */
export const PROPERTY_ANCHOR_SECTIONS = [
  "overview",
  "amenities",
  "floor-plan",
  "locality",
  "photos",
] as const;

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
  mode = "pages",
  sections,
  propertyType,
}: {
  slug: string;
  activeSection?: string;
  /**
   * "pages" links to the separate subpage URLs (multi-page types).
   * "anchors" scrolls to the stacked sections on the one overview page
   * (single-page types), with scroll-spy active highlighting.
   */
  mode?: "pages" | "anchors";
  /**
   * Anchors mode only: sub-section keys to show (overview always stays).
   * Hides nav items for sections with no data.
   */
  sections?: string[];
  /** DB property type — plot/farmland label the plan item Ground Plan in both modes. */
  propertyType?: string;
}) {
  const pathname = usePathname();
  const links = buildNavLinks(slug).map((l) =>
    l.section === "floor-plan" && propertyType
      ? { ...l, label: getFloorPlanLabel(propertyType) }
      : l
  );

  const getIsActive = (link: NavLink): boolean => {
    if (activeSection !== undefined) {
      return link.section === activeSection;
    }
    return pathname === link.href;
  };

  if (mode === "anchors") {
    const visible = sections
      ? links.filter((l) => l.section === "" || sections.includes(l.section))
      : links;
    const labeled = visible.map((l) =>
      l.section === "floor-plan" && propertyType
        ? { ...l, label: getFloorPlanLabel(propertyType) }
        : l
    );
    return <PropertyAnchorNavigation links={labeled} />;
  }

  return (
    <div className="bg-white/95! backdrop-blur-md! sticky! top-[64px]! z-40! border-b! border-gray-200/80! shadow-xs! transition-all! duration-300! font-manrope">
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
                className={`group relative! flex! items-center! gap-2! whitespace-nowrap! py-3.5! text-[14px]! font-medium! transition-colors! duration-300! no-underline! shrink-0! ${
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

/**
 * Anchor variant: same bar, but each item smooth-scrolls to its section on
 * the stacked single page. Active tab follows the viewport via
 * IntersectionObserver (same pattern as ProjectNavigation).
 */
function PropertyAnchorNavigation({ links }: { links: NavLink[] }) {
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
    for (const id of PROPERTY_ANCHOR_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = (section: string) => {
    const id = section === "" ? "overview" : section;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white/95! backdrop-blur-md! sticky! top-[64px]! z-40! border-b! border-gray-200/80! shadow-xs! transition-all! duration-300! font-manrope">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <nav
          className="flex! items-center! gap-6! md:gap-8! overflow-x-auto! hide-scrollbar!"
          aria-label="Property sections"
        >
          {links.map((link) => {
            const id = link.section === "" ? "overview" : link.section;
            const isActive = active === id;

            return (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.section)}
                className={`group! relative! flex! items-center! gap-2! whitespace-nowrap! py-3.5! text-[14px]! font-medium! transition-colors! duration-300! shrink-0! cursor-pointer! ${
                  isActive
                    ? "text-[#27427f]!"
                    : "text-gray-500! hover:text-gray-900!"
                }`}
                aria-current={isActive ? "true" : undefined}
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
              </button>
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
            className="flex! items-center! gap-1.5! rounded-lg! bg-gray-50! border! border-gray-200/60! px-3! py-1.5! text-[11px]! font-semibold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group"
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
          className="flex! items-center! gap-2! rounded-xl! bg-gray-50! border! border-gray-200/60! px-4! py-2! text-[13px]! font-semibold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group"
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
