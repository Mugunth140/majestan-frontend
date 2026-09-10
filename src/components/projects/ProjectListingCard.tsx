"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, LayoutDashboard, Sparkles, Grid3X3, MapPinned, Images, Heart, Share2, Check, BadgeCheck } from "lucide-react";
import { formatINR, type ProjectListItem } from "@/lib/api/projects";

function trimNum(n: number): string {
  return String(parseFloat(n.toFixed(2)));
}

function formatCompactINR(value: number | null | undefined): string {
  if (value == null) return "Price on Request";
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "Price on Request";
  if (num >= 10000000) return `₹ ${trimNum(num / 10000000)} Cr`;
  if (num >= 100000) return `₹ ${trimNum(num / 100000)} Lakh`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

function isReraVerified(rera: string | null | undefined): boolean {
  if (typeof rera !== "string") return false;
  const t = rera.trim().toLowerCase();
  return t !== "" && t !== "not applicable" && t !== "n/a" && t !== "na" && t !== "none" && t !== "-";
}

function fmtShortDate(v: string | null | undefined): string | null {
  if (!v || !v.trim()) return null;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return null;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
  return `${String(dt.getDate()).padStart(2, "0")}-${mon}-${dt.getFullYear()}`;
}

export function ProjectListingCard({ item }: { item: ProjectListItem }) {
  const [imgOk, setImgOk] = useState(true);
  const detailPath = `/${item.canonicalSlug}`;

  const projectSections = [
    { hash: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5! h-3.5!" /> },
    { hash: "amenities", label: "Amenities", icon: <Sparkles className="w-3.5! h-3.5!" /> },
    { hash: "floor-plans", label: "Floor Plan", icon: <Grid3X3 className="w-3.5! h-3.5!" /> },
    { hash: "locality", label: "Locality", icon: <MapPinned className="w-3.5! h-3.5!" /> },
    { hash: "photos", label: "Photos", icon: <Images className="w-3.5! h-3.5!" /> },
  ];
  const showImg = Boolean(item.coverImageUrl) && imgOk;
  const [wished, setWished] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}${detailPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  const price =
    item.ranges.minPrice == null && item.ranges.maxPrice == null
      ? "Price on Request"
      : item.ranges.minPrice != null &&
        item.ranges.maxPrice != null &&
        item.ranges.minPrice !== item.ranges.maxPrice
      ? `${formatCompactINR(item.ranges.minPrice)} - ${formatCompactINR(item.ranges.maxPrice)}`
      : formatCompactINR(item.ranges.minPrice ?? item.ranges.maxPrice);

  const area =
    item.ranges.minArea != null
      ? item.ranges.minArea !== item.ranges.maxArea
        ? `${item.ranges.minArea.toLocaleString("en-IN")} – ${item.ranges.maxArea?.toLocaleString("en-IN")} sq.ft`
        : `${item.ranges.minArea.toLocaleString("en-IN")} sq.ft`
      : null;

  const possession =
    (typeof item.possessionStatus === "string" && item.possessionStatus.trim()
      ? item.possessionStatus.trim()
      : null) ?? fmtShortDate(item.possessionDate);

  const specCells: { label: string; value: React.ReactNode }[] = [];
  if (item.ranges.bhk.length > 0)
    specCells.push({ label: "BHK", value: `${item.ranges.bhk.join(", ")} BHK` });
  if (area) specCells.push({ label: "Built-Up Area", value: area });
  if (possession) specCells.push({ label: "Possession", value: possession });
  if (isReraVerified(item.reraNumber))
    specCells.push({
      label: "RERA",
      value: (
        <span className="inline-flex! items-center! gap-1! text-[#1d9bf0]!">
          <BadgeCheck className="w-3.5! h-3.5!" />
          Verified
        </span>
      ),
    });

  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-2xl! border! border-gray-200/70! shadow-sm! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! transition-all! duration-300! flex! flex-col! xl:flex-row! overflow-hidden! min-w-0! group!">

      {/* Image — clean photo, heart wishlist only */}
      <div className="relative! w-full! xl:w-[270px]! shrink-0! overflow-hidden! bg-gradient-to-br! from-[#27427f]/8! to-[#27427f]/3!">
        <Link href={detailPath} className="block! w-full! h-full!">
          <div className="aspect-[16/10]! xl:aspect-auto! xl:absolute! xl:inset-0! xl:min-h-[300px]!">
            {!showImg && (
              <div className="absolute! inset-0! flex! items-center! justify-center! text-6xl! font-bold! text-[#27427f]/15!">
                {item.name.charAt(0)}
              </div>
            )}
            {showImg && (
              <img
                src={item.coverImageUrl!}
                alt={item.name}
                onError={() => setImgOk(false)}
                className="absolute! inset-0! w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-700! ease-out!"
                loading="lazy"
              />
            )}
          </div>
        </Link>
        {/* Wishlist heart — outline only, pink on hover/wishlisted */}
        <button
          onClick={() => setWished((w) => !w)}
          aria-label="Save to wishlist"
          className="absolute! top-3! right-3! z-10! p-1.5! cursor-pointer! transition-transform! hover:scale-110!"
        >
          <Heart
            className={`w-5! h-5! drop-shadow-md! transition-colors! ${wished ? "text-pink-500! fill-pink-500!" : "text-white! fill-transparent! hover:text-pink-400! hover:fill-pink-400!"}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5! flex! flex-col! flex-1! min-w-0!">

        {/* Title + share */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <Link href={detailPath} className="no-underline!">
              <h3 className="font-['Manrope',sans-serif]! text-[17px]! font-medium! text-[#27427f]! line-clamp-1! leading-snug! hover:text-[#1a2d59]! transition-colors!">
                {item.name}
              </h3>
            </Link>
            <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-500! mt-1! min-w-0!">
              <MapPin className="w-3.5! h-3.5! text-gray-400! shrink-0!" />
              <span className="truncate!">
                {[item.sublocation, item.city].filter(Boolean).join(", ")}
              </span>
            </p>
          </div>
          <button
            onClick={handleShare}
            aria-label="Share this project"
            className="p-2! rounded-full! text-gray-400! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer! shrink-0!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
          </button>
        </div>

        {/* Spec table */}
        {specCells.length > 0 && (
          <div className="mt-4! border-y! border-dashed! border-gray-200! py-3.5! grid! grid-cols-2! sm:grid-cols-4! gap-x-3! gap-y-4!">
            {specCells.map((cell) => (
              <div key={cell.label} className="min-w-0!">
                <div className="text-[11px]! text-gray-500! font-light!">{cell.label}</div>
                <div className="text-[13px]! font-medium! text-gray-800! truncate! mt-0.5!">{cell.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3.5! text-[20px]! font-medium! text-[#27427f]! leading-none!">
          {price}
        </div>

        {/* Section links */}
        <div className="flex! flex-wrap! items-center! gap-x-5! gap-y-2! mt-3.5! pt-3.5! border-t! border-gray-100!">
          {projectSections.map((s) => (
            <Link
              key={s.hash}
              href={`${detailPath}#${s.hash}`}
              className="flex! items-center! gap-1.5! text-[12px]! font-medium! text-gray-500! hover:text-[#27427f]! transition-colors! no-underline! group/link!"
            >
              <span className="text-gray-400! group-hover/link:text-[#27427f]! transition-colors!">
                {s.icon}
              </span>
              {s.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-3.5! flex! gap-2.5!">
          <button className="flex! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-[#27427f]! bg-[#eef2f7]! hover:bg-[#dde5f0]! transition-colors! cursor-pointer!">
            <Phone className="w-4! h-4!" />
            Enquire
          </button>
          <Link
            href={detailPath}
            className="flex! flex-1! items-center! justify-center! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-white! bg-[#27427f]! hover:bg-[#1e3a6e]! transition-colors! no-underline!"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
