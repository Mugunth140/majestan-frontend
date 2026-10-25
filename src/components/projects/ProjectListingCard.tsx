"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, LayoutDashboard, Sparkles, Grid3X3, MapPinned, Images, Share2, Check, BadgeCheck, Download } from "lucide-react";
import { formatPlotCents, type ProjectListItem } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { ListingConditionBadge } from "@/components/site/listing/ListingConditionBadge";
import listingCardStyles from "@/components/site/listing/listing-card.module.css";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { useUserAuthStore } from "@/store/userAuthStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { ProjectEnquiryActions } from "@/components/site/project/ProjectEnquiryActions";
import { formatLocationLine } from "@/lib/location-display";
import { emi } from "@/lib/emi";
import { inventoryAvailability } from "@/lib/inventory-availability";

// "EMI starts at" basis: lowest current starting rate, 20-year tenure,
// full range-floor price as the loan (no down-payment assumption).
const EMI_RATE_PCT = 7.25;
const EMI_YEARS = 20;

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

// Consecutive integer sets collapse to a range ("4 - 5 Cents", "2 - 4 BHK");
// anything else lists out ("4, 6, 7 Cents") so non-sequential unit mixes
// never read as a continuous range.
function formatSmartRange(values: number[], unit: string): string | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return `${trimNum(sorted[0])} ${unit}`;
  const consecutive =
    sorted.every((v) => Number.isInteger(v)) &&
    sorted[sorted.length - 1] - sorted[0] + 1 === sorted.length;
  return consecutive
    ? `${trimNum(sorted[0])} - ${trimNum(sorted[sorted.length - 1])} ${unit}`
    : `${sorted.map(trimNum).join(", ")} ${unit}`;
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

// Condition ribbon for the pricing row: only New Launch and New Arrival
// (ready-to-move) get a badge — under-construction shows none.
function getConditionBadge(possessionStatus: string | null | undefined): string | null {
  if (typeof possessionStatus !== "string") return null;
  const key = possessionStatus.trim().toLowerCase();
  if (key === "new_launch") return "NEW LAUNCH";
  if (key === "ready_to_move") return "NEW ARRIVAL";
  return null;
}

