"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export type ProjectFilterValues = {
  city: string;
  keyword: string;
  projectType: string;
  minPrice: string;
  maxPrice: string;
  bhk: string;
};

export const EMPTY_PROJECT_FILTERS: ProjectFilterValues = {
  city: "", keyword: "", projectType: "", minPrice: "", maxPrice: "", bhk: "",
};

const PRICE_PRESETS = [
  { label: "Under ₹50L", min: "", max: "5000000" },
  { label: "₹50L - ₹1Cr", min: "5000000", max: "10000000" },
  { label: "₹1Cr - ₹2Cr", min: "10000000", max: "20000000" },
  { label: "₹2Cr+", min: "20000000", max: "" },
];

const inputCls = "w-full! bg-gray-50! border! border-gray-200! rounded-lg! py-2.5! pl-9! pr-3! text-sm! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! placeholder:text-gray-400!";
const labelCls = "block! text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-1.5!";
const toggleCls = (on: boolean) =>
  `px-4! py-2! rounded-lg! text-sm! font-bold! border! transition-all! cursor-pointer! ${on ? "bg-[#27427f]! text-white! border-[#27427f]!" : "bg-gray-50! text-gray-600! border-gray-200! hover:border-[#27427f]!"}`;

export function ProjectFilterPanel({ values, onChange, onReset }: { values: ProjectFilterValues; onChange: (v: ProjectFilterValues) => void; onReset: () => void }) {
  const [text, setText] = useState({ keyword: values.keyword });
  useEffect(() => setText({ keyword: values.keyword }), [values.keyword]);
  const debounced = useDebouncedValue(text, 500);
  useEffect(() => {
    if (debounced.keyword !== values.keyword) onChange({ ...values, ...debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const set = (patch: Partial<ProjectFilterValues>) => onChange({ ...values, keyword: text.keyword, ...patch });

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-200/60! shadow-sm! w-full!">
      <div className="px-5! py-4! border-b! border-gray-100! flex! items-center! justify-between!">
        <h3 className="font-['Lexend',sans-serif]! text-base! font-bold! text-gray-900! flex! items-center! gap-2!">
          <SlidersHorizontal className="w-4! h-4! text-[#27427f]!" />
          Filters
        </h3>
        <button onClick={onReset} className="text-xs! font-bold! text-[#27427f]! hover:text-[#1d3261]! transition-colors! uppercase! tracking-wider! cursor-pointer!">
          Reset All
        </button>
      </div>
      <div className="p-5! space-y-5!">
        <div>
          <label className={labelCls}>Keyword</label>
          <div className="relative!">
            <Search className="absolute! left-3! top-1/2! -translate-y-1/2! w-4! h-4! text-gray-400!" />
            <input type="text" placeholder="Search projects..." value={text.keyword} onChange={(e) => setText((p) => ({ ...p, keyword: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Project Type</label>
          <div className="flex! gap-2!">
            {[ "", "apartment", "villa" ].map((t) => (
              <button key={t || "all"} onClick={() => set({ projectType: t })} className={toggleCls(values.projectType === t)}>
                {t === "" ? "All" : t === "apartment" ? "Apartment" : "Villa"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Price</label>
          <div className="flex! flex-wrap! gap-2!">
            {PRICE_PRESETS.map((p) => {
              const on = values.minPrice === p.min && values.maxPrice === p.max;
              return <button key={p.label} onClick={() => set(on ? { minPrice: "", maxPrice: "" } : { minPrice: p.min, maxPrice: p.max })} className={toggleCls(on)}>{p.label}</button>;
            })}
          </div>
        </div>
        <div>
          <label className={labelCls}>BHK</label>
          <div className="flex! flex-wrap! gap-2!">
            {["1", "2", "3", "4", "5"].map((b) => (
              <button key={b} onClick={() => set({ bhk: values.bhk === b ? "" : b })} className={toggleCls(values.bhk === b)}>{b} BHK</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
