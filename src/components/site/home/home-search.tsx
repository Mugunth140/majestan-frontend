"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Sublocation, UnitType } from "@/lib/api";
import { MapPin, ChevronDown, Search, Home } from "lucide-react";
import {
  buildPseoSlug,
  PROPERTY_TYPES,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";

// Map home-search form property type values (API/form slugs) to PSEO URL slugs
const HOME_SEARCH_PROPERTY_TYPE_MAP: Record<string, PropertyTypeSlug> = {
  apartment:        "apartments",
  villa:            "villas",
  independenthouse: "independent-houses",
  plot:             "plots",
  commercialspace:  "commercial-spaces",
  industrialspace:  "industrial-spaces",
  farmlands:        "farmlands",
  coworking:        "coworking",
};
import { useLocationContext } from "@/contexts/LocationContext";

const propertyTypeOptions = [
  ["apartment", "Apartment"],
  ["villa", "Villa"],
  ["independenthouse", "Independent House"],
  ["plot", "Plot"],
  ["commercialspace", "Commercial Space"],
  ["industrialspace", "Industrial"],
  ["farmlands", "Farmlands"],
] as const;


export function HomeSearch({
  sublocations,
}: {
  sublocations: Sublocation[];
  unitTypes: UnitType[];
}) {
  const router = useRouter();
  const { location: selectedCity } = useLocationContext();
  const [listingType, setListingType] = useState<"Sell" | "Rent">("Sell");
  const [propertyType, setPropertyType] = useState("");
  const [locality, setLocality] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isLocalityMenuOpen, setIsLocalityMenuOpen] = useState(false);
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const localityMenuRef = useRef<HTMLDivElement>(null);
  const propertyMenuRef = useRef<HTMLDivElement>(null);

  const [isSearching, setIsSearching] = useState(false);

  const selectedPropertyLabel =
    propertyTypeOptions.find(([value]) => value === propertyType)?.[1] ?? "Select type...";

  const filteredSublocations = useMemo(() => {
    const citySublocations = sublocations.filter(
      (item) => item.city.toLowerCase() === selectedCity.toLowerCase(),
    );
    return citySublocations.slice(0, 8);
  }, [selectedCity, sublocations]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      // The menus render in a portal, so they live outside both trigger refs.
      // Without this guard the mousedown would close a menu before its own click
      // handler ran, making options unselectable.
      if (target?.closest?.("[data-search-menu]")) return;

      if (
        localityMenuRef.current &&
        !localityMenuRef.current.contains(target as Node)
      ) {
        setIsLocalityMenuOpen(false);
      }

      if (
        propertyMenuRef.current &&
        !propertyMenuRef.current.contains(target as Node)
      ) {
        setIsPropertyMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Row 1 scrolls horizontally on mobile, and an overflow container clips
     absolutely-positioned children — so the open menus used to be cut off and
     slide under row 2. Both menus therefore render in a portal, positioned
     against the trigger's viewport rect, and re-anchor on scroll/resize instead
     of closing. */
  function useAnchoredMenu(open: boolean, triggerRef: React.RefObject<HTMLElement | null>) {
    const [rect, setRect] = useState<{ top: number; left: number; minWidth: number } | null>(null);

    useEffect(() => {
      if (!open) {
        setRect(null);
        return;
      }

      const update = () => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        // Clamp to the viewport so a trigger near the right edge does not push
        // the panel off-screen.
        const width = Math.max(r.width, 224);
        const left = Math.min(r.left, window.innerWidth - width - 12);
        setRect({ top: r.bottom + 8, left: Math.max(12, left), minWidth: width });
      };

      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [open, triggerRef]);

    return rect;
  }

  const propertyAnchor = useAnchoredMenu(isPropertyMenuOpen, propertyMenuRef);
  const localityAnchor = useAnchoredMenu(isLocalityMenuOpen, localityMenuRef);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Case 1: Property type selected — build canonical PSEO URL from Row 1 filters
    if (propertyType) {
      const ptSlug = HOME_SEARCH_PROPERTY_TYPE_MAP[propertyType] || "apartments";
      const pseoSlug = buildPseoSlug(
        listingType,
        ptSlug,
        selectedCity.toLowerCase(),
        locality || undefined
      );
      router.push(`/${pseoSlug}`);
      return;
    }

    // Case 2: Only text search — call /api/search and navigate to canonical URL
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: searchQuery,
            city: selectedCity,
            listingType: listingType === "Sell" ? "Sell" : "Rent",
            locality: locality || undefined,
          }),
        });
        const data = await res.json();
        const topHit = data?.hits?.[0];
        if (topHit?.canonicalUrl) {
          router.push(topHit.canonicalUrl);
          return;
        }
      } catch {
        // Fall through to fallback
      } finally {
        setIsSearching(false);
      }
      // Fallback: go to generic listing page with keyword (city-level PSEO URL)
      const fallbackSlug = buildPseoSlug("Sell", "apartments", selectedCity.toLowerCase() || "coimbatore");
      router.push(`/${fallbackSlug}?keyword=${encodeURIComponent(searchQuery)}`);
      return;
    }

    // Nothing selected or typed
    setError("Please select a property type or enter a search term.");
  }

  return (
    /* Mobile: the card runs edge-to-edge (no gutters, square corners) so it uses
       the whole screen width. Desktop keeps the inset, rounded card. */
    <div className="w-full! max-w-[960px]! mx-auto! mt-6! relative! z-20! px-0! sm:px-4! text-left!">
      <form
        onSubmit={onSubmit}
        /*
          Three-layer shadow instead of the old single 60px/8% blur, which was so
          diffuse it vanished against a white page:
            - contact  1px/2px, gives the card a crisp edge
            - mid      navy-tinted lift, ties the card to the brand
            - ambient  wide soft drop, separates it from the section below
          The border moves off gray-100 (#f3f4f6, ~invisible on white) to a
          12% navy so the outline reads on both the white hero and the banner.
        */
        className="w-full! bg-white! rounded-[18px]! sm:rounded-3xl! shadow-[0_1px_2px_rgba(22,30,45,0.06),0_10px_24px_-6px_rgba(39,66,127,0.18),0_28px_60px_-20px_rgba(22,30,45,0.20)]! border! border-[#27427f]/12! text-left!"
      >
        {/* ── ROW 1: Toggles & Dropdowns ──────────────────────────
            Mobile: the Buy/Rent toggle stays pinned and the dropdowns scroll
            horizontally in a contained track, so the card keeps its full width
            instead of wrapping. Desktop keeps the original wrap layout. */}
        <div className="flex! flex-nowrap! md:flex-wrap! items-center! gap-3! px-4! py-4! md:px-6! border-b! border-gray-100! overflow-x-auto! md:overflow-visible! [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Buy / Rent */}
          <div className="flex! items-center! gap-2! shrink-0!">
            {[
              { value: "Sell", label: "Buy" },
              { value: "Rent", label: "Rent" }
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setListingType(tab.value as "Sell" | "Rent")}
                className={`px-6! h-[38px]! rounded-full! text-[14px]! font-semibold! leading-none! transition-all! duration-200! whitespace-nowrap! inline-flex! items-center! justify-center! ${
                  listingType === tab.value
                    ? "bg-[#27427f]! text-white! shadow-sm! border! border-transparent!"
                    : "bg-white! text-gray-500! border! border-gray-200! hover:border-gray-300! hover:text-[#27427f]!"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-px! h-6! bg-gray-200! mx-1! shrink-0!"></div>

          {/* Property Type Dropdown */}
          <div ref={propertyMenuRef} className="relative! shrink-0!">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isPropertyMenuOpen}
              className="flex! items-center! gap-2! bg-white! border! border-gray-200! hover:border-gray-300! rounded-full! px-5! h-[38px]! transition-colors!"
              onClick={() => setIsPropertyMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsPropertyMenuOpen(false);
              }}
            >
              <Home className="text-[#27427f]! shrink-0!" size={16} strokeWidth={2} />
              <span className={`text-[14px]! font-medium! leading-none! whitespace-nowrap! ${propertyType ? "text-gray-700!" : "text-gray-500!"}`}>
                {propertyType ? selectedPropertyLabel : "Property Type"}
              </span>
              {/* Rotates with open state, matching the Locality trigger. */}
              <ChevronDown className={`text-gray-400! shrink-0! transition-transform! duration-200! ${isPropertyMenuOpen ? "rotate-180!" : ""}`} size={16} strokeWidth={2.5} />
            </button>

            {isPropertyMenuOpen && propertyAnchor && createPortal(
              <div
                role="listbox"
                data-search-menu
                style={{ top: propertyAnchor.top, left: propertyAnchor.left, minWidth: propertyAnchor.minWidth }}
                className="fixed! z-[60]! w-max! max-h-72! overflow-y-auto! rounded-2xl! border! border-gray-100! bg-white! p-2! shadow-[0_20px_50px_rgba(0,0,0,0.12)]!"
              >
                {propertyTypeOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={propertyType === value}
                    className={`w-full! rounded-xl! border-none! px-4! py-2.5! text-left! text-sm! font-medium! transition-colors! ${
                      propertyType === value
                        ? "bg-[#27427f]! text-white!"
                        : "bg-transparent! text-gray-600! hover:bg-gray-50! hover:text-[#27427f]!"
                    }`}
                    onClick={() => {
                      setPropertyType(value);
                      setError("");
                      setIsPropertyMenuOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>,
              document.body,
            )}
          </div>

          {/* Locality Dropdown */}
          <div ref={localityMenuRef} className="relative! shrink-0!">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isLocalityMenuOpen}
              className="flex! items-center! gap-2! bg-white! border! border-gray-200! hover:border-gray-300! rounded-full! px-5! h-[38px]! transition-colors!"
              onClick={() => setIsLocalityMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsLocalityMenuOpen(false);
              }}
            >
              <MapPin className="text-[#27427f]! shrink-0!" size={16} strokeWidth={2.5} />
              <span className={`text-[14px]! font-medium! leading-none! whitespace-nowrap! ${locality ? "text-gray-700!" : "text-gray-500!"}`}>
                {locality || "Locality"}
              </span>
              <ChevronDown className={`text-gray-400! shrink-0! transition-transform! ${isLocalityMenuOpen ? "rotate-180!" : ""}`} size={16} strokeWidth={2.5} />
            </button>

            {isLocalityMenuOpen && localityAnchor && createPortal(
              <div
                role="listbox"
                data-search-menu
                style={{ top: localityAnchor.top, left: localityAnchor.left, minWidth: localityAnchor.minWidth }}
                className="fixed! z-[60]! w-max! max-h-72! overflow-y-auto! rounded-2xl! border! border-gray-100! bg-white! p-2! shadow-[0_20px_50px_rgba(0,0,0,0.12)]!"
              >
                {filteredSublocations.length > 0 ? (
                  filteredSublocations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={locality === item.sublocation}
                      className={`w-full! rounded-xl! border-none! px-4! py-2.5! text-left! text-sm! font-medium! transition-colors! ${
                        locality === item.sublocation
                          ? "bg-[#27427f]! text-white!"
                          : "bg-transparent! text-gray-700! hover:bg-gray-50! hover:text-[#27427f]!"
                      }`}
                      onClick={() => {
                        setLocality(item.sublocation);
                        setIsLocalityMenuOpen(false);
                      }}
                    >
                      {item.sublocation}
                    </button>
                  ))
                ) : (
                  <p className="m-0! px-4! py-2.5! text-sm! font-medium! text-gray-400!">
                    No matching locations
                  </p>
                )}
              </div>,
              document.body,
            )}
          </div>
        </div>

        {/* ── ROW 2: Search Bar ──────────────────────────────────
            Mobile drops the leading search glyph and collapses the submit
            button to a square icon so the input keeps the full width.
            Desktop is unchanged. */}
        <div className="flex! items-center! justify-between! p-2! md:p-3! md:pl-6! relative!">
          <div className="flex-1! flex! items-center! gap-3! relative! min-w-0!">
            <Search className="hidden! md:block! text-gray-400! shrink-0!" size={22} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by Project or Builder..."
              className="w-full! min-w-0! outline-none! bg-transparent! text-gray-800! placeholder-gray-400! font-medium! text-[16px]! border-none! p-0! m-0! shadow-none! focus:ring-0! truncate!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="shrink-0! ml-2! md:ml-4!">
            <button
              type="submit"
              disabled={isSearching}
              aria-label="Search"
              className="flex! items-center! justify-center! bg-[#27427f]! hover:bg-[#ffc900]! text-white! hover:text-[#27427f]! rounded-full! font-semibold! transition-all! shadow-md! gap-2! h-[52px]! disabled:opacity-70! w-[52px]! md:w-auto! md:px-12! py-3.5! md:py-0! text-[15px]!"
            >
              <Search className="md:hidden! shrink-0!" size={20} strokeWidth={2.5} />
              <span className="hidden! md:inline!">{isSearching ? "..." : "Search"}</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-5! flex! justify-center! animate-fade-in!">
          <p className="text-red-500! bg-white/95! backdrop-blur-sm! border! border-red-100! shadow-lg! px-5! py-2.5! rounded-full! text-sm! font-semibold! flex! items-center!">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
