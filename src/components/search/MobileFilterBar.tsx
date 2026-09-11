"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

export interface MobileFilterBarProps {
  locationLabel: string;
  priceLabel: string;
  bedsLabel: string;
  typeLabel: string;
  activeFilterCount: number;
  onOpenDrawer: () => void;
  sort: string;
  sortOptions: { value: string; label: string }[];
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0! flex! items-center! gap-1! px-3.5! py-2! rounded-full! border! text-[13px]! transition-colors! cursor-pointer! whitespace-nowrap! ${
        active
          ? "border-[#27427f]! text-[#27427f]! font-bold! bg-white!"
          : "border-gray-200! text-gray-500! font-medium! bg-white!"
      }`}
    >
      {label}
      <ChevronDown className="w-3.5! h-3.5! text-gray-400!" />
    </button>
  );
}

export function MobileFilterBar({
  locationLabel,
  priceLabel,
  bedsLabel,
  typeLabel,
  activeFilterCount,
  onOpenDrawer,
  sort,
  sortOptions,
}: MobileFilterBarProps) {
  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? "Sort By";
  return (
    <div className="lg:hidden! sticky! top-16! z-30! bg-white! border-b! border-gray-200/80! shadow-sm!">
      <div className="flex! items-center! gap-2! pl-4! pr-4! py-2.5!">
        {/* Fixed filter button */}
        <button
          onClick={onOpenDrawer}
          aria-label="Open filters"
          className="shrink-0! relative! flex! items-center! justify-center! w-9! h-9! rounded-full! border! border-gray-200! bg-white! text-gray-600! cursor-pointer!"
        >
          <SlidersHorizontal className="w-4! h-4!" />
          {activeFilterCount > 0 && (
            <span className="absolute! -top-1! -right-1! bg-[#27427f]! text-white! text-[9px]! font-extrabold! min-w-4! h-4! px-0.5! rounded-full! flex! items-center! justify-center! leading-none!">
              {activeFilterCount}
            </span>
          )}
        </button>
        {/* Scrollable pills */}
        <div className="flex! flex-1! items-center! gap-2! overflow-x-auto! [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden!">
          <FilterChip
            label={sortLabel}
            active={sort !== ""}
            onClick={onOpenDrawer}
          />
          <FilterChip
            label={locationLabel}
            active={locationLabel !== "All Areas"}
            onClick={onOpenDrawer}
          />
          <FilterChip
            label={priceLabel}
            active={priceLabel !== "Any Price"}
            onClick={onOpenDrawer}
          />
          <FilterChip
            label={bedsLabel}
            active={bedsLabel !== "Any Beds"}
            onClick={onOpenDrawer}
          />
          <FilterChip
            label={typeLabel}
            active={typeLabel !== "All Types"}
            onClick={onOpenDrawer}
          />
        </div>
      </div>
    </div>
  );
}
