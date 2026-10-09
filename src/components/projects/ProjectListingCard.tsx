"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, LayoutDashboard, Sparkles, Grid3X3, MapPinned, Images, Share2, Check, BadgeCheck, Download } from "lucide-react";
import { type ProjectListItem } from "@/lib/api/projects";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { useUserAuthStore } from "@/store/userAuthStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { PropertyEnquiryActions, type EnquiryPropertyRef } from "@/components/site/property/PropertyEnquiryActions";

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

// "2026-10-02" → "2nd Oct 2026" for the photo overlay.
function fmtOrdinalDate(v: string | null | undefined): string | null {
  if (!v || !v.trim()) return null;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return null;
  const day = dt.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd"
    : "th";
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
  return `${day}${suffix} ${mon} ${dt.getFullYear()}`;
}

// "north_east" → "North-East", matching the property facing vocabulary.
function formatFacing(v: string): string {
  return v
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join("-");
}

// DB enum values read raw on a card ("ready_to_move") — map the known
// vocabulary to display labels, title-casing anything unexpected.
function formatPossessionStatus(v: string | null | undefined): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const key = v.trim().toLowerCase();
  if (key === "ready_to_move") return "Ready to Move";
  if (key === "under_construction") return "Under Construction";
  if (key === "new_launch") return "New Launch";
  return v.trim().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Condition ribbon for the pricing row, mirroring the property card's
// canonical vocabulary badge.
function getConditionBadge(possessionStatus: string | null | undefined): string | null {
  if (typeof possessionStatus !== "string") return null;
  const key = possessionStatus.trim().toLowerCase();
  if (key === "ready_to_move") return "READY TO MOVE";
  if (key === "under_construction") return "UNDER CONSTRUCTION";
  if (key === "new_launch") return "NEW LAUNCH";
  return null;
}