export function ProjectListingCard({ item }: { item: ProjectListItem }) {
  const isRent = item.listingType === "Rent";
  const router = useRouter();
  const detailPath = `/${item.canonicalSlug}`;
  const placeholderUrl = getPlaceholderImage({ projectType: item.projectType });

  const navigateToDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(detailPath);
  };

  const projectSections = [
    { hash: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5! h-3.5!" /> },
    { hash: "amenities", label: "Amenities", icon: <Sparkles className="w-3.5! h-3.5!" /> },
    { hash: "floor-plans", label: getFloorPlanLabel(item.projectType), icon: <Grid3X3 className="w-3.5! h-3.5!" /> },
    { hash: "locality", label: "Locality", icon: <MapPinned className="w-3.5! h-3.5!" /> },
    { hash: "photos", label: "Photos", icon: <Images className="w-3.5! h-3.5!" /> },
  ];
  const showImg = Boolean(item.coverImageUrl);
  const [copied, setCopied] = useState(false);
  const [enquireToken, setEnquireToken] = useState<number | null>(null);
  const [downloadingBrochure, setDownloadingBrochure] = useState(false);
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);
  const hasBrochure = Boolean(item.brochureUrl);
  const enquiryRef = {
    id: item.id,
    projectCode: item.projectCode ?? null,
    slug: item.canonicalSlug ?? item.slug ?? null,
    name: item.name ?? "Project",
    projectType: item.projectType ?? "",
    city: item.city ?? "",
    status: item.status,
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

  const handleBrochure = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.brochureUrl || downloadingBrochure) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    // Force a real download (fetch → blob → anchor download) instead of
    // opening the PDF in a new tab. Falls back to a new tab if the fetch
    // fails (e.g. storage CORS), preserving previous behavior.
    setDownloadingBrochure(true);
    try {
      const res = await fetch(item.brochureUrl);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download =
        item.brochureName ??
        `${item.projectCode ? `${item.projectCode}-` : ""}brochure.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch {
      window.open(item.brochureUrl, "_blank", "noopener");
    } finally {
      setDownloadingBrochure(false);
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
    formatPossessionStatus(item.possessionStatus) ?? fmtShortDate(item.possessionDate);
  const conditionBadge = isRent ? null : getConditionBadge(item.possessionStatus);

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

  // Total unit count: apartment/villa cards read the stored Total Units
  // from Structure & Layout; other types (and missing values) fall back to
  // the countable unit-row stock. A card without a countable stock (zero or
  // missing) shows no cell rather than a zero.
  const totalUnits = (() => {
    if (item.projectType === "apartment" || item.projectType === "villa") {
      const stored = item.totalUnits;
      if (Number.isFinite(stored) && (stored as number) > 0)
        return (stored as number).toLocaleString("en-IN");
    }
    const n = item.ranges.unitsCount;
    return Number.isFinite(n) && (n as number) > 0
      ? (n as number).toLocaleString("en-IN")
      : null;
  })();

  // Representative per-sqft rate from the range floor (min price / min area),
  // shown beside the price exactly like the property card's ₹/sqft.
  // Plot projects quote per cent instead, mirroring property land cards.
  const pricePerSqft = (() => {
    const minPrice = item.ranges.minPrice;
    if (item.projectType === "plot") {
      const minCents = item.ranges.minPlotCents;
      if (minPrice == null || minCents == null || minPrice <= 0 || minCents <= 0) return null;
      return `₹ ${Math.round(minPrice / minCents).toLocaleString("en-IN")}/cent`;
    }
    const minArea = item.ranges.minArea;
    if (minPrice == null || minArea == null || minPrice <= 0 || minArea <= 0) return null;
    return `₹ ${Math.round(minPrice / minArea).toLocaleString("en-IN")}/sqft`;
  })();

  const reraVerified = isReraVerified(item.reraNumber);

  // EMI floor from the same min price the ₹/sqft figure uses.
  const emiStarts =
    item.ranges.minPrice != null && item.ranges.minPrice > 0
      ? emi(item.ranges.minPrice, EMI_RATE_PCT, EMI_YEARS)
      : null;

  const locationLabel = formatLocationLine({
    sublocation: item.sublocation,
    city: item.city,
  });

  const specCells: { label: string; value: React.ReactNode }[] = [];
  const isPlot = item.projectType === "plot";
  if (isPlot) {
    // Land parcels quote in cents; a single Plot Area cell leads — mirroring
    // the property plot card cells (area, facing, dimension, boundary).
    // Consecutive sizes collapse to a range, scattered ones list out.
    const cents = (item.ranges.plotCents ?? []).filter(
      (n) => Number.isFinite(n) && (n as number) > 0,
    );
    const plotArea =
      cents.length > 0
        ? formatSmartRange(cents, "Cents")
        : (() => {
            const { minPlotCents, maxPlotCents } = item.ranges;
            if (minPlotCents == null) return null;
            return maxPlotCents != null && maxPlotCents !== minPlotCents
              ? `${formatPlotCents(minPlotCents)} – ${formatPlotCents(maxPlotCents)}`
              : formatPlotCents(minPlotCents);
          })();
    if (plotArea) specCells.push({ label: "Plot Area", value: plotArea });
  } else {
    if (item.ranges.bhk.length > 0) {
      const bhk = formatSmartRange(item.ranges.bhk, "BHK");
      if (bhk) specCells.push({ label: "BHK", value: bhk });
    }
    if (area) specCells.push({ label: "Built-Up Area", value: area });
  }
  if (totalUnits) specCells.push({ label: "Total Units", value: totalUnits });
  if (isPlot) {
    if (item.ranges.plotDimensions.length > 0)
      specCells.push({ label: "Dimension", value: item.ranges.plotDimensions.join(", ") });
    if (item.ranges.plotBoundaryWall) specCells.push({ label: "Boundary Wall", value: "Yes" });
    else if (item.ranges.plotOpenSides.length > 0)
      specCells.push({ label: "Open Sides", value: item.ranges.plotOpenSides.join(", ") });
  }
  if (possession && !isPlot) specCells.push({ label: "Possession", value: possession });

  return (
    <div className="relative! bg-white! rounded-2xl! border! border-[#e6ebf2]! hover:border-[#cfd9ea]! hover:shadow-[0_24px_48px_-28px_rgba(22,69,191,0.35)]! transition-[box-shadow,border-color]! duration-300! ease-out-quint! flex! flex-col! lg:flex-row! overflow-hidden! min-w-0! group!">

      {/* Image — compact landscape on mobile, with the original
          300px square retained on desktop. */}
      <div
        className="relative! w-full! aspect-[4/3]! sm:aspect-video! lg:aspect-square! lg:w-[300px]! lg:self-start! shrink-0! overflow-hidden! bg-gray-100! cursor-pointer!"
        onClick={navigateToDetail}
        role="link"
        tabIndex={0}
        aria-label={`View details of ${item.name || "project"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigateToDetail();
        }}
      >
        <ListingImage
          src={showImg ? item.coverImageUrl : null}
          placeholderSrc={placeholderUrl}
          alt={item.name || "Project"}
          className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-700! ease-out!"
        />
        {/* RERA verified badge — left on mobile, right on desktop */}
        {reraVerified && (
          <span className="absolute! top-3! left-3! lg:left-auto! lg:right-3! z-10! inline-flex! items-center! gap-0.5! bg-white! backdrop-blur-sm! text-[#1645bf]! text-[12px]! font-bold! px-1! pr-1.5! py-0.5! rounded-full! shadow-md!">
            <BadgeCheck className="w-6! h-6! fill-[#2563eb]! text-white! stroke-2!" />
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
        className="p-4! lg:px-5! lg:py-3! flex! flex-col! flex-1! min-w-0! justify-center! cursor-pointer!"
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

        {/* On mobile the condition badge sits beside the title; social controls overlay the photo. */}
        <div className="flex! items-start! gap-2! min-w-0!">
          <div className="min-w-0! flex-1!">
            <div onClick={navigateToDetail} className="no-underline! cursor-pointer!">
              <h3 className="m-0! text-lg! font-semibold! tracking-[-0.02em]! text-[#0a0f1c]! line-clamp-2! lg:line-clamp-1! leading-snug! hover:text-[#1645bf]! transition-colors! duration-150!">
                {item.name}
              </h3>
            </div>
            <p className="flex! items-center! gap-1.5! mt-1! text-[13px]! text-[#465066]! min-w-0!">
              <MapPin className="w-3.5! h-3.5! text-gray-500! shrink-0!" />
              <span className="truncate!">{locationLabel}</span>
            </p>
          </div>
          <ListingConditionBadge label={conditionBadge} className="max-w-none! shrink-0! self-start! lg:hidden!" />
          <div className="absolute! top-3! right-3! z-10! flex! items-center! gap-2! lg:static! lg:z-auto! lg:gap-0!" onClick={(event) => event.stopPropagation()}>
            <WishlistButton propertyId={item.id} propertyType="project" className="inline-flex! items-center! justify-center! min-w-[44px]! min-h-[44px]! bg-white/95! shadow-sm! lg:min-w-0! lg:min-h-0! lg:bg-transparent! lg:shadow-none! focus-visible:outline-2! focus-visible:outline-[#1645bf]! focus-visible:outline-offset-2!" />
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this project"
              className="inline-flex! items-center! justify-center! min-w-[44px]! min-h-[44px]! p-2! bg-white/95! shadow-sm! rounded-full! text-gray-400! hover:text-[#1645bf]! hover:bg-[#eef4ff]! transition-colors! cursor-pointer! shrink-0! lg:min-w-0! lg:min-h-0! lg:bg-transparent! lg:shadow-none! focus-visible:outline-2! focus-visible:outline-[#1645bf]! focus-visible:outline-offset-2!"
            >
              {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
            </button>
          </div>
        </div>

        {/* Price — dotted divider above, directly under title/location for prominence.
            EXPERIMENTAL: price over per-sqft, EMI label over EMI figure. */}
        <div className={`mt-3! border-t! border-[#e6ebf2]! pt-3! flex! flex-wrap! items-center! gap-x-4! lg:gap-x-16! gap-y-3! leading-none! ${!isRent && emiStarts ? "justify-around! lg:justify-start!" : ""}`}>
          <div className="flex! flex-col! gap-1! min-w-0! shrink-0!">
            <span className="text-xl! lg:text-2xl! font-semibold! tracking-[-0.025em]! text-[#0a0f1c]!">
              {price}
              {isRent && <span className="text-[13px]! font-medium! text-gray-500!"> /mo</span>}
            </span>
            {pricePerSqft ? (
              <span className="text-[13px]! font-medium! text-[#465066]!">{pricePerSqft}</span>
            ) : null}
          </div>
          {!isRent && emiStarts ? (
            <div className="flex! flex-col! items-end! lg:items-start! text-right! lg:text-left! gap-1! shrink-0!">
              <span className="text-[11px]! font-medium! uppercase! tracking-wide! text-gray-500!">EMI from</span>
              <span className="text-[15px]! font-semibold! text-[#0a0f1c]! tabular-nums!">
                ₹{Math.round(emiStarts).toLocaleString("en-IN")}/mo
              </span>
            </div>
          ) : null}
          <div className={`${listingCardStyles.badgeSlot} ml-auto! shrink-0! self-center! hidden! lg:flex!`}>
            <ListingConditionBadge label={conditionBadge} />
          </div>
        </div>

        {/* Scrollable specifications on mobile; four columns on desktop. */}
        {specCells.length > 0 && (
          <dl className={listingCardStyles.specs} tabIndex={0} aria-label="Project specifications">
            {specCells.map((cell) => (
              <div key={cell.label} className={listingCardStyles.spec}>
                <dt className="m-0! text-[11px]! font-medium! uppercase! tracking-wide! text-gray-500!">{cell.label}</dt>
                <dd className={`${listingCardStyles.specValue} m-0! text-sm! font-semibold! text-[#0a0f1c]! break-words! leading-snug! mt-1!`}>{cell.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Section links — separated by the spec table's bottom dotted line */}
        <div
          className="hidden! lg:flex! flex-wrap! items-center! justify-center! gap-x-7! gap-y-2! mt-3!"
          onClick={(e) => e.stopPropagation()}
        >
          {projectSections.map((s) => {
            const sectionHref = s.hash === "overview" ? detailPath : `${detailPath}/${s.hash}`;
            return (
              <button
                key={s.hash}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(sectionHref);
                }}
                className="section-navigation-link flex! items-center! gap-1.5! text-[12px]! font-medium! text-[#465066]! hover:text-[#1645bf]! transition-colors! no-underline! group/link! cursor-pointer! bg-transparent! border-none! p-0!"
              >
                <span className="text-gray-400! group-hover/link:text-[#1645bf]! transition-colors!">
                  {s.icon}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div
          className="mt-4! lg:mt-3! flex! flex-row! gap-2.5!"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              if (inventoryAvailability(item.status)) router.push(detailPath);
              else setEnquireToken(Date.now());
            }}
            className="flex! min-h-[44px]! lg:min-h-0! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-semibold! text-[#0a0f1c]! bg-white! border! border-[#cfd6e2]! hover:border-[#2563eb]! hover:bg-[#eef4ff]! hover:text-[#1645bf]! active:scale-[0.98]! transition-[border-color,background-color,color,transform]! duration-150! ease-out-quint! cursor-pointer!"
          >
            <Phone className="w-4! h-4!" />
            Enquire
          </button>
          <ProjectEnquiryActions
            project={enquiryRef}
            hideTriggers
            externalOpen={enquireToken != null ? { intent: "enquire", token: enquireToken } : null}
          />
          <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
          {hasBrochure ? (
            <button
              onClick={handleBrochure}
              disabled={downloadingBrochure}
              className="flex! min-h-[44px]! lg:min-h-0! flex-1! items-center! justify-center! gap-2! px-4! py-2.5! rounded-xl! text-sm! font-semibold! text-white! bg-[linear-gradient(115deg,#2563eb,#1645bf)]! shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]! hover:brightness-110! active:scale-[0.98]! transition-[filter,transform]! duration-150! ease-out-quint! cursor-pointer! disabled:opacity-70!"
            >
              <Download className="w-4! h-4!" />
              {downloadingBrochure ? "Downloading..." : "Brochure"}
            </button>
          ) : (
            <button
              type="button"
              onClick={navigateToDetail}
              className="flex! min-h-[44px]! lg:min-h-0! flex-1! items-center! justify-center! px-4! py-2.5! rounded-xl! text-sm! font-semibold! text-white! bg-[linear-gradient(115deg,#2563eb,#1645bf)]! shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]! hover:brightness-110! active:scale-[0.98]! transition-[filter,transform]! duration-150! ease-out-quint! cursor-pointer!"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
