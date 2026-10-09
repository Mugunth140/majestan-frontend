// site/majestan-frontend/src/components/site/property/PropertyInfoSidebar.tsx
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
import { PropertyEnquiryActions } from "./PropertyEnquiryActions";

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
  const isSale = !property.status.toLowerCase().includes("rent");

  const locData = property.locations?.[0]?.localityData;
  const locRow = property.locations?.[0] as unknown as
    | { address?: string | null; landmark?: string | null; pincode?: string | null }
    | undefined;
  const fullAddress = (
    locRow?.address ||
    locRow?.landmark ||
    (locData as any)?.address ||
    ""
  ).trim();
  const addrPart = fullAddress.split(",")[0].trim();
  const rawSub =
    (property as any).sublocation ||
    (property as any).locality ||
    (locData as any)?.subLocation ||
    (locData as any)?.locality ||
    addrPart;
  const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const subLocation = rawSub && rawSub.toLowerCase() !== property.city.toLowerCase() ? capFirst(rawSub) : "";
  const pincode = (
    (locRow as any)?.pincode ||
    (locData as any)?.pincode ||
    (locData as any)?.postalCode ||
    (locData as any)?.postal_code ||
    ""
  ).toString().trim();
  const locationLine2 = [subLocation, property.city, pincode].filter(Boolean).join(", ");

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
  const perSqft =
    getLandPricePerUnit(property.price, property.details, property.propertyType) ??
    (Number.isFinite(areaNum) && areaNum > 0 && Number.isFinite(priceNum)
      ? `₹ ${Math.round(priceNum / areaNum).toLocaleString("en-IN")} / sq.ft`
      : null);

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
            ? { icon: <Ruler className="w-4.5! h-4.5!" />, label: "Built-Up Area", value: `${property.details.areaSqft} Sq Ft` }
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
    <div className="lg:sticky! lg:top-[140px]! flex! flex-col! gap-5!">
      {/* Info card */}
      <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm!">
        <div className="flex! items-start! justify-between! gap-3!">
          <h1 className="text-xl! font-manrope! font-medium! text-[#27427f]! leading-snug!">
            {isApartment ? title : `${title} ${property.city}`}
          </h1>
        </div>

        {(fullAddress || locationLine2) ? (
          <div className="mt-2! flex! items-start! gap-2! text-[13px]! font-manrope! text-gray-500! leading-relaxed!">
            <MapPin className="w-4! h-4! shrink-0! mt-1! text-gray-400!" />
            <span className="min-w-0!">
              {fullAddress ? (
                <span className="block! text-gray-700!">{fullAddress}</span>
              ) : null}
              {locationLine2 ? (
                <span className="block!">{locationLine2}</span>
              ) : null}
            </span>
          </div>
        ) : null}

        {sidebarSpecs.length > 0 && (
          <div className="mt-5! pt-5! border-t! border-gray-100! grid! grid-cols-2! gap-x-3! gap-y-5!">
            {sidebarSpecs.map((spec, i) => (
              <div key={i} className="flex! items-start! gap-2.5! min-w-0!">
                <span className="text-gray-400! shrink-0!">{spec.icon}</span>
                <span className="min-w-0!">
                  <span className="block! text-[12px]! font-manrope! text-gray-400! font-normal! leading-tight!">
                    {spec.label}
                  </span>
                  <span className="block! text-base! font-manrope! font-semibold! text-gray-800! mt-1! leading-snug!">
                    {spec.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5! pt-5! border-t! border-gray-100!">
          <p className="text-xl! font-manrope! font-medium! text-gray-900! tracking-tight!">
            {formatPrice(property.price)}
            {!isSale && (
              <span className="text-sm! font-normal! text-gray-500!"> / mo</span>
            )}
          </p>
          {perSqft && (
            <p className="text-[13px]! font-manrope! font-normal! text-gray-500! mt-1!">{perSqft}</p>
          )}
        </div>

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

        <div className="mt-5! pt-3! border-t! border-gray-100! flex! items-center! justify-center! gap-1! text-[13px]! font-manrope! font-normal! text-gray-500! ">
          <Coins className="w-4! h-4! text-yellow-500! shrink-0!" />
          {!property.brokerageType || property.brokerageType === 'no_brokerage'
            ? 'No brokerage for this property'
            : property.brokerageType === 'percentage'
              ? `Brokerage: Only ${property.brokerageValue}% on Sale Value`
              : `Brokerage: Just ${property.brokerageValue} Days Rent`}
        </div>

        {property.propertyCode && (
          <p className="mt-2! flex! items-center! justify-center! gap-2! text-[12px]! font-manrope! text-gray-400!">
            <Info className="w-3.5! h-3.5!" />
            ID: {property.propertyCode}
          </p>
        )}
      </div>

      {/* Listed-by card */}
      <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm! flex! items-center! gap-4!">
        <img
          src="/favicon/android-chrome-512x512.png"
          alt="Majestan Realty"
          className="w-14! h-14! rounded-full! object-cover! shrink-0!"
        />
        <div>
          <p className="text-xs! font-manrope! text-gray-500! font-normal! uppercase! tracking-wider! mb-0.5!">
            Listed By
          </p>
          <p className="font-manrope! font-medium! text-base! text-gray-900!">
            Majestan Realty
          </p>
          <p className="text-xs! font-manrope! font-normal! text-gray-500! mt-1! flex! items-center! gap-1.5!">
            <ShieldCheck className="w-3.5! h-3.5! text-emerald-500!" />
            Verified
          </p>
        </div>
      </div>
    </div>
  );
}