export function ProjectListingCard({ item }: { item: ProjectListItem }) {
  const router = useRouter();
  const detailPath = `/${item.canonicalSlug}`;
  const photosPath = `${detailPath}#photos`;
  const placeholderUrl = getPlaceholderImage({ projectType: item.projectType });

  const projectSections = [
    { hash: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5! h-3.5!" /> },
    { hash: "amenities", label: "Amenities", icon: <Sparkles className="w-3.5! h-3.5!" /> },
    { hash: "floor-plans", label: "Floor Plan", icon: <Grid3X3 className="w-3.5! h-3.5!" /> },
    { hash: "locality", label: "Locality", icon: <MapPinned className="w-3.5! h-3.5!" /> },
    { hash: "photos", label: "Photos", icon: <Images className="w-3.5! h-3.5!" /> },
  ];
  const showImg = Boolean(item.coverImageUrl);
  const [copied, setCopied] = useState(false);
  const [enquireToken, setEnquireToken] = useState<number | null>(null);
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);
  const hasBrochure = Boolean(item.brochureUrl);
  const enquiryRef: EnquiryPropertyRef = {
    id: item.id,
    propertyCode: item.projectCode ?? null,
    slug: item.canonicalSlug ?? null,
    title: item.name ?? "Project",
    propertyType: "project",
    listingType: "",
    city: item.city ?? "",
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleBrochure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.brochureUrl) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    window.open(item.brochureUrl, "_blank", "noopener");
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
    formatPossessionStatus(item.possessionStatus) ?? fmtShortDate(item.possessionDate);
  const conditionBadge = getConditionBadge(item.possessionStatus);

  // Availability strip, wired to the possession date: before it shows
  // "Available from {date}"; once it passes, it flips to "Ready to Move".
  const availabilityStrip = (() => {
    const ymd = (v: unknown): string | null => {
      if (typeof v !== "string" || !v.trim()) return null;
      const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
    };
    const target = ymd(item.possessionDate);
    if (!target) return null;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (today < target) {
      const label = fmtOrdinalDate(target);
      return label ? `Available from ${label}` : null;
    }
    return "Ready to Move";
  })();

  const facingLabel = (() => {
    const facings = (item.ranges.facings ?? []).filter(Boolean);
    if (facings.length === 0) return null;
    const shown = facings.slice(0, 2).map(formatFacing).join(", ");
    return facings.length > 2 ? `${shown} +${facings.length - 2}` : shown;
  })();

  // Representative per-sqft rate from the range floor (min price / min area),
  // shown beside the price exactly like the property card's ₹/sqft.
  const pricePerSqft = (() => {
    const minPrice = item.ranges.minPrice;
    const minArea = item.ranges.minArea;
    if (minPrice == null || minArea == null || minPrice <= 0 || minArea <= 0) return null;
    return `₹ ${Math.round(minPrice / minArea).toLocaleString("en-IN")}/sqft`;
  })();

  const reraVerified = isReraVerified(item.reraNumber);

  const locationLabel = (() => {
    const sub = (item.sublocation || "").trim();
    const cityName = (item.city || "").trim();
    if (sub && cityName && sub.toLowerCase() !== cityName.toLowerCase()) return `${sub}, ${cityName}`;
    return sub || cityName || "";
  })();

  const specCells: { label: string; value: React.ReactNode }[] = [];
  if (item.ranges.bhk.length > 0)
    specCells.push({ label: "BHK", value: `${item.ranges.bhk.join(", ")} BHK` });
  if (area) specCells.push({ label: "Built-Up Area", value: area });
  if (facingLabel) specCells.push({ label: "Facing", value: facingLabel });
  if (possession) specCells.push({ label: "Possession", value: possession });

  return (
    <div className="font-['Manrope',sans-serif]! bg-white! rounded-2xl! border! border-gray-200/70! shadow-sm! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! transition-all! duration-300! flex! flex-col! lg:flex-row! overflow-hidden! min-w-0! group!">

      {/* Image — full-width square on mobile/tablet; on desktop a fixed
          300px-wide column that stretches to the content height, so the card
          hugs the content with no leftover top/bottom whitespace. */}
      <div className="relative! w-full! aspect-square! lg:aspect-auto! lg:w-[300px]! lg:h-auto! lg:self-stretch! lg:min-h-[240px]! shrink-0! overflow-hidden! bg-gray-100!">
        <Link href={photosPath} aria-label={`View photos of ${item.name || "project"}`} className="absolute! inset-0!">
          <ListingImage
            src={showImg ? item.coverImageUrl : null}
            placeholderSrc={placeholderUrl}
            alt={item.name || "Project"}
            className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-700! ease-out!"
          />
        </Link>
        {/* RERA verified badge — top-right over image */}
        {reraVerified && (
          <span className="absolute! top-3! right-3! z-10! inline-flex! items-center! gap-1! bg-white/90! backdrop-blur-sm! text-[#1d9bf0]! text-[10px]! font-bold! px-2! py-1! rounded-lg! shadow-sm!">
            <BadgeCheck className="w-3.5! h-3.5! fill-blue-400! text-white! stroke-1.5!" />
            RERA
          </span>
        )}
        {/* Availability strip — slim black-to-transparent gradient over the
            bottom 10% of the photo so the date reads on any image. */}
        {availabilityStrip ? (
          <div className="absolute! inset-x-0! bottom-0! h-[10%]! min-h-[34px]! flex! items-end! justify-center! pb-1.5! bg-gradient-to-t! from-black/85! via-black/40! to-transparent! pointer-events-none!">
            <span className="text-[11px]! font-semibold! tracking-wide! text-white! drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]!">
              {availabilityStrip}
            </span>
          </div>
        ) : null}
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
        aria-label={`View details of ${item.name || "project"}`}
      >

        {/* Title + share */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <Link href={detailPath} onClick={(e) => e.stopPropagation()} className="no-underline!">
              <h3 className="font-['Manrope',sans-serif]! text-[17px]! font-semibold! text-[#27427f]! line-clamp-1! leading-snug! hover:text-[#1a2d59]! transition-colors!">
                {item.name}
              </h3>
            </Link>
            <p className="flex! items-center! gap-1.5! text-[13px]! text-gray-600! min-w-0!">
              <MapPin className="w-3.5! h-3.5! text-gray-500! shrink-0!" />
              <span className="truncate!">{locationLabel}</span>
            </p>
          </div>
          <WishlistButton propertyId={item.id} propertyType="project" />
          <button
            onClick={handleShare}
            aria-label="Share this project"
            className="p-2! rounded-full! text-gray-400! hover:text-[#27427f]! hover:bg-gray-100! transition-colors! cursor-pointer! shrink-0!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
          </button>
        </div>

        {/* Price — dotted divider above, directly under title/location for prominence */}
        <div className="mt-3! border-t! border-dashed! border-gray-200! pt-3! flex! items-end! gap-3! leading-none!">
          <span className="text-[22px]! font-semibold! text-[#27427f]!">
            {price}
          </span>
          {pricePerSqft ? (
            <span className="text-[13px]! font-medium! text-gray-700!">{pricePerSqft}</span>
          ) : null}
          {conditionBadge ? (
            <span
              className="ml-auto! shrink-0! bg-gray-200! text-gray-600! text-[11px]! font-bold! tracking-wider! pl-3.5! pr-2.5! py-1.5! leading-none!"
              style={{ clipPath: "polygon(9px 0, 100% 0, 100% 100%, 9px 100%, 0 50%)" }}
            >
              {conditionBadge}
            </span>
          ) : null}
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
        <div
          className="mt-3! flex! flex-col! sm:flex-row! gap-2.5!"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEnquireToken(Date.now())}
            className="flex! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-[#27427f]! bg-[#eef2f7]! hover:bg-[#dde5f0]! transition-colors! cursor-pointer!"
          >
            <Phone className="w-4! h-4!" />
            Enquire
          </button>
          <PropertyEnquiryActions
            property={enquiryRef}
            hideTriggers
            externalOpen={enquireToken != null ? { intent: "enquire", token: enquireToken } : null}
          />
          <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
          {hasBrochure ? (
            <button
              onClick={handleBrochure}
              className="flex! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-white! bg-[#27427f]! hover:bg-[#1e3a6e]! transition-colors! cursor-pointer!"
            >
              <Download className="w-4! h-4!" />
              Brochure
            </button>
          ) : (
            <Link
              href={detailPath}
              className="flex! flex-1! items-center! justify-center! px-4! py-2.5! rounded-xl! text-sm! font-medium! text-white! bg-[#27427f]! hover:bg-[#1e3a6e]! transition-colors! no-underline!"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
