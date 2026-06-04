"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedSection, setExpandedSection] = useState<string | null>("price");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
    <div className={`bg-white/70! backdrop-blur-2xl! rounded-[24px]! border! border-white! shadow-[0_8px_32px_rgba(0,0,0,0.04)]! overflow-hidden! flex! flex-col! h-full! ${compact ? '' : 'w-full!'}`}>
      {/* Header */}
      <div className="p-6! border-b! border-gray-100/50! flex! items-center! justify-between! bg-gradient-to-r! from-gray-50/50! to-white/30! relative!">
        <h3 className="font-['Lexend',sans-serif]! text-lg! font-bold! text-gray-800! flex! items-center! gap-2.5!">
          <div className="p-2! bg-[#27427f]/10! rounded-xl!">
            <SlidersHorizontal className="w-4! h-4! text-[#27427f]!" />
          </div>
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm! font-semibold! text-[#27427f]! hover:text-[#1d3261]! transition-colors! px-3! py-1.5! hover:bg-[#27427f]/5! rounded-lg!"
        >
          Reset All
        </button>
      </div>

      <div className="flex-1! overflow-y-auto! hide-scrollbar! p-6! space-y-8!">
        {/* Search & Location */}
        <div className="space-y-5!">
          <div className="group!">
            <label className="block! text-xs! font-bold! text-gray-500! uppercase! tracking-widest! mb-2.5! ml-1!">
              Keyword Search
            </label>
            <div className="relative!">
              <Search className="absolute! left-3.5! top-1/2! -translate-y-1/2! w-4.5! h-4.5! text-gray-400! group-focus-within:text-[#27427f]! transition-colors!" />
              <input
                type="text"
                placeholder="Search properties..."
                value={values.keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
                className="w-full! bg-white/50! hover:bg-white! border! border-gray-200/80! rounded-2xl! py-3! pl-10! pr-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400! backdrop-blur-sm!"
              />
            </div>
          </div>
          <div className="group!">
            <label className="block! text-xs! font-bold! text-gray-500! uppercase! tracking-widest! mb-2.5! ml-1!">
              Location
            </label>
            <div className="relative!">
              <MapPin className="absolute! left-3.5! top-1/2! -translate-y-1/2! w-4.5! h-4.5! text-gray-400! group-focus-within:text-[#27427f]! transition-colors!" />
              <input
                type="text"
                placeholder="City or locality..."
                value={values.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="w-full! bg-white/50! hover:bg-white! border! border-gray-200/80! rounded-2xl! py-3! pl-10! pr-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400! backdrop-blur-sm!"
              />
            </div>
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block! text-xs! font-bold! text-gray-500! uppercase! tracking-widest! mb-2.5! ml-1!">
            Looking For
          </label>
          <div className="flex! bg-gray-100/50! p-1.5! rounded-2xl! border! border-gray-200/50! backdrop-blur-sm!">
            {["Sell", "Rent"].map((type) => (
              <button
                key={type}
                onClick={() => updateFilter("listingType", type)}
                className={`flex-1! py-2.5! text-sm! font-bold! rounded-xl! transition-all! duration-300! ${
                  values.listingType === type
                    ? "bg-white! text-[#27427f]! shadow-[0_2px_10px_rgba(0,0,0,0.06)]!"
                    : "text-gray-500! hover:text-gray-800! hover:bg-white/40!"
                }`}
              >
                {type === "Sell" ? "Buy" : "Rent"}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div className="group!">
          <label className="block! text-xs! font-bold! text-gray-500! uppercase! tracking-widest! mb-2.5! ml-1!">
            Property Type
          </label>
          <div className="relative!">
            <select
              value={values.propertyType}
              onChange={(e) => updateFilter("propertyType", e.target.value)}
              className="w-full! bg-white/50! hover:bg-white! border! border-gray-200/80! rounded-2xl! py-3! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! appearance-none! cursor-pointer! backdrop-blur-sm!"
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_TYPES).map(([slug, data]) => (
                <option key={slug} value={data.apiValue}>
                  {data.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute! right-4! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </div>

        {/* Price Range */}
        <div className="border! border-gray-200/60! bg-white/40! backdrop-blur-sm! rounded-2xl! overflow-hidden! shadow-sm! transition-all!">
          <button
            onClick={() => toggleSection("price")}
            className="w-full! flex! items-center! justify-between! p-5! hover:bg-white/60! transition-colors!"
          >
            <span className="text-sm! font-bold! text-gray-800!">Price Range</span>
            <div className="p-1! rounded-full! bg-white! border! border-gray-100! shadow-sm!">
              {expandedSection === "price" ? (
                <ChevronUp className="w-4! h-4! text-gray-500!" />
              ) : (
                <ChevronDown className="w-4! h-4! text-gray-500!" />
              )}
            </div>
          </button>
          {expandedSection === "price" && (
            <div className="p-5! pt-0! space-y-5!">
              <div className="flex! items-center! gap-3!">
                <div className="flex-1! relative!">
                  <span className="absolute! left-3.5! top-1/2! -translate-y-1/2! text-gray-400! text-sm! font-medium!">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={values.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="w-full! bg-white! border! border-gray-200/80! rounded-xl! py-2.5! pl-8! pr-3! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400!"
                  />
                </div>
                <div className="w-3! h-[1px]! bg-gray-300!"></div>
                <div className="flex-1! relative!">
                  <span className="absolute! left-3.5! top-1/2! -translate-y-1/2! text-gray-400! text-sm! font-medium!">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={values.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="w-full! bg-white! border! border-gray-200/80! rounded-xl! py-2.5! pl-8! pr-3! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400!"
                  />
                </div>
              </div>
              <div className="flex! flex-wrap! gap-2!">
                {presetPrices.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateFilter("minPrice", preset.min);
                      updateFilter("maxPrice", preset.max);
                    }}
                    className={`px-3.5! py-2! rounded-xl! border! text-xs! font-bold! transition-all! duration-300! ${
                      values.minPrice === preset.min && values.maxPrice === preset.max
                        ? "bg-[#27427f]! text-white! border-[#27427f]! shadow-[0_4px_12px_rgba(39,66,127,0.2)]!"
                        : "bg-white/80! text-gray-600! border-gray-200/80! hover:border-[#27427f]/40! hover:text-[#27427f]! hover:bg-white! shadow-sm!"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block! text-xs! font-bold! text-gray-500! uppercase! tracking-widest! mb-2.5! ml-1!">
            Bedrooms
          </label>
          <div className="flex! flex-wrap! gap-2!">
            {["1", "2", "3", "4", "5+"].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter("bedrooms", num)}
                className={`flex-1! min-w-[3rem]! py-2.5! rounded-xl! border! text-sm! font-bold! transition-all! duration-300! ${
                  values.bedrooms === num
                    ? "bg-[#27427f]! text-white! border-[#27427f]! shadow-[0_4px_12px_rgba(39,66,127,0.2)]!"
                    : "bg-white/80! text-gray-600! border-gray-200/80! hover:border-[#27427f]/40! hover:text-[#27427f]! hover:bg-white! shadow-sm!"
                }`}
              >
                {num} BHK
              </button>
            ))}
          </div>
        </div>

        {/* More Filters Accordion */}
        <div className="border! border-gray-200/60! bg-white/40! backdrop-blur-sm! rounded-2xl! overflow-hidden! shadow-sm! transition-all!">
          <button
            onClick={() => toggleSection("more")}
            className="w-full! flex! items-center! justify-between! p-5! hover:bg-white/60! transition-colors!"
          >
            <span className="text-sm! font-bold! text-gray-800!">More Filters</span>
            <div className="p-1! rounded-full! bg-white! border! border-gray-100! shadow-sm!">
              {expandedSection === "more" ? (
                <ChevronUp className="w-4! h-4! text-gray-500!" />
              ) : (
                <ChevronDown className="w-4! h-4! text-gray-500!" />
              )}
            </div>
          </button>
          {expandedSection === "more" && (
            <div className="p-5! pt-0! space-y-6!">
              {/* Area */}
              <div>
                <label className="block! text-xs! font-bold! text-gray-500! mb-2.5! ml-1!">Area (sq.ft)</label>
                <div className="flex! items-center! gap-3!">
                  <input
                    type="number"
                    placeholder="Min"
                    value={values.minArea}
                    onChange={(e) => updateFilter("minArea", e.target.value)}
                    className="flex-1! bg-white! border! border-gray-200/80! rounded-xl! py-2.5! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400!"
                  />
                  <div className="w-3! h-[1px]! bg-gray-300!"></div>
                  <input
                    type="number"
                    placeholder="Max"
                    value={values.maxArea}
                    onChange={(e) => updateFilter("maxArea", e.target.value)}
                    className="flex-1! bg-white! border! border-gray-200/80! rounded-xl! py-2.5! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! placeholder:text-gray-400!"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div className="relative!">
                <label className="block! text-xs! font-bold! text-gray-500! mb-2.5! ml-1!">Furnishing</label>
                <div className="relative!">
                  <select
                    value={values.furnishing}
                    onChange={(e) => updateFilter("furnishing", e.target.value)}
                    className="w-full! bg-white! border! border-gray-200/80! rounded-xl! py-3! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! appearance-none! cursor-pointer!"
                  >
                    <option value="">Any</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                  <ChevronDown className="absolute! right-4! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
                </div>
              </div>

              {/* Facing */}
              <div className="relative!">
                <label className="block! text-xs! font-bold! text-gray-500! mb-2.5! ml-1!">Facing</label>
                <div className="relative!">
                  <select
                    value={values.facing}
                    onChange={(e) => updateFilter("facing", e.target.value)}
                    className="w-full! bg-white! border! border-gray-200/80! rounded-xl! py-3! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! appearance-none! cursor-pointer!"
                  >
                    <option value="">Any</option>
                    {["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map((dir) => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute! right-4! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
                </div>
              </div>

              {/* Property Age */}
              <div className="relative!">
                <label className="block! text-xs! font-bold! text-gray-500! mb-2.5! ml-1!">Property Age</label>
                <div className="relative!">
                  <select
                    value={values.propertyAge}
                    onChange={(e) => updateFilter("propertyAge", e.target.value)}
                    className="w-full! bg-white! border! border-gray-200/80! rounded-xl! py-3! px-4! text-sm! font-medium! text-gray-700! focus:outline-none! focus:ring-4! focus:ring-[#27427f]/10! focus:border-[#27427f]/30! transition-all! shadow-sm! appearance-none! cursor-pointer!"
                  >
                    <option value="">Any</option>
                    <option value="new">Under Construction / New</option>
                    <option value="1-5">1 to 5 Years</option>
                    <option value="5-10">5 to 10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                  <ChevronDown className="absolute! right-4! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
