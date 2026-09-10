"use client";

import { SlidersHorizontal } from "lucide-react";

export interface MobileFilterBarProps {
  locationLabel: string;
  priceLabel: string;
  bedsLabel: string;
  typeLabel: string;
  activeFilterCount: number;
  onOpenDrawer: () => void;
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
      className={`shrink-0! flex! items-center! gap-1! px-3! py-1.5! rounded-full! border! text-sm! font-medium! transition-colors! cursor-pointer! whitespace-nowrap! ${
        active
          ? "border-[#27427f]! text-[#27427f]! bg-[#27427f]/5!"
          : "border-gray-200! text-gray-600! bg-white! hover:border-[#27427f]/50!"
      }`}
    >
      {label}
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
}: MobileFilterBarProps) {
  return (
    <div className="xl:hidden! sticky! top-[64px]! z-30! bg-white! border-b! border-gray-200/80! shadow-sm!">
      <div className="flex! items-center! gap-2! px-4! py-2.5! overflow-x-auto! [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden!">
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
        {/* Filters button — always last */}
        <button
          onClick={onOpenDrawer}
          className="shrink-0! ml-auto! flex! items-center! gap-1.5! px-3.5! py-1.5! rounded-full! bg-[#27427f]! text-white! text-sm! font-bold! cursor-pointer! whitespace-nowrap!"
        >
          <SlidersHorizontal className="w-3.5! h-3.5!" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5! bg-white! text-[#27427f]! text-[10px]! font-extrabold! w-4! h-4! rounded-full! flex! items-center! justify-center! leading-none!">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
