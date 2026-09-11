"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { getHomePageData, type Sublocation } from "@/lib/api";
import { useLocationContext } from "@/contexts/LocationContext";
import { useDebouncedValue } from "@/lib/use-debounced-value";

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

const fieldClass =
  "w-full! block! bg-white! border! border-gray-200! rounded-lg! py-2.5! text-[13px]! font-medium! text-gray-800! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! placeholder:text-gray-400! placeholder:font-normal!";

function Section({
  title,
  value,
  defaultOpen = false,
  children,
}: {
  title: string;
  value?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group! border-b! border-gray-100! last:border-b-0!"
    >
      <summary className="flex! items-center! justify-between! cursor-pointer! list-none! py-3.5! [&::-webkit-details-marker]:hidden!">
        <span className="min-w-0!">
          <span className="block! text-[13px]! font-medium! text-gray-800!">
            {title}
          </span>
          {value ? (
            <span className="block! text-[11px]! font-light! text-[#27427f]! truncate! mt-0.5!">
              {value}
            </span>
          ) : null}
        </span>
        <ChevronDown className="w-4! h-4! text-gray-400! shrink-0! transition-transform! duration-200! group-open:rotate-180!" />
      </summary>
      <div className="pb-4!">{children}</div>
    </details>
  );
}

