"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  listProjects,
  formatINR,
  type ProjectListItem,
} from "@/lib/api/projects";

type Filters = {
  city: string;
  projectType: string;
  bhk: string;
  maxPrice: string;
};

const EMPTY: Filters = { city: "", projectType: "", bhk: "", maxPrice: "" };

function rangeLabel(item: ProjectListItem): string {
  const { minPrice, maxPrice } = item.ranges;
  if (minPrice == null && maxPrice == null) return "Price on Request";
  if (minPrice != null && maxPrice != null && minPrice !== maxPrice) {
    return `${formatINR(minPrice)} - ${formatINR(maxPrice)}`;
  }
  return formatINR(minPrice ?? maxPrice);
}

export function ProjectsExplorer() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const debounced = useDebouncedValue(filters, 500);
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProjects({
      city: debounced.city || undefined,
      projectType: debounced.projectType || undefined,
      bhk: debounced.bhk ? Number(debounced.bhk) : undefined,
      maxPrice: debounced.maxPrice ? Number(debounced.maxPrice) : undefined,
      limit: 24,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const update = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const itemListJsonLd = items.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://www.majestanrealty.com/${item.canonicalSlug}`,
          name: item.name,
        })),
      }
    : null;

  return (
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! pt-24! md:pt-28! pb-12!">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Projects" }]}
          jsonLd
        />
        <h1 className="text-2xl! md:text-3xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mt-3!">
          New Villa & Apartment Projects
        </h1>
        <p className="text-gray-500! font-medium! mt-1! mb-6!">
          {loading ? "Loading…" : `${total} project${total === 1 ? "" : "s"} found`}
        </p>

        <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-4! md:p-5! mb-6!">
          <div className="grid! grid-cols-2! md:grid-cols-4! gap-3!">
            <div className="relative! col-span-2! md:col-span-1!">
              <Search className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400!" />
              <input
                type="text"
                placeholder="City..."
                value={filters.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-9! pr-3! text-sm! focus:outline-none! focus:border-[#27427f]! placeholder:text-gray-400!"
              />
            </div>
            <select
              value={filters.projectType}
              onChange={(e) => update("projectType", e.target.value)}
              className="bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! px-3! text-sm! focus:outline-none! focus:border-[#27427f]! cursor-pointer!"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
            </select>
            <select
              value={filters.bhk}
              onChange={(e) => update("bhk", e.target.value)}
              className="bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! px-3! text-sm! focus:outline-none! focus:border-[#27427f]! cursor-pointer!"
            >
              <option value="">Any BHK</option>
              {["1", "2", "3", "4", "5"].map((b) => (
                <option key={b} value={b}>{b} BHK</option>
              ))}
            </select>
            <select
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! px-3! text-sm! focus:outline-none! focus:border-[#27427f]! cursor-pointer!"
            >
              <option value="">Any Budget</option>
              <option value="5000000">Up to ₹50 L</option>
              <option value="10000000">Up to ₹1 Cr</option>
              <option value="20000000">Up to ₹2 Cr</option>
              <option value="50000000">Up to ₹5 Cr</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-6!">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white! rounded-2xl! border! border-gray-100! p-5! animate-pulse!">
                <div className="h-44! bg-gray-200! rounded-xl! mb-4!"></div>
                <div className="h-6! bg-gray-200! rounded! w-3/4! mb-2!"></div>
                <div className="h-4! bg-gray-200! rounded! w-1/2!"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white! rounded-2xl! border! border-gray-100! p-16! text-center!">
            <h3 className="text-xl! font-bold! text-gray-900! mb-2! font-['Lexend',sans-serif]!">No projects found</h3>
            <p className="text-gray-500!">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-6!">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/${item.canonicalSlug}`}
                className="bg-white! rounded-2xl! border! border-gray-100! overflow-hidden! shadow-sm! hover:shadow-xl! hover:-translate-y-1! transition-all! duration-300! no-underline! group!"
              >
                <div className="aspect-[16/9]! bg-gray-100! overflow-hidden!">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.name} className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-500!" loading="lazy" />
                  ) : (
                    <div className="w-full! h-full! flex! items-center! justify-center! text-gray-300! font-['Lexend',sans-serif]! text-4xl! font-bold!">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5!">
                  <p className="text-[11px]! font-bold! uppercase! tracking-wider! text-gray-400! mb-1!">
                    {item.projectType === "villa" ? "Villa Project" : "Apartment Project"}
                  </p>
                  <h3 className="font-['Lexend',sans-serif]! text-lg! font-bold! text-gray-900! line-clamp-1!">{item.name}</h3>
                  <p className="text-sm! text-gray-500! flex! items-center! gap-1! mt-1!">
                    <MapPin className="w-3.5! h-3.5! shrink-0!" />
                    <span className="line-clamp-1!">{[item.sublocation, item.city].filter(Boolean).join(", ")}</span>
                  </p>
                  <div className="flex! items-center! justify-between! mt-4! pt-4! border-t! border-gray-100!">
                    <span className="font-['Lexend',sans-serif]! font-extrabold! text-[#27427f]!">{rangeLabel(item)}</span>
                    {item.ranges.bhk.length > 0 && (
                      <span className="text-xs! font-bold! text-gray-500!">
                        {item.ranges.bhk.map((b) => `${b}BHK`).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
