// site/majestan-frontend/src/components/site/property/PropertyInfoSidebar.tsx
import Image from "next/image";
import {
  MapPin,
  BedDouble,
  Building2,
  Calendar,
  ShieldCheck,
  Ruler,
  Coins,
  Info,
  Sofa,
  Compass,
} from "lucide-react";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import { formatDate, formatFurnishing, formatPrice } from "@/lib/property-format";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import {
  getCommercialSpecs,
  getCoworkingSpecs,
  getFarmlandSpecs,
  getIndustrialSpecs,
  getLandPricePerUnit,
  getPlotSpecs,
} from "@/lib/property-sections";
import { capFirst, formatAddressLines, getPincode, getSublocation, type LocationRecord } from "@/lib/location-display";
import { emi } from "@/lib/emi";
import { PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { PropertyEnquiryActions } from "./PropertyEnquiryActions";
import { LISTING_SUMMARY_CARD } from "@/components/site/shared/listing-summary-styles";

type PropertyInfoSidebarProps = {
  property: SeoProperty;
};

/**
 * The right-hand info card column: title, location, curated spec grid, price,
 * Enquire/Schedule actions, brokerage note, property ID and the Listed-By
 * card. Shared verbatim by the overview and every sub-page so the sidebar is
 * identical everywhere. The spec grid rows are curated per property type
 * (apartments show Furnishing + Facing); other types keep the generic rows
 * until curated.
 */
export function PropertyInfoSidebar({ property }: PropertyInfoSidebarProps) {
  const propertyTypeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label ||
    property.propertyType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const isApartment = property.propertyType === "apartment";
  // Villas and individual houses show the same home specs as apartments
  // (Furnishing + Facing) instead of Listed + Property Type.
  const isHomeType =
    property.propertyType === "apartment" ||
    property.propertyType === "villa" ||
    property.propertyType === "individual_portion";
  const isSale = !["rent", "rental", "lease"].includes(property.listingType?.toLowerCase()) && !property.status.toLowerCase().includes("rent");

  const locRow = property.locations?.[0] as LocationRecord | undefined;
  const locData = locRow?.localityData as LocationRecord | undefined;
  const fullAddress = String(
    locRow?.address || locRow?.landmark || locData?.address || "",
  ).trim();
  const rawSub = (property as SeoProperty & { sublocation?: string }).sublocation || (property as SeoProperty & { locality?: string }).locality || getSublocation(locRow);
  const subLocation = rawSub && rawSub.toLowerCase() !== property.city.toLowerCase() ? capFirst(rawSub) : "";
  const pincode = getPincode(locRow);
  const locationLines = formatAddressLines(fullAddress, {
    sublocation: subLocation,
    city: property.city,
    pincode,
  });

  const areaNum = property.details?.areaSqft ? parseFloat(property.details.areaSqft) : NaN;
  const priceNum = parseFloat(property.price);
  // Land types curate their own spec rows (area, facing, dimensions, water,
  // crop…) instead of the generic Listed + Property Type pair.
  const isLand = property.propertyType === "plot" || property.propertyType === "farmland";
  const landSpecs =
    property.propertyType === "plot"
      ? getPlotSpecs(property.details)
      : property.propertyType === "farmland"
        ? getFarmlandSpecs(property.details)
        : [];
  const isWorkspace =
    property.propertyType === "commercial" ||
    property.propertyType === "industrial" ||
    property.propertyType === "coworking";
  const workspaceSpecs =
    property.propertyType === "commercial"
      ? getCommercialSpecs(property.details)
      : property.propertyType === "industrial"
        ? getIndustrialSpecs(property.details)
        : property.propertyType === "coworking"
          ? getCoworkingSpecs(property.details)
          : [];
  // Land is priced per cent or not at all — never per sq.ft.
  const perSqft =
    getLandPricePerUnit(property.price, property.details, property.propertyType) ??
    (!isLand && Number.isFinite(areaNum) && areaNum > 0 && Number.isFinite(priceNum)
      ? `₹ ${Math.round(priceNum / areaNum).toLocaleString("en-IN")} / sq.ft`
      : null);

  // DB decimals arrive as strings ("4.0000") — display rounded to whole sq.ft.
  const trimArea = (v: string | null | undefined): string | null => {
    if (v == null || String(v).trim() === "") return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v).trim();
    return String(Math.round(n));
  };

  const title = property.seo?.seoData?.overview?.h1 || property.title;

  const sidebarSpecs: { icon: React.ReactNode; label: string; value: string | null }[] = (
    isLand
      ? landSpecs.slice(0, 4).map((spec) => {
          const Icon = spec.icon;
          return { icon: <Icon className="w-4.5! h-4.5!" />, label: spec.label, value: spec.value };
        })
      : isWorkspace
        ? workspaceSpecs.slice(0, 4).map((spec) => {
            const Icon = spec.icon;
            return { icon: <Icon className="w-4.5! h-4.5!" />, label: spec.label, value: spec.value };
          })
        : [
          property.details?.bedrooms
            ? { icon: <BedDouble className="w-4.5! h-4.5!" />, label: "BHK", value: `${property.details.bedrooms} BHK` }
            : null,
          property.details?.areaSqft
            ? { icon: <Ruler className="w-4.5! h-4.5!" />, label: "Built-Up Area", value: `${trimArea(property.details.areaSqft)} Sq Ft` }
            : null,
          ...(isHomeType
            ? [
                formatFurnishing(property.details)
                  ? {
                      icon: <Sofa className="w-4.5! h-4.5!" />,
                      label: "Furnishing",
                      value: formatFurnishing(property.details) as string,
                    }
                  : null,
                property.details?.propertyFacing
                  ? { icon: <Compass className="w-4.5! h-4.5!" />, label: "Facing", value: property.details.propertyFacing }
                  : null,
              ]
            : [
                { icon: <Calendar className="w-4.5! h-4.5!" />, label: "Listed", value: formatDate(property.createdAt) },
                { icon: <Building2 className="w-4.5! h-4.5!" />, label: "Property Type", value: propertyTypeLabel },
              ]),
        ]
  ).filter((s) => s && s.value) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <div className="lg:sticky! lg:top-[calc(var(--site-header-h)+69px)]! flex! flex-col! gap-4!">
      {/* Title and enquiry stay beside the cover, as on the original property layout. */}
      <div className={LISTING_SUMMARY_CARD}>
        <div className="flex! items-start! justify-between! gap-3!">
          <h1 className="m-0! text-xl! font-manrope! font-semibold! text-[#0a0f1c]! tracking-[-0.025em]! text-balance!">
            {isApartment ? title : `${title} ${property.city}`}
          </h1>
        </div>

        {locationLines.length > 0 ? (
          <div className="mt-2! flex! items-start! gap-2! text-sm! font-manrope! text-[#1c2433]! leading-relaxed!">
            <MapPin className="w-4! h-4! shrink-0! mt-1! text-[#0a0f1c]!" />
            <span className="min-w-0!">
              {locationLines.map((line, index) => (
                <span
                  className="block!"
                  key={`${line}-${index}`}
                >
                  {line}
                </span>
              ))}
            </span>
          </div>
        ) : null}

        <div className="mt-5! pt-5! border-t! border-[#e2e9f4]! flex! flex-col! items-start! gap-3!">
          <div className="min-w-0!">
            <p className="m-0! text-3xl! font-manrope! font-semibold! text-[#0a0f1c]! tracking-tight! tabular-nums!">
              {formatPrice(property.price)}
              {!isSale && (
                <span className="text-sm! font-normal! text-[#5f6b80]!"> / mo</span>
              )}
            </p>
            {perSqft && (
              <p className="text-sm! font-manrope! font-normal! text-[#5f6b80]! mt-1!">{perSqft}</p>
            )}
          </div>
          {(() => {
            // Same 20% down payment, rate and tenure as the embedded calculator.
            const priceNum = parseFloat(property.price);
            const emiStarts =
              isSale && Number.isFinite(priceNum) && priceNum > 0 ? emi(priceNum * (1 - PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct / 100), PROJECT_FINANCE_ASSUMPTIONS.annualRatePct, PROJECT_FINANCE_ASSUMPTIONS.years) : null;
            return emiStarts ? (
              <div className="flex! items-baseline! justify-between! gap-4! w-full!">
                <span className="text-sm! font-manrope! font-normal! text-[#5f6b80]!">EMI from</span>
                <a href={`/${property.canonicalSlug}#calculators`} className="text-sm! font-manrope! font-semibold! text-[#1c2433]! tabular-nums! no-underline! hover:underline! underline-offset-4! rounded-sm! focus-visible:outline-2! focus-visible:outline-[#2563eb]! focus-visible:outline-offset-4!">
                  ₹{Math.round(emiStarts).toLocaleString("en-IN")}/mo
                </a>
              </div>
            ) : null;
          })()}
        </div>

        {sidebarSpecs.length > 0 && (
          <div className="mt-5! pt-5! border-t! border-[#e2e9f4]! grid! grid-cols-2! gap-x-3! gap-y-5!">
            {sidebarSpecs.map((spec, i) => (
              <div key={i} className="flex! items-start! gap-2.5! min-w-0!">
                <span className="text-[#5f6b80]! shrink-0!">{spec.icon}</span>
                <span className="min-w-0!">
                  <span className="block! text-xs! font-manrope! text-[#5f6b80]! font-normal! leading-tight!">
                    {spec.label}
                  </span>
                  <span className="block! text-base! font-manrope! font-semibold! text-[#1c2433]! mt-1! leading-snug!">
                    {spec.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <PropertyEnquiryActions
          property={{
            id: property.id,
            propertyCode: property.propertyCode,
            slug: property.slug,
            title: property.title,
            propertyType: property.propertyType,
            listingType: property.listingType,
            city: property.city,
          }}
        />

        <div className="mt-5! pt-3! border-t! border-[#e2e9f4]! flex! items-center! justify-center! gap-1! text-sm! font-manrope! font-normal! text-[#465066]!">
          <Coins className="w-4! h-4! text-emerald-600! shrink-0!" />
          {!property.brokerageType || property.brokerageType === 'no_brokerage'
            ? 'No brokerage for this property'
            : property.brokerageType === 'percentage'
              ? `Brokerage: Only ${property.brokerageValue}% on Sale Value`
              : `Brokerage: Just ${property.brokerageValue} Days Rent`}
        </div>

        {property.propertyCode && (
          <p className="mt-2! flex! items-center! justify-center! gap-2! text-xs! font-manrope! text-[#5f6b80]!">
            <Info className="w-3.5! h-3.5!" />
            ID: {property.propertyCode}
          </p>
        )}
      </div>

      {/* Listed-by card */}
      <div className="bg-white! rounded-2xl! border! border-[#e6ebf2]! p-6! flex! items-center! gap-4!">
        <Image
          width={56}
          height={56}
          src="/favicon/android-chrome-512x512.png"
          alt="Majestan Realty"
          className="w-14! h-14! rounded-full! object-cover! shrink-0!"
        />
        <div>
          <p className="text-xs! font-manrope! text-[#5f6b80]! font-normal! uppercase! tracking-wider! mb-0.5!">
            Listed By
          </p>
          <p className="font-manrope! font-medium! text-base! text-gray-900!">
            Majestan Realty
          </p>
          <p className="text-xs! font-manrope! font-normal! text-[#5f6b80]! mt-1! flex! items-center! gap-1.5!">
            <ShieldCheck className="w-3.5! h-3.5! text-emerald-500!" />
            Verified
          </p>
        </div>
      </div>
    </div>
  );
}
