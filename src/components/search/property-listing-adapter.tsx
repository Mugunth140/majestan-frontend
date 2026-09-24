"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, X, Phone, Sparkles, Grid3X3, MapPinned, Images, Share2, Check, BadgeCheck, Sprout } from "lucide-react";
import { searchProperties, type PropertySearchItem } from "@/lib/api";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import {
  PROPERTY_TYPES,
  buildPseoSlug,
  BEDROOM_PROPERTY_TYPE_SLUGS,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";
import { PropertySearchFilters, type FilterValues } from "./PropertySearchFilters";
import type { ListingAdapter } from "./listing-adapter";

const PROPERTY_DETAIL_SUFFIX: Record<string, string> = {
  apartment:          "ap",
  villa:              "v",
  individual_portion: "ip",
  "independent-house":"ip",
  plot:               "p",
  farmland:           "fl",
  commercial:         "cs",
  "commercial-space": "cs",
  industrial:         "in",
  "industrial-space": "in",
  coworking:          "cw",
};

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "low_to_high", label: "Price: Low to High" },
  { value: "high_to_low", label: "Price: High to Low" },
  { value: "Area_low_to_high", label: "Area: Small to Large" },
  { value: "Area_high_to_low", label: "Area: Large to Small" },
];

function getDetailPath(item: PropertySearchItem & { canonicalSlug?: string }): string {
  if (item.canonicalSlug) return `/${item.canonicalSlug}`;

  const slug = item.slug_url?.trim() || (typeof item.slug === "string" ? item.slug.trim() : "");

  if (slug) return `/${slug}`;

  // Fallback if no slug
  const suffix = PROPERTY_DETAIL_SUFFIX[item.propertyType] ?? "ap";
  return `/${item.propertyType}-${item.id}-${suffix}${item.id}`;
}

function getPhotoUrl(item: any): string | null {
  // The legacy noproperty.* asset is an error-state illustration ("didn't go
  // as planned") — never render it as a listing photo. Treat it as missing
  // so cards fall back cleanly. Prefers the primary image, then the first
  // usable one, so one poisoned entry doesn't hide real photos.
  const isUsable = (url: unknown): url is string => {
    if (typeof url !== "string") return false;
    const t = url.trim();
    return t !== "" && !/noproperty\.(png|webp)$/i.test(t);
  };
  const pickFrom = (images: any[]): string | null => {
    const ordered = [...images].sort(
      (a: any, b: any) => Number(b?.isPrimary ?? false) - Number(a?.isPrimary ?? false),
    );
    for (const img of ordered) {
      if (isUsable(img?.imageUrl)) return (img.imageUrl as string).trim();
    }
    return null;
  };
  // Support new unified schema
  if (item.images && item.images.length > 0) {
    const found = pickFrom(item.images);
    if (found) return found;
  }
  if (item.propertyImages && item.propertyImages.length > 0) {
    const found = pickFrom(item.propertyImages);
    if (found) return found;
  }

  // Support legacy
  const photo = item.photo1;
  if (!isUsable(photo)) return null;
  return photo.trim();
}

function nzNum(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return !isNaN(n) && n > 0 ? n : null;
}

function fmtArea(v: unknown): string | null {
  const n = nzNum(v);
  return n == null ? null : `${n.toLocaleString("en-IN")} sq.ft`;
}

function getDetails(item: PropertySearchItem): Record<string, any> {
  const raw = (item as any).__propertyDetails__ ?? (item as any).propertyDetails ?? (item as any).details ?? {};
  return typeof raw === "object" && raw !== null ? raw : {};
}

function getArea(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return (
    fmtArea(d.carpetArea) ??
    fmtArea(d.superBuiltUpArea) ??
    fmtArea(d.areaSqft) ??
    fmtArea((item as any).sq_ft) ??
    fmtArea((item as any).build_up_area) ??
    fmtArea((item as any).buildup_area) ??
    (nzNum((item as any).cents) != null ? `${(item as any).cents} cents` : null) ??
    (nzNum((item as any).acres) != null ? `${(item as any).acres} acres` : null)
  );
}

function getFacing(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return d.propertyFacing ?? item.facing ?? item.facing_direction ?? null;
}

function getFurnishing(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (d.furnished === true) return "Furnished";
  if (typeof d.furnishing_status === "string" && d.furnishing_status) return d.furnishing_status;
  return (item as any).furnishing_status ?? null;
}

