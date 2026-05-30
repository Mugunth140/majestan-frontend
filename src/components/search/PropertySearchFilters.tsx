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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full ${compact ? '' : 'w-full'}`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-['Lexend',sans-serif] text-lg font-bold text-[#161e2d] flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#27427f]" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm font-semibold text-[#27427f] hover:text-[#1d3261] transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-6">
        {/* Search & Location */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={values.keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#27427f]/20 focus:border-[#27427f] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="City or locality..."
                value={values.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#27427f]/20 focus:border-[#27427f] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Looking For
          </label>
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            {["Sell", "Rent"].map((type) => (
              <button
                key={type}
                onClick={() => updateFilter("listingType", type)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  values.listingType === type
                    ? "bg-white text-[#27427f] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {type === "Sell" ? "Buy" : "Rent"}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Property Type
          </label>
          <select
            value={values.propertyType}
            onChange={(e) => updateFilter("propertyType", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#27427f]/20 focus:border-[#27427f] transition-all appearance-none"
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPES).map(([slug, data]) => (
              <option key={slug} value={data.apiValue}>
                {data.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-gray-700">Price Range</span>
            {expandedSection === "price" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "price" && (
            <div className="p-4 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={values.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:border-[#27427f] transition-all"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={values.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:border-[#27427f] transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {presetPrices.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateFilter("minPrice", preset.min);
                      updateFilter("maxPrice", preset.max);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      values.minPrice === preset.min && values.maxPrice === preset.max
                        ? "bg-[#27427f] text-white border-[#27427f]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#27427f]/50 hover:text-[#27427f]"
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Bedrooms
          </label>
          <div className="flex flex-wrap gap-2">
            {["1", "2", "3", "4", "5+"].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter("bedrooms", num)}
                className={`flex-1 min-w-[3rem] py-2 rounded-lg border text-sm font-semibold transition-all ${
                  values.bedrooms === num
                    ? "bg-[#27427f] text-white border-[#27427f]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#27427f]/50 hover:text-[#27427f]"
                }`}
              >
                {num} BHK
              </button>
            ))}
          </div>
        </div>

        {/* More Filters Accordion */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("more")}
            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-gray-700">More Filters</span>
            {expandedSection === "more" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "more" && (
            <div className="p-4 bg-white space-y-5">
              {/* Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Area (sq.ft)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={values.minArea}
                    onChange={(e) => updateFilter("minArea", e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#27427f]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={values.maxArea}
                    onChange={(e) => updateFilter("maxArea", e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#27427f]"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Furnishing</label>
                <select
                  value={values.furnishing}
                  onChange={(e) => updateFilter("furnishing", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#27427f]"
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Facing */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Facing</label>
                <select
                  value={values.facing}
                  onChange={(e) => updateFilter("facing", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#27427f]"
                >
                  <option value="">Any</option>
                  {["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>

              {/* Property Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Property Age</label>
                <select
                  value={values.propertyAge}
                  onChange={(e) => updateFilter("propertyAge", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#27427f]"
                >
                  <option value="">Any</option>
                  <option value="new">Under Construction / New</option>
                  <option value="1-5">1 to 5 Years</option>
                  <option value="5-10">5 to 10 Years</option>
                  <option value="10+">10+ Years</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
