"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Sublocation, UnitType } from "@/lib/api";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { buildListingUrl } from "@/lib/seo-urls";

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
    const matches = query
      ? sublocations.filter((item) =>
          item.sublocation.toLowerCase().includes(query),
        )
      : sublocations;

    return matches.slice(0, 8);
  }, [location, sublocations]);

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
      location || "coimbatore"
    );

    router.push(url);
  }

  return (
    <div className="!w-full !max-w-[1100px] !mx-auto !mt-4 !relative !z-20 !px-4">
      <form
        className="!w-full !bg-white/95 !backdrop-blur-2xl !rounded-[2rem] md:!rounded-full !shadow-2xl !border !border-white/80 !p-2.5 !flex !flex-col md:!flex-row !items-center !gap-2 md:!gap-0"
        onSubmit={onSubmit}
      >
        {/* ── Location Input ────────────────────────────────── */}
        <div
          ref={locationMenuRef}
          className="!w-full md:!w-[35%] !flex !items-center !px-5 !py-3 !relative group !rounded-2xl md:!rounded-none md:!rounded-l-full hover:!bg-gray-50 md:!border-r !border-gray-200 !transition-colors !cursor-text"
        >
          <MapPin className="!text-[#27427f] !mr-3 !shrink-0" size={24} strokeWidth={1.8} />
          <div className="!w-full !flex !flex-col !text-left !relative">
            <label
              id="location-label"
              className="!text-[11px] !font-semibold !text-gray-500 !uppercase !tracking-wide !mb-0.5 !leading-normal group-focus-within:!text-[#27427f] !transition-colors"
            >
              Location
            </label>
            <input
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isLocationMenuOpen}
              aria-controls="location-options"
              aria-labelledby="location-label"
              placeholder="Search area, landmark..."
              className="!w-full !outline-none !bg-transparent !text-gray-900 !placeholder-gray-400 !font-semibold !text-[15px] !border-none !p-0 !m-0 !shadow-none focus:!ring-0 !truncate !rounded-none !leading-normal !h-auto !min-h-0"
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

            {isLocationMenuOpen && (
              <div
                id="location-options"
                role="listbox"
                aria-labelledby="location-label"
                className="!absolute !left-0 !right-0 !top-[calc(100%+14px)] !z-50 !max-h-72 !overflow-y-auto !rounded-2xl !border !border-gray-100 !bg-white !p-2 !shadow-[0_18px_45px_rgba(22,30,45,0.16)]"
              >
                {filteredSublocations.length > 0 ? (
                  filteredSublocations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={location === item.sublocation}
                      className={`!w-full !rounded-xl !border-none !px-3.5 !py-2.5 !text-left !text-sm !font-semibold !shadow-none !outline-none !transition-colors ${
                        location === item.sublocation
                          ? "!bg-[#27427f] !text-white"
                          : "!bg-transparent !text-gray-700 hover:!bg-[#27427f]/5 hover:!text-[#27427f]"
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
                  <p className="!m-0 !px-3.5 !py-2.5 !text-sm !font-semibold !text-gray-400">
                    No matching locations
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Property Type Dropdown ────────────────────────── */}
        <div
          ref={propertyMenuRef}
          className="!w-full md:!w-[35%] !flex !items-center !px-5 !py-3 !relative group !rounded-2xl md:!rounded-none hover:!bg-gray-50 md:!border-r !border-gray-200 !transition-colors"
        >
          <div className="!w-full !flex !flex-col !text-left !relative">
            <label
              id="property-type-label"
              className="!text-[11px] !font-semibold !text-gray-500 !uppercase !tracking-wide !mb-0.5 !leading-normal group-focus-within:!text-[#27427f] !transition-colors"
            >
              Property Type
            </label>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isPropertyMenuOpen}
              aria-labelledby="property-type-label"
              className={`!w-full !border-none !bg-transparent !p-0 !m-0 !shadow-none !outline-none focus:!ring-0 !text-left !font-semibold !text-[15px] !leading-normal !transition-colors ${
                propertyType ? "!text-gray-900" : "!text-gray-400"
              }`}
              onClick={() => setIsPropertyMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsPropertyMenuOpen(false);
              }}
            >
              {selectedPropertyLabel}
            </button>

            {isPropertyMenuOpen && (
              <div
                role="listbox"
                aria-labelledby="property-type-label"
                className="!absolute !left-0 !right-0 !top-[calc(100%+14px)] !z-50 !max-h-72 !overflow-y-auto !rounded-2xl !border !border-gray-100 !bg-white !p-2 !shadow-[0_18px_45px_rgba(22,30,45,0.16)]"
              >
                {propertyTypeOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={propertyType === value}
                    className={`!w-full !rounded-xl !border-none !px-3.5 !py-2.5 !text-left !text-sm !font-semibold !shadow-none !outline-none !transition-colors ${
                      propertyType === value
                        ? "!bg-[#27427f] !text-white"
                        : "!bg-transparent !text-gray-700 hover:!bg-[#27427f]/5 hover:!text-[#27427f]"
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
          <ChevronDown
            className={`!ml-2 !shrink-0 !pointer-events-none !transition-colors ${
              isPropertyMenuOpen ? "!rotate-180 !text-[#27427f]" : "!text-gray-400 group-hover:!text-[#27427f]"
            }`}
            size={20}
            strokeWidth={2}
          />
        </div>

        {/* ── Buy/Rent Toggle + Search Button ───────────────── */}
        <div className="!w-full md:!w-[30%] !flex !flex-col md:!flex-row !items-center !justify-between !px-5 md:!px-0 md:!pl-4 md:!pr-1.5 !py-3 md:!py-1 !relative !rounded-2xl md:!rounded-none md:!rounded-r-full !transition-colors !gap-3 md:!gap-3">
          {/* Toggle container */}
          <div className="!flex !bg-gray-100 !p-1 !rounded-full !border !border-gray-200/60 !w-full md:!w-auto !relative">
            {/* Sliding pill indicator */}
            <div
              className="!absolute !top-1 !bottom-1 !w-[calc(50%-4px)] !bg-white !rounded-full !shadow-sm !transition-transform !duration-300 !ease-in-out !pointer-events-none"
              style={{
                transform: listingType === "Rent" ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => setListingType("Sell")}
              className={`!relative !z-10 !flex-1 md:!flex-none md:!w-[68px] !py-2 !rounded-full !text-[13px] !font-bold !transition-colors !duration-300 !border-none !bg-transparent !shadow-none !outline-none !leading-normal !m-0 ${
                listingType === "Sell" ? "!text-[#27427f]" : "!text-gray-500 hover:!text-gray-700"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setListingType("Rent")}
              className={`!relative !z-10 !flex-1 md:!flex-none md:!w-[68px] !py-2 !rounded-full !text-[13px] !font-bold !transition-colors !duration-300 !border-none !bg-transparent !shadow-none !outline-none !leading-normal !m-0 ${
                listingType === "Rent" ? "!text-[#27427f]" : "!text-gray-500 hover:!text-gray-700"
              }`}
            >
              Rent
            </button>
          </div>

          {/* Search button */}
  
          <button
            type="submit"
            className="bg-[#27427f]! group-hover:bg-[#1a2d59]! !text-white !rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-none outline-none leading-normal md:hover:scale-100 focus:ring-0 focus:ring-[#27427f]/30 px-6! py-3.5! gap-2.5">
            <span className="ml-2 font-bold text-base bg-[#27427f]! group-hover:bg-[#1a2d59]! text-white">Search</span>
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      {error && (
        <div className="!mt-4 !flex !justify-center animate-fade-in">
          <p className="text-red-500! bg-white px-5! py-2.5! rounded-full !text-sm !font-semibold !flex items-center">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
