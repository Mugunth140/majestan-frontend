"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PropertyNavigation({ slug }: { slug: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/property/${slug}`, label: "Overview" },
    { href: `/property/${slug}/amenities`, label: "Amenities" },
    { href: `/property/${slug}/floor-plan`, label: "Floor Plan" },
    { href: `/property/${slug}/locality`, label: "Locality" },
    { href: `/property/${slug}/photos`, label: "Photos" },
    { href: `/property/${slug}/videos`, label: "Videos" },
    { href: `/property/${slug}/price`, label: "Price" },
    { href: `/property/${slug}/specifications`, label: "Specifications" },
  ];

  return (
    <nav className="flex gap-4 overflow-x-auto border-b border-gray-200 pb-2 mb-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === link.href
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
