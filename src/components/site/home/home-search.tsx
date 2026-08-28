"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Sublocation, UnitType } from "@/lib/api";
import { MapPin, ChevronDown, Search } from "lucide-react";
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
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const propertyMenuRef = useRef<HTMLDivElement>(null);

  const selectedPropertyLabel =
    propertyTypeOptions.find(([value]) => value === propertyType)?.[1] ?? "Select type...";

  const filteredSublocations = useMemo(() => {
    const query = location.trim().toLowerCase();
    const citySublocations = sublocations.filter(
      (item) => item.city.toLowerCase() === selectedCity.toLowerCase(),
    );
    const matches = query
      ? citySublocations.filter((item) =>
          item.sublocation.toLowerCase().includes(query),
        )
      : citySublocations;

    return matches.slice(0, 8);
  }, [location, selectedCity, sublocations]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationMenuRef.current &&
        !locationMenuRef.current.contains(event.target as Node)
      ) {
        setIsLocationMenuOpen(false);
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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!propertyType) {
      setError("Please select a property type to continue.");
      return;
    }

    setError("");

    const url = buildListingUrl(
      listingType,
      propertyType,
      selectedCity,
      location || undefined,
    );

    router.push(url);
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
                className={`px-6! py-2! rounded-full! text-[14px]! font-semibold! transition-all! duration-200! whitespace-nowrap! ${
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
              className="flex! items-center! justify-between! gap-2! bg-white! border! border-gray-200! hover:border-gray-300! rounded-full! px-5! py-2! transition-colors!"
              onClick={() => setIsPropertyMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsPropertyMenuOpen(false);
              }}
            >
              <span className={`text-[14px]! font-medium! ${propertyType ? "text-gray-700!" : "text-gray-500!"}`}>
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
        </div>

        {/* ── ROW 2: Search Bar ──────────────────────────────── */}
        <div className="flex! items-center! justify-between! p-2! md:p-3! md:pl-6! relative!">
          <div ref={locationMenuRef} className="flex-1! flex! items-center! gap-3! relative!">
            <Search className="text-gray-400! shrink-0!" size={22} strokeWidth={2} />
            <input
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isLocationMenuOpen}
              placeholder="Search by Locality, Project or Builder..."
              className="w-full! outline-none! bg-transparent! text-gray-800! placeholder-gray-400! font-medium! text-[16px]! border-none! p-0! m-0! shadow-none! focus:ring-0! truncate!"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setIsLocationMenuOpen(true);
              }}
              onFocus={() => setIsLocationMenuOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsLocationMenuOpen(false);
              }}
            />

            {/* Location Autocomplete Dropdown */}
            {isLocationMenuOpen && (
              <div
                role="listbox"
                className="absolute! left-0! right-0! top-[calc(100%+16px)]! z-50! max-h-72! overflow-y-auto! rounded-2xl! border! border-gray-100! bg-white! p-2! shadow-[0_20px_50px_rgba(0,0,0,0.12)]!"
              >
                {filteredSublocations.length > 0 ? (
                  filteredSublocations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={location === item.sublocation}
                      className={`w-full! rounded-xl! border-none! px-4! py-3! text-left! text-sm! font-medium! transition-colors! ${
                        location === item.sublocation
                          ? "bg-[#27427f]! text-white!"
                          : "bg-transparent! text-gray-700! hover:bg-gray-50! hover:text-[#27427f]!"
                      }`}
                      onClick={() => {
                        setLocation(item.sublocation);
                        setIsLocationMenuOpen(false);
                      }}
                    >
                      {item.sublocation}
                    </button>
                  ))
                ) : (
                  <p className="m-0! px-4! py-3! text-sm! font-medium! text-gray-400!">
                    No matching locations
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0! ml-4!">
            <button
              type="submit"
              className="flex! items-center! justify-center! bg-[#27427f]! hover:bg-[#ffc900]! text-white! hover:text-[#27427f]! rounded-full! px-12! py-3.5! font-semibold! text-[15px]! transition-all! shadow-md! gap-2! h-[52px]!"
            >
              Search
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