export function PropertySearchFilters({
  values,
  onChange,
  onReset,
  compact = false,
}: PropertySearchFiltersProps) {
  const { location: currentCity } = useLocationContext();
  const [sublocations, setSublocations] = useState<Sublocation[]>([]);

  useEffect(() => {
    getHomePageData().then(data => {
      setSublocations(data.filters?.sublocations || []);
    }).catch(err => {
      console.error("Failed to load sublocations", err);
    });
  }, []);

  const citySublocations = sublocations.filter(s => s.city.toLowerCase() === currentCity.toLowerCase());

  const [textFields, setTextFields] = useState({
    keyword: values.keyword,
    
    minPrice: values.minPrice,
    maxPrice: values.maxPrice,
    minArea: values.minArea,
    maxArea: values.maxArea,
  });

  // Only sync down if it's a reset (all empty) to avoid loop
  useEffect(() => {
    if (!values.keyword && !values.minPrice && !values.maxPrice && !values.minArea && !values.maxArea) {
      setTextFields({
        keyword: "", minPrice: "", maxPrice: "", minArea: "", maxArea: ""
      });
    }
  }, [values.keyword, values.minPrice, values.maxPrice, values.minArea, values.maxArea]);

  const debouncedText = useDebouncedValue(textFields, 500);

  useEffect(() => {
    if (
      debouncedText.keyword !== values.keyword ||
            debouncedText.minPrice !== values.minPrice ||
      debouncedText.maxPrice !== values.maxPrice ||
      debouncedText.minArea !== values.minArea ||
      debouncedText.maxArea !== values.maxArea
    ) {
      onChange({ ...values, ...debouncedText });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  const updateTextField = (key: keyof typeof textFields, value: string) => {
    setTextFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onChange({ ...values, ...textFields, [key]: value });
  };

  const presetPrices = [
    { label: "Under ₹50L", min: "", max: "5000000" },
    { label: "₹50L - ₹1Cr", min: "5000000", max: "10000000" },
    { label: "₹1Cr - ₹2Cr", min: "10000000", max: "20000000" },
    { label: "₹2Cr+", min: "20000000", max: "" },
  ];

  const isAll = values.location.toLowerCase() === currentCity.toLowerCase() || values.location === "";
  const locationSummary = isAll
    ? `All of ${currentCity}`
    : (citySublocations.find(s => s.sublocation.toLowerCase() === values.location.toLowerCase())?.sublocation ?? values.location);
  const typeSummary = Object.values(PROPERTY_TYPES).find(p => p.apiValue === values.propertyType)?.label ?? "";
  const priceSummary = values.minPrice || values.maxPrice
    ? `${values.minPrice ? `₹${Number(values.minPrice) / 100000}L` : "0"} – ${values.maxPrice ? `₹${Number(values.maxPrice) / 100000}L` : "Any"}`
    : "";
  const bhkSummary = values.bedrooms ? `${values.bedrooms} BHK` : "";
  const moreCount = [values.minArea, values.maxArea, values.furnishing, values.facing, values.propertyAge].filter(Boolean).length;
  const moreSummary = moreCount > 0 ? `${moreCount} selected` : "";

  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-xl! border! border-gray-200/70! shadow-sm! w-full!">
      {/* Header */}
      <div className="px-5! py-4! border-b! border-gray-100! flex! items-center! justify-between!">
        <h3 className="text-[15px]! font-medium! text-gray-800! flex! items-center! gap-2!">
          <SlidersHorizontal className="w-4! h-4! text-gray-400!" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-[11px]! font-medium! bg-neutral-100! p-2! rounded-lg! text-gray-500! hover:text-red-500! transition-colors! tracking-wider! cursor-pointer!"
        >
          Reset
        </button>
      </div>

      <div className="px-5! py-4!">
        {/* Keyword Search */}
        <div className="relative!">
          <Search className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400!" />
          <input
            type="text"
            placeholder="Search properties..."
            value={textFields.keyword}
            onChange={(e) => updateTextField("keyword", e.target.value)}
            className={`${fieldClass} pl-9! pr-3!`}
          />
        </div>

        {/* Listing Type Toggle */}
        <div className="flex! bg-gray-100! p-1! rounded-lg! gap-1! mt-3!">
          {["Sell", "Rent"].map((type) => (
            <button
              key={type}
              onClick={() => updateFilter("listingType", type)}
              className={`flex-1! py-2! text-[13px]! font-medium! rounded-md! transition-all! duration-200! cursor-pointer! ${
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

      {/* Accordion sections */}
      <div className="px-5! pb-2! border-t! border-gray-100!">

        <Section title="Location" value={locationSummary} defaultOpen>
          <div className="relative!">
            <MapPin className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! z-10!" />
            <select
              value={isAll ? "" : values.location.toLowerCase()}
              onChange={(e) => {
                 const newVal = e.target.value;
                 onChange({ ...values, ...textFields, location: newVal || currentCity });
              }}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className={`${fieldClass} pl-9! pr-8! cursor-pointer! ${isAll ? "text-gray-400!" : ""}`}
            >
              <option value="">All of {currentCity}</option>
              {citySublocations.map(sub => (
                <option key={sub.id} value={sub.sublocation.toLowerCase()}>{sub.sublocation}</option>
              ))}
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </Section>

        <Section title="Property Type" value={typeSummary}>
          <div className="relative!">
            <select
              value={values.propertyType}
              onChange={(e) => updateFilter("propertyType", e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
              className={`${fieldClass} pl-3! pr-8! cursor-pointer!`}
            >
              {Object.entries(PROPERTY_TYPES).map(([slug, data]) => (
                <option key={slug} value={data.apiValue}>
                  {data.apiValue === "" ? "All Types" : data.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
          </div>
        </Section>

        <Section title="Price Range" value={priceSummary}>
          <div className="flex! items-center! gap-2! mb-3!">
            <div className="flex-1! relative!">
              <span className="absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400! text-xs!">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={textFields.minPrice}
                onChange={(e) => updateTextField("minPrice", e.target.value)}
                className={`${fieldClass} py-2! pl-7! pr-2! tabular-nums!`}
              />
            </div>
            <span className="text-gray-300! text-xs!">—</span>
            <div className="flex-1! relative!">
              <span className="absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400! text-xs!">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={textFields.maxPrice}
                onChange={(e) => updateTextField("maxPrice", e.target.value)}
                className={`${fieldClass} py-2! pl-7! pr-2! tabular-nums!`}
              />
            </div>
          </div>
          <div className="flex! flex-wrap! gap-1.5!">
            {presetPrices.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = { ...textFields, minPrice: preset.min, maxPrice: preset.max };
                  setTextFields(next);
                  onChange({ ...values, ...next });
                }}
                className={`px-2.5! py-1.5! rounded-lg! border! text-[11px]! font-medium! transition-all! cursor-pointer! tabular-nums! ${
                  values.minPrice === preset.min && values.maxPrice === preset.max
                    ? "bg-[#27427f]! text-white! border-[#27427f]!"
                    : "bg-white! text-gray-500! border-gray-200! hover:border-[#27427f]/40! hover:text-[#27427f]!"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Bedrooms" value={bhkSummary}>
          <div className="flex! gap-1.5!">
            {["1", "2", "3", "4", "5+"].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter("bedrooms", values.bedrooms === num ? "" : num)}
                className={`flex-1! h-9! rounded-lg! border! text-[13px]! font-medium! transition-all! cursor-pointer! tabular-nums! ${
                  values.bedrooms === num
                    ? "bg-[#27427f]! text-white! border-[#27427f]!"
                    : "bg-white! text-gray-500! border-gray-200! hover:border-[#27427f]/40! hover:text-[#27427f]!"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </Section>

        <Section title="More Filters" value={moreSummary}>
          <div className="space-y-4!">
            <div>
              <div className="text-[11px]! font-light! text-gray-500! mb-1.5!">Area (sq.ft)</div>
              <div className="flex! items-center! gap-2!">
                <input
                  type="number"
                  placeholder="Min"
                  value={textFields.minArea}
                  onChange={(e) => updateTextField("minArea", e.target.value)}
                  className={`${fieldClass} flex-1! min-w-0! py-2! px-3! tabular-nums!`}
                />
                <span className="text-gray-300! text-xs! shrink-0!">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={textFields.maxArea}
                  onChange={(e) => updateTextField("maxArea", e.target.value)}
                  className={`${fieldClass} flex-1! min-w-0! py-2! px-3! tabular-nums!`}
                />
              </div>
            </div>
            {(
              [
                { label: "Furnishing", value: values.furnishing, key: "furnishing" as const, options: [["", "Any"], ["furnished", "Furnished"], ["semi", "Semi-Furnished"], ["unfurnished", "Unfurnished"]] },
                { label: "Facing", value: values.facing, key: "facing" as const, options: [["", "Any"], ...["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map((d): [string, string] => [d, d])] },
                { label: "Property Age", value: values.propertyAge, key: "propertyAge" as const, options: [["", "Any"], ["new", "Under Construction / New"], ["1-5", "1 to 5 Years"], ["5-10", "5 to 10 Years"], ["10+", "10+ Years"]] },
              ]
            ).map((f) => (
              <div key={f.key}>
                <div className="text-[11px]! font-light! text-gray-500! mb-1.5!">{f.label}</div>
                <div className="relative!">
                  <select
                    value={f.value}
                    onChange={(e) => updateFilter(f.key, e.target.value)}
                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                    className={`${fieldClass} pl-3! pr-8! cursor-pointer!`}
                  >
                    {f.options.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute! right-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400! pointer-events-none!" />
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
