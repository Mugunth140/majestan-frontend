"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { CustomSelect } from "../search/CustomSelect";
import { getHomePageData, type Sublocation } from "@/lib/api";
import { useLocationContext } from "@/contexts/LocationContext";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export type ProjectFilterValues = {
  city: string;
  keyword: string;
  projectType: string;
  minPrice: string;
  maxPrice: string;
  bhk: string;
  minArea: string;
  maxArea: string;
  possession: string;
  reraVerified: string;
};

export const EMPTY_PROJECT_FILTERS: ProjectFilterValues = {
  city: "", keyword: "", projectType: "", minPrice: "", maxPrice: "", bhk: "",
  minArea: "", maxArea: "", possession: "", reraVerified: "",
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

export function ProjectFilterPanel({ values, onChange, onReset }: { values: ProjectFilterValues; onChange: (v: ProjectFilterValues) => void; onReset: () => void }) {
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

  // Only sync down on reset (all empty) to avoid loop
  useEffect(() => {
    if (!values.keyword && !values.minPrice && !values.maxPrice && !values.minArea && !values.maxArea) {
      setTextFields({ keyword: "", minPrice: "", maxPrice: "", minArea: "", maxArea: "" });
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

  const updateFilter = (key: keyof ProjectFilterValues, value: string) => {
    onChange({ ...values, ...textFields, [key]: value });
  };

  const presetPrices = [
    { label: "Under ₹50L", min: "", max: "5000000" },
    { label: "₹50L - ₹1Cr", min: "5000000", max: "10000000" },
    { label: "₹1Cr - ₹2Cr", min: "10000000", max: "20000000" },
    { label: "₹2Cr+", min: "20000000", max: "" },
  ];

  const effectiveCity = values.city || currentCity;
  const isAll = effectiveCity.toLowerCase() === currentCity.toLowerCase() || values.city === "";
  const locationSummary = isAll
    ? `All of ${currentCity}`
    : (citySublocations.find(s => s.sublocation.toLowerCase() === effectiveCity.toLowerCase())?.sublocation ?? effectiveCity);
  const typeSummary = values.projectType
    ? values.projectType.charAt(0).toUpperCase() + values.projectType.slice(1)
    : "";
  const priceSummary = values.minPrice || values.maxPrice
    ? `${values.minPrice ? `₹${Number(values.minPrice) / 100000}L` : "0"} – ${values.maxPrice ? `₹${Number(values.maxPrice) / 100000}L` : "Any"}`
    : "";
  const bhkSummary = values.bhk ? `${values.bhk} BHK` : "";
  const moreCount = [values.minArea, values.maxArea, values.possession, values.reraVerified].filter(Boolean).length;
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
            placeholder="Search projects..."
            value={textFields.keyword}
            onChange={(e) => updateTextField("keyword", e.target.value)}
            className={`${fieldClass} pl-9! pr-3!`}
          />
        </div>
      </div>

      {/* Accordion sections */}
      <div className="px-5! pb-2! border-t! border-gray-100!">

        <Section title="Location" value={locationSummary} defaultOpen>
          <CustomSelect
            value={isAll ? "" : (citySublocations.find(s => s.sublocation.toLowerCase() === effectiveCity.toLowerCase())?.sublocation ?? effectiveCity)}
            options={[
              { value: "", label: `All of ${currentCity}` },
              ...citySublocations.map((sub) => ({
                value: sub.sublocation,
                label: sub.sublocation,
              })),
            ]}
            onChange={(newVal) => {
              onChange({ ...values, ...textFields, city: newVal || currentCity });
            }}
            ariaLabel="Location"
            leadingIcon={<MapPin className="w-4! h-4! text-gray-400!" />}
            buttonClassName={isAll ? "text-gray-400!" : ""}
          />
        </Section>

        <Section title="Project Type" value={typeSummary}>
          <CustomSelect
            value={values.projectType}
            options={[
              { value: "", label: "All Types" },
              { value: "apartment", label: "Apartment" },
              { value: "villa", label: "Villa" },
              { value: "plot", label: "Plot" },
            ]}
            onChange={(v) => updateFilter("projectType", v)}
            ariaLabel="Project Type"
          />
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
            {["1", "2", "3", "4", "5"].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter("bhk", values.bhk === num ? "" : num)}
                className={`flex-1! h-9! rounded-lg! border! text-[13px]! font-medium! transition-all! cursor-pointer! tabular-nums! ${
                  values.bhk === num
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
            <div>
              <div className="text-[11px]! font-light! text-gray-500! mb-1.5!">Possession</div>
              <CustomSelect
                value={values.possession}
                options={[
                  { value: "", label: "Any" },
                  { value: "ready_to_move", label: "Ready to Move" },
                  { value: "under_construction", label: "Under Construction" },
                  { value: "new_launch", label: "New Launch" },
                ]}
                onChange={(v) => updateFilter("possession", v)}
                ariaLabel="Possession"
              />
            </div>
            <div>
              <div className="text-[11px]! font-light! text-gray-500! mb-1.5!">RERA</div>
              <CustomSelect
                value={values.reraVerified}
                options={[
                  { value: "", label: "Any" },
                  { value: "1", label: "RERA Verified Only" },
                ]}
                onChange={(v) => updateFilter("reraVerified", v)}
                ariaLabel="RERA"
              />
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
