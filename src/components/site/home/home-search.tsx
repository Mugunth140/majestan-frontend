"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Sublocation, UnitType } from "@/lib/api";
import { MapPin, ChevronDown, Search } from "lucide-react";

const propertyTypeOptions = [
  ["apartment", "Apartment"],
  ["villa", "Villa"],
  ["independenthouse", "Independent House"],
  ["plot", "Plot"],
  ["commercialspace", "Commercial Space"],
  ["industrialspace", "Industrial"],
  ["farmlands", "Farmlands"],
] as const;

const propertySlugMap: Record<string, { buy: string; rent: string }> = {
  apartment: { buy: "buy-apartments", rent: "rent-apartments" },
  villa: { buy: "buy-villas", rent: "rent-villas" },
  independenthouse: {
    buy: "buy-independent-houses",
    rent: "rent-independent-houses",
  },
  plot: { buy: "buy-plots", rent: "buy-plots" },
  commercialspace: {
    buy: "buy-commercial-space",
    rent: "rent-commercial-space",
  },
  industrialspace: { buy: "buy-industrials", rent: "rent-industrials" },
  farmlands: { buy: "buy-farmlands", rent: "buy-farmlands" },
};

export function HomeSearch({
  sublocations,
  unitTypes,
}: {
  sublocations: Sublocation[];
  unitTypes: UnitType[];
}) {
  const router = useRouter();
  const [listingType, setListingType] = useState<"Sell" | "Rent">("Sell");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!propertyType) {
      setError("Please select a property type to continue.");
      return;
    }

    const listingMode = listingType === "Rent" ? "rent" : "buy";
    const routeBase = propertySlugMap[propertyType]?.[listingMode];
    const params = new URLSearchParams();

    if (listingType) params.set("listingType", listingType);
    if (propertyType) params.set("propertyType", propertyType);
    if (location) params.set("location", location);

    setError("");

    if (routeBase) {
      const suffix = location
        ? location.toLowerCase().trim().replace(/\s+/g, "-")
        : "coimbatore";
      router.push(`/${routeBase}-${suffix}`);
      return;
    }

    router.push(`/property?${params.toString()}`);
  }

  return (
    <div className="!w-full !max-w-[1100px] !mx-auto !mt-4 !relative !z-20 !px-4">
      <form
        className="!w-full !bg-white/95 !backdrop-blur-2xl !rounded-[2rem] md:!rounded-full !shadow-2xl !border !border-white/80 !p-2.5 !flex !flex-col md:!flex-row !items-center !gap-2 md:!gap-0"
        onSubmit={onSubmit}
      >
        {/* ── Location Input ────────────────────────────────── */}
        <div className="!w-full md:!w-[35%] !flex !items-center !px-5 !py-3 !relative group !rounded-2xl md:!rounded-none md:!rounded-l-full hover:!bg-gray-50 md:!border-r !border-gray-200 !transition-colors !cursor-text">
          <MapPin className="!text-[#27427f] !mr-3 !shrink-0" size={24} strokeWidth={1.8} />
          <div className="!w-full !flex !flex-col !text-left !overflow-hidden">
            <label className="!text-[11px] !font-semibold !text-gray-500 !uppercase !tracking-wide !mb-0.5 !leading-normal group-focus-within:!text-[#27427f] !transition-colors">
              Location
            </label>
            <input
              type="text"
              list="sublocations-list"
              placeholder="Search area, landmark..."
              className="!w-full !outline-none !bg-transparent !text-gray-900 !placeholder-gray-400 !font-semibold !text-[15px] !border-none !p-0 !m-0 !shadow-none focus:!ring-0 !truncate !rounded-none !leading-normal !h-auto !min-h-0"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <datalist id="sublocations-list">
              {sublocations.map((item) => (
                <option key={item.id} value={item.sublocation} />
              ))}
            </datalist>
          </div>
        </div>

        {/* ── Property Type Dropdown ────────────────────────── */}
        <div className="!w-full md:!w-[35%] !flex !items-center !px-5 !py-3 !relative group !rounded-2xl md:!rounded-none hover:!bg-gray-50 md:!border-r !border-gray-200 !transition-colors !cursor-pointer">
          <div className="!w-full !flex !flex-col !text-left !overflow-hidden !relative">
            <label className="!text-[11px] !font-semibold !text-gray-500 !uppercase !tracking-wide !mb-0.5 !leading-normal group-focus-within:!text-[#27427f] !transition-colors">
              Property Type
            </label>
            <select
              aria-label="Property type"
              className="!w-full !outline-none !bg-transparent !text-gray-900 !font-semibold !text-[15px] !appearance-none !cursor-pointer !border-none !p-0 !m-0 !shadow-none focus:!ring-0 !rounded-none !leading-normal !h-auto !min-h-0"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="" disabled className="!text-gray-400">
                Select type...
              </option>
              {propertyTypeOptions.map(([value, label]) => (
                <option value={value} key={value} className="!text-gray-800">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown className="text-gray-400! group-hover:!text-[#27427f] !ml-2 !shrink-0 !pointer-events-none !transition-colors" size={20} strokeWidth={2} />
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


