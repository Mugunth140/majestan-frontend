"use client";

import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/seo-urls";

export type FilterValues = {
  keyword: string;
  propertyType: string;
  listingType: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  bedrooms: string;
  facing: string;
  furnishing: string;
  propertyAge: string;
};

export type PropertySearchFiltersProps = {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
  compact?: boolean;
};

export function PropertySearchFilters({
  values,
  onChange,
  onReset,
  compact = false,
}: PropertySearchFiltersProps) {

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const presetPrices = [
    { label: "Under ₹50L", min: "", max: "5000000" },
    { label: "₹50L - ₹1Cr", min: "5000000", max: "10000000" },
    { label: "₹1Cr - ₹2Cr", min: "10000000", max: "20000000" },
    { label: "₹2Cr+", min: "20000000", max: "" },
  ];

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-200/60! shadow-sm! w-full!">
      {/* Header */}
      <div className="px-5! py-4! border-b! border-gray-100! flex! items-center! justify-between!">
        <h3 className="font-['Lexend',sans-serif]! text-base! font-bold! text-gray-900! flex! items-center! gap-2!">
          <SlidersHorizontal className="w-4! h-4! text-[#27427f]!" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs! font-bold! text-[#27427f]! hover:text-[#1d3261]! transition-colors! uppercase! tracking-wider!"
        >
          Reset All
        </button>
      </div>

      {/* Filter sections — no scroll */}
      <div className="p-5! space-y-5!">

        {/* Keyword Search */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Keyword
          </label>
          <div className="relative!">
            <Search className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400!" />
            <input
              type="text"
              placeholder="Search properties..."
              value={values.keyword}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              className="w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-9! pr-3! text-sm! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Location
          </label>
          <div className="relative!">
            <MapPin className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400!" />
            <input
              type="text"
              placeholder="City or locality..."
              value={values.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-9! pr-3! text-sm! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
            />
          </div>
        </div>

        {/* Listing Type Toggle */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Looking For
          </label>
          <div className="flex! bg-gray-100! p-1! rounded-lg! gap-1!">
            {["Sell", "Rent"].map((type) => (
              <button
                key={type}
                onClick={() => updateFilter("listingType", type)}
                className={`flex-1! py-2! text-sm! font-bold! rounded-md! transition-all! duration-200! ${
                  values.listingType === type
                    ? "bg-white! text-[#27427f]! shadow-sm!"
                    : "text-gray-500! hover:text-gray-700!"
                }`}
              >
                {type === "Sell" ? "Buy" : "Rent"}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Property Type
          </label>
          <div className="relative!">
            <select
              value={values.propertyType}
              onChange={(e) => updateFilter("propertyType", e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="w-full! block! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-3! pr-8! text-sm! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! cursor-pointer!"
            >
              {Object.entries(PROPERTY_TYPES).map(([slug, data]) => (
                <option key={slug} value={data.apiValue}>
                  {data.apiValue === "" ? "All Types" : data.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t! border-gray-100!"></div>

        {/* Price Range */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Price Range
          </label>
          <div className="flex! items-center! gap-2! mb-3!">
            <div className="flex-1! relative!">
              <span className="absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400! text-xs! font-medium!">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={values.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2! pl-7! pr-2! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
              />
            </div>
            <span className="text-gray-300! text-xs!">—</span>
            <div className="flex-1! relative!">
              <span className="absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400! text-xs! font-medium!">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={values.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2! pl-7! pr-2! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
              />
            </div>
          </div>
          <div className="flex! flex-wrap! gap-1.5!">
            {presetPrices.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  updateFilter("minPrice", preset.min);
                  updateFilter("maxPrice", preset.max);
                }}
                className={`px-2.5! py-1.5! rounded-md! border! text-[11px]! font-bold! transition-all! ${
                  values.minPrice === preset.min && values.maxPrice === preset.max
                    ? "bg-[#27427f]! text-white! border-[#27427f]!"
                    : "bg-white! text-gray-600! border-gray-200! hover:border-[#27427f]/40! hover:text-[#27427f]!"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Bedrooms
          </label>
          <div className="flex! gap-1.5!">
            {["1", "2", "3", "4", "5+"].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter("bedrooms", values.bedrooms === num ? "" : num)}
                className={`flex-1! py-2! rounded-md! border! text-sm! font-bold! transition-all! ${
                  values.bedrooms === num
                    ? "bg-[#27427f]! text-white! border-[#27427f]!"
                    : "bg-white! text-gray-600! border-gray-200! hover:border-[#27427f]/40! hover:text-[#27427f]!"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t! border-gray-100!"></div>

        {/* Area */}
        <div className="w-full!">
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Area (sq.ft)
          </label>
          <div className="flex! items-center! gap-2! w-full!">
            <input
              type="number"
              placeholder="Min"
              value={values.minArea}
              onChange={(e) => updateFilter("minArea", e.target.value)}
              className="flex-1! min-w-0! w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2! px-3! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
            />
            <span className="text-gray-300! text-xs! shrink-0!">—</span>
            <input
              type="number"
              placeholder="Max"
              value={values.maxArea}
              onChange={(e) => updateFilter("maxArea", e.target.value)}
              className="flex-1! min-w-0! w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2! px-3! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!"
            />
          </div>
        </div>

        {/* Furnishing */}
        <div className="w-full!">
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Furnishing
          </label>
          <div className="relative! w-full!">
            <select
              value={values.furnishing}
              onChange={(e) => updateFilter("furnishing", e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="w-full! block! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-3! pr-8! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! cursor-pointer!"
            >
              <option value="">Any</option>
              <option value="furnished">Furnished</option>
              <option value="semi">Semi-Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </div>

        {/* Facing */}
        <div className="w-full!">
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Facing
          </label>
          <div className="relative! w-full!">
            <select
              value={values.facing}
              onChange={(e) => updateFilter("facing", e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="w-full! block! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-3! pr-8! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! cursor-pointer!"
            >
              <option value="">Any</option>
              {["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map((dir) => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </div>

        {/* Property Age */}
        <div className="w-full!">
          <label className="block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!">
            Property Age
          </label>
          <div className="relative! w-full!">
            <select
              value={values.propertyAge}
              onChange={(e) => updateFilter("propertyAge", e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className="w-full! block! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-3! pr-8! text-sm! focus:outline-none! focus:border-[#27427f]! transition-all! cursor-pointer!"
            >
              <option value="">Any</option>
              <option value="new">Under Construction / New</option>
              <option value="1-5">1 to 5 Years</option>
              <option value="5-10">5 to 10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </div>
      </div>
    </div>
  );
}