function getFloor(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (d.floorNumber == null || String(d.floorNumber).trim() === "") return null;
  return d.totalFloors ? `${d.floorNumber} of ${d.totalFloors}` : `${d.floorNumber}`;
}

function getAge(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  return d.propertyAge ?? (item as any).property_age ?? (item as any).ageofproperty ?? (item as any).age_of_property ?? null;
}

// Pricing-row ribbon: only the canonical condition vocabulary gets a badge;
// anything else stays unlabeled rather than printing junk on the card.
function getConditionBadge(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  const raw =
    trimStr(d.propertyCondition) ??
    trimStr((item as any).propertyCondition) ??
    trimStr((item as any).property_condition);
  if (!raw) return null;
  const low = raw.toLowerCase();
  if (low === "resale" || low === "new" || low === "under construction") return raw.toUpperCase();
  return null;
}

function getParking(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  const n = nzNum(d.parking);
  if (n != null) return `${n}`;
  if (d.guestParking) return "Guest Parking";
  return null;
}

function fmtShortDate(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return null;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
  return `${String(dt.getDate()).padStart(2, "0")}-${mon}-${dt.getFullYear()}`;
}

function getTypeLabel(item: PropertySearchItem): string | null {
  const raw = Object.values(PROPERTY_TYPES).find((p) => p.apiValue === item.propertyType)?.label
    ?? (typeof item.propertyType === "string" ? item.propertyType : "");
  const pretty = raw.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (!pretty) return null;
  const titled = pretty.charAt(0).toUpperCase() + pretty.slice(1);
  return titled.length > 3 && titled.endsWith("s") ? titled.slice(0, -1) : titled;
}

function getAreaCell(item: PropertySearchItem): { label: string; value: string } | null {
  const d = getDetails(item);
  if (item.propertyType === "plot") {
    if (nzNum(d.plotArea) != null) return { label: "Plot Area", value: fmtArea(d.plotArea)! };
    const cents = fmtTrimmedNum(d.plotSizeCents);
    if (cents != null) return { label: "Plot Area", value: `${cents} cents` };
  }
  if (item.propertyType === "farmland") {
    // Farm Area is always quoted in cents, never sq.ft. plotSizeCents is
    // authoritative; otherwise Total Plot Area carries the cent figure
    // (Acres honored when explicitly chosen as the area unit).
    const cents = fmtTrimmedNum(d.plotSizeCents);
    if (cents != null) return { label: "Farm Area", value: `${cents} cents` };
    if (nzNum(d.plotArea) != null) {
      if (/acre/i.test(String(d.areaUnit ?? ""))) return { label: "Farm Area", value: `${fmtTrimmedNum(d.plotArea)} acres` };
      return { label: "Farm Area", value: `${fmtTrimmedNum(d.plotArea)} cents` };
    }
  }
  if (nzNum(d.superBuiltUpArea) != null) return { label: "Built-Up Area", value: fmtArea(d.superBuiltUpArea)! };
  if (nzNum(d.areaSqft) != null) return { label: "Built-Up Area", value: fmtArea(d.areaSqft)! };
  if (nzNum(d.carpetArea) != null) return { label: "Carpet Area", value: fmtArea(d.carpetArea)! };
  if (nzNum((item as any).cents) != null) return { label: "Plot Area", value: `${(item as any).cents} cents` };
  if (nzNum((item as any).acres) != null) return { label: "Plot Area", value: `${(item as any).acres} acres` };
  return null;
}

function getPossession(item: PropertySearchItem): string | null {
  const d = getDetails(item);
  if (typeof d.possessionStatus === "string" && d.possessionStatus.trim()) return d.possessionStatus.trim();
  return fmtShortDate((item as any).availableFrom);
}

function trimNum(n: number): string {
  return String(parseFloat(n.toFixed(2)));
}

// Display a DB decimal without trailing zeros: "4.0000" → "4", "3.50" → "3.5".
function fmtTrimmedNum(v: unknown): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const n = parseFloat(String(v));
  if (isNaN(n)) return null;
  return String(n);
}

function trimStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

