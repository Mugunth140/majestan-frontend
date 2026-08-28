"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Sublocation, UnitType } from "@/lib/api";
import { MapPin, ChevronDown, Search, Home } from "lucide-react";
import { buildListingUrl } from "@/lib/seo-urls";
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
      if (
        localityMenuRef.current &&
        !localityMenuRef.current.contains(event.target as Node)
      ) {
        setIsLocalityMenuOpen(false);
      }

      if (
        propertyMenuRef.current &&
        !propertyMenuRef.current.contains(event.target as Node)
      ) {
        setIsPropertyMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Case 1: Property type selected — build URL directly from Row 1 filters
    if (propertyType) {
      const url = buildListingUrl(
        listingType,
        propertyType,
        selectedCity,
        locality || undefined,
      );
      router.push(url);
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
      // Fallback: go to generic listing page with keyword
      const fallbackListingType = listingType === "Sell" ? "for-sale" : "for-rent";
      router.push(`/${fallbackListingType}/properties/coimbatore?keyword=${encodeURIComponent(searchQuery)}`);
      return;
    }

    // Nothing selected or typed
    setError("Please select a property type or enter a search term.");
  }

  return (
    <div className="w-full! max-w-[960px]! mx-auto! mt-6! relative! z-20! px-4! text-left!">
      <form
        onSubmit={onSubmit}
        className="w-full! bg-white! rounded-3xl! shadow-[0_24px_60px_rgba(22,30,45,0.08)]! border! border-gray-100! text-left!"
      >
        {/* ── ROW 1: Toggles & Dropdowns ────────────────────────── */}
        <div className="flex! flex-wrap! items-center! gap-3! px-4! py-4! md:px-6! border-b! border-gray-100!">
          
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
              <span className={`text-[14px]! font-medium! leading-none! ${propertyType ? "text-gray-700!" : "text-gray-500!"}`}>
                {propertyType ? selectedPropertyLabel : "Property Type"}
              </span>
              <ChevronDown className="text-gray-400! shrink-0!" size={16} strokeWidth={2.5} />
            </button>

            {isPropertyMenuOpen && (
              <div
                role="listbox"
                className="absolute! left-0! top-[calc(100%+8px)]! z-50! w-56! max-h-72! overflow-y-auto! rounded-2xl! border! border-gray-100! bg-white! p-2! shadow-[0_20px_50px_rgba(0,0,0,0.12)]!"
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
              </div>
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
              <span className={`text-[14px]! font-medium! leading-none! ${locality ? "text-gray-700!" : "text-gray-500!"}`}>
                {locality || "Locality"}
              </span>
              <ChevronDown className={`text-gray-400! shrink-0! transition-transform! ${isLocalityMenuOpen ? "rotate-180!" : ""}`} size={16} strokeWidth={2.5} />
            </button>

            {isLocalityMenuOpen && (
              <div
                role="listbox"
                className="absolute! left-0! top-[calc(100%+8px)]! z-50! w-56! max-h-72! overflow-y-auto! rounded-2xl! border! border-gray-100! bg-white! p-2! shadow-[0_20px_50px_rgba(0,0,0,0.12)]!"
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
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 2: Search Bar ──────────────────────────────── */}
        <div className="flex! items-center! justify-between! p-2! md:p-3! md:pl-6! relative!">
          <div className="flex-1! flex! items-center! gap-3! relative!">
            <Search className="text-gray-400! shrink-0!" size={22} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by Project or Builder..."
              className="w-full! outline-none! bg-transparent! text-gray-800! placeholder-gray-400! font-medium! text-[16px]! border-none! p-0! m-0! shadow-none! focus:ring-0! truncate!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="shrink-0! ml-4!">
            <button
              type="submit"
              disabled={isSearching}
              className="flex! items-center! justify-center! bg-[#27427f]! hover:bg-[#ffc900]! text-white! hover:text-[#27427f]! rounded-full! px-12! py-3.5! font-semibold! text-[15px]! transition-all! shadow-md! gap-2! h-[52px]! disabled:opacity-70!"
            >
              {isSearching ? "..." : "Search"}
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
