"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Layers, Ruler, BedDouble, Phone } from "lucide-react";
import { formatINR, type ProjectListItem } from "@/lib/api/projects";

function formatCompactINR(value: number | null | undefined): string {
  if (value == null) return "Price on Request";
  return formatINR(value)
    .replace(/\.00(?= [A-Z])/, "")
    .replace(/(\.\d)0(?= [A-Z])/, "$1");
}

export function ProjectListingCard({ item }: { item: ProjectListItem }) {
  const [imgOk, setImgOk] = useState(true);
  const detailPath = `/${item.canonicalSlug}`;
  const showImg = Boolean(item.coverImageUrl) && imgOk;

  const typeLabel =
    item.projectType === "villa" ? "Villa Project" : "Apartment Project";

  const price =
    item.ranges.minPrice == null && item.ranges.maxPrice == null
      ? "Price on Request"
      : item.ranges.minPrice != null &&
        item.ranges.maxPrice != null &&
        item.ranges.minPrice !== item.ranges.maxPrice
      ? `${formatCompactINR(item.ranges.minPrice)} – ${formatCompactINR(item.ranges.maxPrice)}`
      : formatCompactINR(item.ranges.minPrice ?? item.ranges.maxPrice);

  const area =
    item.ranges.minArea != null
      ? item.ranges.minArea !== item.ranges.maxArea
        ? `${item.ranges.minArea.toLocaleString("en-IN")} – ${item.ranges.maxArea?.toLocaleString("en-IN")} sq.ft`
        : `${item.ranges.minArea.toLocaleString("en-IN")} sq.ft`
      : null;

  return (
    <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! hover:shadow-md! transition-shadow! duration-200! flex! flex-col! xl:flex-row! overflow-hidden! min-w-0!">

      {/* Image */}
      <Link
        href={detailPath}
        className="relative! block! w-full! xl:w-[280px]! shrink-0! overflow-hidden! bg-gradient-to-br! from-[#27427f]/8! to-[#27427f]/3!"
      >
        <div className="aspect-[16/9]! xl:aspect-auto! xl:h-full! xl:min-h-[240px]! w-full! relative!">
          {!showImg && (
            <div className="absolute! inset-0! flex! items-center! justify-center! font-['Lexend',sans-serif]! text-6xl! font-bold! text-[#27427f]/15!">
              {item.name.charAt(0)}
            </div>
          )}
          {showImg && (
            <img
              src={item.coverImageUrl!}
              alt={item.name}
              onError={() => setImgOk(false)}
              className="absolute! inset-0! w-full! h-full! object-cover!"
              loading="lazy"
            />
          )}
        </div>
        <div className="absolute! top-3! left-3! flex! gap-1.5!">
          <span className="px-2.5! py-1! bg-white/95! backdrop-blur-sm! text-[#27427f]! text-[11px]! font-extrabold! rounded-lg! shadow-sm! uppercase! tracking-wider!">
            {typeLabel}
          </span>
          {item.projectCode && (
            <span className="px-2.5! py-1! bg-[#27427f]/90! text-white! text-[11px]! font-mono! font-bold! rounded-lg! shadow-sm! tracking-wider!">
              {item.projectCode}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5! flex! flex-col! gap-2.5! flex-1! min-w-0!">

        {/* Title + location */}
        <div className="min-w-0!">
          <Link href={detailPath} className="no-underline!">
            <h3 className="font-['Lexend',sans-serif]! text-[17px]! font-bold! text-gray-900! line-clamp-2! leading-snug! hover:text-[#27427f]! transition-colors!">
              {item.name}
            </h3>
          </Link>
          <p className="flex! items-center! gap-1.5! text-sm! text-gray-500! mt-1! min-w-0!">
            <MapPin className="w-3.5! h-3.5! shrink-0! text-gray-400!" />
            <span className="truncate!">
              {[item.sublocation, item.city].filter(Boolean).join(", ")}
            </span>
          </p>
        </div>

        {/* Price */}
        <div>
          <div className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-[#27427f]! leading-none!">
            {price}
          </div>
        </div>

        {/* Specs */}
        <div className="flex! flex-wrap! items-center! gap-x-4! gap-y-1.5! pt-1!">
          {item.ranges.unitsCount > 0 && (
            <span className="flex! items-center! gap-1.5! text-sm! font-medium! text-gray-600!">
              <Layers className="w-3.5! h-3.5! text-[#27427f]/50! shrink-0!" />
              {item.ranges.unitsCount} Units
            </span>
          )}
          {item.ranges.bhk.length > 0 && (
            <span className="flex! items-center! gap-1.5! text-sm! font-medium! text-gray-600!">
              <BedDouble className="w-3.5! h-3.5! text-[#27427f]/50! shrink-0!" />
              {item.ranges.bhk.map((b) => `${b} BHK`).join(" · ")}
            </span>
          )}
          {area && (
            <span className="flex! items-center! gap-1.5! text-sm! font-medium! text-gray-600!">
              <Ruler className="w-3.5! h-3.5! text-[#27427f]/50! shrink-0!" />
              {area}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto! pt-3! border-t! border-gray-100! flex! items-center! gap-2.5!">
          <button className="flex! items-center! gap-2! px-4! py-2! rounded-lg! text-sm! font-bold! text-[#27427f]! border! border-[#27427f]/30! hover:bg-[#27427f]/5! transition-colors! cursor-pointer! whitespace-nowrap!">
            <Phone className="w-3.5! h-3.5!" />
            Enquire
          </button>
          <Link
            href={detailPath}
            className="flex! items-center! justify-center! px-5! py-2! rounded-lg! text-sm! font-bold! text-white! bg-[#27427f]! hover:bg-[#1a2d59]! transition-colors! no-underline! whitespace-nowrap!"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