// Plot dimensions: explicit "Dimension" field first, else L × W from the
// plotLength / plotWidth numbers (stored unit-less, captured in feet).
function getLandDimension(d: Record<string, any>): string | null {
  const direct = trimStr(d.dimension);
  if (direct) return direct;
  const len = nzNum(d.plotLength);
  const wid = nzNum(d.plotWidth);
  if (len != null && wid != null) return `${trimNum(len)} × ${trimNum(wid)} ft`;
  return null;
}

function formatPrice(value: string | number | undefined | null): string {
  if (!value) return "Price on Request";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num === 0) return "Price on Request";
  if (num >= 10000000) return `₹ ${trimNum(num / 10000000)} Cr`;
  if (num >= 100000) return `₹ ${trimNum(num / 100000)} Lakh`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

function isReraVerified(item: PropertySearchItem): boolean {
  const v = (item as any).reraNumber;
  if (typeof v !== "string") return false;
  const t = v.trim().toLowerCase();
  return t !== "" && t !== "not applicable" && t !== "n/a" && t !== "na" && t !== "none" && t !== "-";
}

function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function getLocationLabel(item: PropertySearchItem): string {
  const sub = capFirst((item.sublocation || "").trim());
  const city = ((item as any).city || "").trim();
  if (sub && city && sub.toLowerCase() !== city.toLowerCase()) return `${sub}, ${city}`;
  return sub || city || item.address || "";
}

function getPricePerSqft(item: PropertySearchItem, priceDisplay: string): string | null {
  if (priceDisplay.includes("-")) return null;
  const rawPrice = item.posttype === "Sell" ? (item as any).expectedsaleprice : (item as any).monthly_rent;
  const price = nzNum(rawPrice);
  if (price == null) return null;
  const d = getDetails(item);
  if (item.propertyType === "plot" || item.propertyType === "farmland") {
    // Land is priced per cent, never per sqft. plotSizeCents is authoritative;
    // areaSqft counts only when explicitly stored in cents.
    const cents =
      nzNum(d.plotSizeCents) ??
      (/cent/i.test(String(d.areaUnit ?? "")) ? nzNum(d.areaSqft) : null);
    if (cents == null) return null;
    return `₹ ${Math.round(price / cents).toLocaleString("en-IN")}/cent`;
  }
  const area = nzNum(d.superBuiltUpArea) ?? nzNum(d.areaSqft) ?? nzNum(d.carpetArea);
  if (area == null) return null;
  return `₹ ${Math.round(price / area).toLocaleString("en-IN")}/sqft`;
}

function PropertyListingCard({ item }: { item: PropertySearchItem }) {
  const router = useRouter();
  const detailPath = getDetailPath(item);
  const photosPath = `${detailPath}/photos`;
  const facing = getFacing(item);
  const possession = getPossession(item);
  const locationLabel = getLocationLabel(item);
  const areaCell = getAreaCell(item);
  const reraVerified = isReraVerified(item);

  const sectionLinks = [
    { href: `${detailPath}/amenities`, label: "Amenities", icon: <Sparkles className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/floor-plan`, label: "Floor Plan", icon: <Grid3X3 className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/locality`, label: "Locality", icon: <MapPinned className="w-3.5! h-3.5!" /> },
    { href: `${detailPath}/photos`, label: "Photos", icon: <Images className="w-3.5! h-3.5!" /> },
  ];

  // Land has no building and captures no amenity tags — Floor Plan and
  // Amenities links would only ever lead to empty sections.

  const priceDisplay = (() => {
    if ((item as any).isProject && (item as any).ranges && (item as any).ranges.unitsCount >= 2) {
      const min = (item as any).ranges.minPrice;
      const max = (item as any).ranges.maxPrice;
      if (min != null && max != null && min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
      if (min != null) return formatPrice(min);
    } else if (item.units && item.units.length >= 2) {
      const prices = item.units.map((u) => Number(u.price)).filter((p) => !isNaN(p) && p > 0);
      if (prices.length >= 2) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
      }
    }
    return formatPrice(item.posttype === "Sell" ? item.expectedsaleprice : item.monthly_rent);
  })();

  const unitSpec = (() => {
    if ((item as any).isProject && (item as any).ranges?.unitsCount >= 2) {
      const ranges = (item as any).ranges;
      if (ranges.bhk?.length > 0) return `${ranges.bhk.join(", ")} BHK`;
      return `${ranges.unitsCount} Plans`;
    }
    if (item.units && item.units.length >= 2) return `${item.units.length} Plans`;
    if (item.unittype) return item.unittype;
    return null;
  })();

  const [copied, setCopied] = useState(false);

  // Land parcels often have no building photos — and the legacy
  // noproperty.* asset reads as an error state. Photo-less plot/farmland
  // cards render a designed placeholder instead; other types keep the
  // previous apartment fallback untouched.
  const isLandCard = item.propertyType === "plot" || item.propertyType === "farmland";
  const [imgOk, setImgOk] = useState(true);
  const photoUrl = getPhotoUrl(item);
  const showLandPlaceholder = isLandCard && (!photoUrl || !imgOk);
  const visibleLinks = isLandCard
    ? sectionLinks.filter((link) => link.label !== "Floor Plan" && link.label !== "Amenities")
    : sectionLinks;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${detailPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.propertyname, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  const specCells: { label: string; value: React.ReactNode }[] = [];
  const d = getDetails(item);

  if (item.propertyType === "plot") {
    // Plot buyers decide on size, orientation, dimensions, type and legal
    // clarity — plus boundary/open-sides which signal development readiness.
    if (areaCell) specCells.push({ label: areaCell.label, value: areaCell.value });
    if (facing) specCells.push({ label: "Facing", value: facing });
    const dimension = getLandDimension(d);
    if (dimension) specCells.push({ label: "Dimension", value: dimension });
    const plotType = trimStr(d.plotType);
    if (plotType) specCells.push({ label: "Plot Type", value: plotType });
    const zoning = trimStr(d.zoning);
    if (zoning) specCells.push({ label: "Zoning", value: zoning });
    else if (d.approvals) specCells.push({ label: "Approvals", value: d.approvals });
    else if (possession) specCells.push({ label: "Possession", value: possession });
    if (d.boundaryWall) specCells.push({ label: "Boundary Wall", value: "Yes" });
    else {
      const openSides = nzNum(d.openSides);
      if (openSides != null) specCells.push({ label: "Open Sides", value: String(openSides) });
    }
  } else if (item.propertyType === "farmland") {
    // Farmland carries richer agronomy data: soil, water and crop suitability
    // take precedence; facing is the fallback when crop data is absent.
    if (areaCell) specCells.push({ label: areaCell.label, value: areaCell.value });
    const water = trimStr(d.waterSources) ?? trimStr(d.irrigation);
    if (water) specCells.push({ label: trimStr(d.waterSources) ? "Water Sources" : "Irrigation", value: water });
    const crop = trimStr(d.cropSuitability);
    if (crop) specCells.push({ label: "Crop Suitability", value: crop });
    else if (facing) specCells.push({ label: "Facing", value: facing });
    if (d.boundaryWall) specCells.push({ label: "Fencing", value: "Yes" });
    const age = getAge(item);
    if (age) specCells.push({ label: "Property Age", value: age });
  } else {
    if (unitSpec) specCells.push({ label: "BHK", value: unitSpec });
    if (areaCell) specCells.push({ label: areaCell.label, value: areaCell.value });
    if (facing) specCells.push({ label: "Facing", value: facing });
    if (possession) specCells.push({ label: "Possession", value: possession });
  }

  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-2xl! border! border-gray-200/70! shadow-sm! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! transition-all! duration-300! flex! flex-col! lg:flex-row! overflow-hidden! min-w-0! group!">

      {/* Image — full-width square on mobile/tablet; on desktop a fixed
          300px-wide column that stretches to the content height, so the card
          hugs the content with no leftover top/bottom whitespace. */}
      <div className="relative! w-full! aspect-square! lg:aspect-auto! lg:w-[300px]! lg:h-auto! lg:self-stretch! lg:min-h-[240px]! shrink-0! overflow-hidden! bg-gray-100!">
        {showLandPlaceholder ? (
          <div className="absolute! inset-0! flex! flex-col! items-center! justify-center! gap-2.5! bg-gradient-to-br! from-[#eef2f7]! via-[#e6ecf5]! to-[#d8e1ef]!">
            <span className="flex! h-14! w-14! items-center! justify-center! rounded-2xl! bg-white! shadow-sm!">
              {item.propertyType === "farmland" ? (
                <Sprout className="w-7! h-7! text-emerald-600!" />
              ) : (
                <MapPinned className="w-7! h-7! text-[#27427f]!" />
              )}
            </span>
            <span className="text-[12px]! font-semibold! text-[#27427f]/70!">
              {item.propertyType === "farmland" ? "Farm photos coming soon" : "Plot photos coming soon"}
            </span>
          </div>
        ) : (
          <Link href={photosPath} aria-label={`View photos of ${item.propertyname || "property"}`} className="absolute! inset-0!">
            <img
              src={photoUrl ?? "/assets/images/home/apartment-buy.png"}
              alt={item.propertyname || "Property"}
              className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-700! ease-out!"
              loading="lazy"
              onError={() => setImgOk(false)}
            />
          </Link>
        )}
        {/* RERA verified badge — top-right over image */}
        {reraVerified && (
          <span className="absolute! top-3! right-3! z-10! inline-flex! items-center! gap-1! bg-white/90! backdrop-blur-sm! text-[#1d9bf0]! text-[10px]! font-bold! px-2! py-1! rounded-lg! shadow-sm!">
          <BadgeCheck className="w-3.5! h-3.5! fill-blue-400! text-white! stroke-1.5!"/>
            RERA
          </span>
        )}
      </div>

      {/* Content — clicking anywhere here goes to the overview page.
          Interactive children (wishlist/share/links/actions) stop propagation. */}
      <div
        className="px-5! py-3! flex! flex-col! flex-1! min-w-0! justify-center! cursor-pointer!"
        onClick={() => router.push(detailPath)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "A" && (e.target as HTMLElement).tagName !== "BUTTON") {
            router.push(detailPath);
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View details of ${item.propertyname || "property"}`}
      >

        {/* Title + share */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <Link href={detailPath} onClick={(e) => e.stopPropagation()} className="no-underline!">
              <h3 className="font-['Manrope',sans-serif]! text-[17px]! font-semibold! text-[#27427f]! line-clamp-1! leading-snug! hover:text-[#1a2d59]! transition-colors!">
                {item.propertyname}
              </h3>
            </Link>
            <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-600! min-w-0!">
              <MapPin className="w-3.5! h-3.5! text-gray-500! shrink-0!" />
              <span className="truncate!">{locationLabel}</span>
            </p>
          </div>
          <WishlistButton propertyId={item.id} propertyType={item.propertyType} />
          <button
            onClick={handleShare}
            aria-label="Share this property"
            className="p-2! rounded-full! text-gray-400! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer! shrink-0!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
          </button>
        </div>

        {/* Price — dotted divider above, directly under title/location for prominence */}
        <div className="mt-3! border-t! border-dashed! border-gray-200! pt-3! flex! items-end! gap-3! leading-none!">
          <span className="text-[22px]! font-semibold! text-[#27427f]!">{priceDisplay}</span>
          {(() => {
            const perSqft = getPricePerSqft(item, priceDisplay);
            return perSqft ? (
              <span className="text-[13px]! font-medium! text-gray-700!">{perSqft}</span>
            ) : null;
          })()}
          {(() => {
            // Condition ribbon pinned to the end of the pricing row.
            const badge = getConditionBadge(item);
            return badge ? (
              <span
                className="ml-auto! shrink-0! bg-gray-200! text-gray-600! text-[11px]! font-bold! tracking-wider! pl-3.5! pr-2.5! py-1.5! leading-none!"
                style={{ clipPath: "polygon(9px 0, 100% 0, 100% 100%, 9px 100%, 0 50%)" }}
              >
                {badge}
              </span>
            ) : null;
          })()}
        </div>

        {/* Spec table */}
        {specCells.length > 0 && (
          <div className="mt-3! border-y! border-dashed! border-gray-200! py-3! grid! grid-cols-2! sm:grid-cols-4! gap-x-3! gap-y-4!">
            {specCells.map((cell) => (
              <div key={cell.label} className="min-w-0!">
                <div className="text-[11px]! text-gray-500! font-normal!">{cell.label}</div>
                <div className="text-[13px]! font-medium! text-gray-800! truncate! mt-0.5!">{cell.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Section links — separated by the spec table's bottom dotted line */}
        <div
          className="flex! flex-wrap! items-center! justify-center! gap-x-7! gap-y-2! mt-3!"
          onClick={(e) => e.stopPropagation()}
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex! items-center! gap-1.5! text-[12px]! font-medium! text-gray-500! hover:text-[#27427f]! transition-colors! no-underline! group/link!"
            >
              <span className="text-gray-400! group-hover/link:text-[#27427f]! transition-colors!">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div
          className="mt-3! flex! flex-col! sm:flex-row! gap-2.5!"
          onClick={(e) => e.stopPropagation()}
        >
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

export function createPropertyAdapter(init: {
  initialListingType: "Sell" | "Rent";
  initialPropertyType: string;
  initialCity: string;
  initialLocality?: string;
  initialBedrooms?: number;
}): ListingAdapter<FilterValues, PropertySearchItem> {
  const resetFilters: FilterValues = {
    keyword: "", propertyType: init.initialPropertyType, listingType: init.initialListingType, location: init.initialCity,
    minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "", furnishing: "", propertyAge: ""
  };

  return {
    limit: 12,
    sortOptions: SORT_OPTIONS,
    resetFilters,

    fetchItems: async ({ filters, sort, page }) => {
      // Property listings show properties only. Projects live exclusively
      // on the /projects listing page (createProjectAdapter).
      return searchProperties({
        listingType: filters.listingType,
        propertyType: filters.propertyType,
        location: filters.location,
        propertyName: filters.keyword,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        bedrooms: filters.bedrooms,
        facing: filters.facing,
        furnishing: filters.furnishing,
        propertyAge: filters.propertyAge,
        sort,
        page,
        limit: 12,
      });
    },

    getItemKey: (item) => item.id,

    renderCard: (item) => <PropertyListingCard key={item.id} item={item} />,

    renderFilters: ({ values, onChange, onReset }) => (
      <PropertySearchFilters
        values={values}
        onChange={onChange}
        onReset={onReset}
      />
    ),

    renderActiveChips: (filters, onChange) => {
      const FURNISHING_LABELS: Record<string, string> = { furnished: "Furnished", semi: "Semi-Furnished", unfurnished: "Unfurnished" };
      const AGE_LABELS: Record<string, string> = { new: "New", "1-5": "1–5 Years", "5-10": "5–10 Years", "10+": "10+ Years" };
      if (!(filters.keyword || filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea || filters.bedrooms || filters.facing || filters.furnishing || filters.propertyAge)) return null;
      return (
        <div className="bg-white! rounded-2xl! shadow-sm! border! border-gray-200/60! p-5!">
          <h3 className="text-[11px]! font-bold! text-gray-500! uppercase! tracking-wider! mb-2!">Active Filters</h3>
          <div className="flex! flex-wrap! gap-1.5!">
            {filters.keyword && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                &ldquo;{filters.keyword}&rdquo;
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, keyword: ""})} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Price: {filters.minPrice ? `₹${Number(filters.minPrice)/100000}L+` : '0'} to {filters.maxPrice ? `₹${Number(filters.maxPrice)/100000}L` : 'Any'}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, minPrice: "", maxPrice: ""})} />
              </span>
            )}
            {(filters.minArea || filters.maxArea) && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Area: {filters.minArea || "0"} to {filters.maxArea || "Any"} sq.ft
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, minArea: "", maxArea: ""})} />
              </span>
            )}
            {filters.bedrooms && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {filters.bedrooms} BHK
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, bedrooms: ""})} />
              </span>
            )}
            {filters.facing && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Facing: {filters.facing}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, facing: ""})} />
              </span>
            )}
            {filters.furnishing && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                {FURNISHING_LABELS[filters.furnishing] ?? filters.furnishing}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, furnishing: ""})} />
              </span>
            )}
            {filters.propertyAge && (
              <span className="inline-flex! items-center! gap-1.5! bg-[#27427f]/10! text-[#27427f]! px-2.5! py-1! rounded-md! text-xs! font-bold!">
                Age: {AGE_LABELS[filters.propertyAge] ?? filters.propertyAge}
                <X className="w-3! h-3! cursor-pointer! hover:text-red-500! transition-colors!" onClick={() => onChange({...filters, propertyAge: ""})} />
              </span>
            )}
          </div>
        </div>
      );
    },

    buildTitle: (filters) => {
      const propertyTypeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === filters.propertyType)?.label || filters.propertyType;
      const listingTypeLabel = filters.listingType === "Rent" ? "Rent" : "Sale";
      const rawLocation = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      const locationLabel = rawLocation
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return `${propertyTypeLabel} in ${locationLabel} for ${listingTypeLabel}`;
    },

    buildBreadcrumbs: (filters) => {
      const propertyTypeLabel =
        Object.values(PROPERTY_TYPES).find((p) => p.apiValue === filters.propertyType)?.label ||
        filters.propertyType;
      const listingTypeLabel = filters.listingType === "Rent" ? "For Rent" : "For Sale";
      const locationLabel = filters.location
        ? filters.location.replace(/-/g, " ")
        : init.initialCity;

      // Find the URL slug for the property type (e.g. "apartment" → "apartments")
      const ptSlug =
        (Object.entries(PROPERTY_TYPES).find(
          ([, data]) => data.apiValue === filters.propertyType
        )?.[0] as PropertyTypeSlug | undefined) || "apartments";

      // Parent breadcrumb points to the city-level PSEO page
      const parentSlug = buildPseoSlug(
        filters.listingType as "Sell" | "Rent",
        ptSlug,
        init.initialCity
      );

      return [
        { label: listingTypeLabel, href: `/${parentSlug}` },
        { label: propertyTypeLabel, href: `/${parentSlug}` },
        { label: locationLabel },
      ];
    },

    mapCity: (filters) => filters.location || init.initialCity,
    mapLocality: () => init.initialLocality,

    emptyTitle: "No properties found",
    emptyHint: (filters) => {
      const locationLabel = filters.location ? filters.location.replace(/-/g, ' ') : "Coimbatore";
      return `We couldn't find any properties matching your current criteria in ${locationLabel}. Try adjusting your filters or exploring a different area.`;
    },

    syncUrl: ({ filters, sort, pathname }) => {
      const params = new URLSearchParams();
      if (filters.keyword) params.set("keyword", filters.keyword);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minArea) params.set("minArea", filters.minArea);
      if (filters.maxArea) params.set("maxArea", filters.maxArea);
      if (filters.facing) params.set("facing", filters.facing);
      if (filters.furnishing) params.set("furnishing", filters.furnishing);
      if (filters.propertyAge) params.set("propertyAge", filters.propertyAge);
      if (sort) params.set("sort", sort);

      // Check if any PSEO-defining axis changed (listingType, propertyType, or
      // location). If so, navigate to the new canonical PSEO URL.
      const currentLocality = init.initialLocality || "";
      const filterLocationIsLocality = filters.location && filters.location !== init.initialCity;

      if (
        filters.listingType !== init.initialListingType ||
        filters.propertyType !== init.initialPropertyType ||
        filters.location !== (init.initialLocality || init.initialCity)
      ) {
        // Find the URL slug for the property type
        const ptSlug =
          (Object.entries(PROPERTY_TYPES).find(
            ([, data]) => data.apiValue === filters.propertyType
          )?.[0] as PropertyTypeSlug | undefined) || "apartments";

        const newLocality = filterLocationIsLocality ? filters.location : undefined;

        // Only include bedrooms in the URL if this is a BHK-supporting type
        // and bedrooms is set. Bedrooms as a user filter appends as a query param.
        const url =
          "/" +
          buildPseoSlug(
            filters.listingType as "Sell" | "Rent",
            ptSlug,
            init.initialCity,
            newLocality || undefined
          );

        // If the user also has a bedrooms filter set, keep it as a query param
        // (not in the PSEO slug) since it wasn't part of the base PSEO definition.
        if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      } else {
        // Only location/listingType/propertyType unchanged — keep current pathname,
        // append bedrooms as query param if set (it's a user filter here)
        if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
        const queryString = params.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      }
    },

    filtersFromParams: (searchParams) => ({
      keyword: searchParams.get("keyword") || "",
      propertyType: init.initialPropertyType,
      listingType: init.initialListingType,
      location: searchParams.get("location") || init.initialLocality || init.initialCity, // Use param if present
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      bedrooms: searchParams.get("bedrooms") || (init.initialBedrooms ? String(init.initialBedrooms) : ""),
      facing: searchParams.get("facing") || "",
      furnishing: searchParams.get("furnishing") || "",
      propertyAge: searchParams.get("propertyAge") || "",
    }),
  };
}
