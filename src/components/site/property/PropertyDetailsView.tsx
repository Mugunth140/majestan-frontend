"use client";

import { useState } from "react";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { formatDate, formatDescriptionParagraphs, formatFurnishing } from "@/lib/property-format";
import {
  BedDouble,
  Bath,
  Square,
  Car,
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  ShieldCheck,
  Images,
  ArrowRight,
  Tag,
  Info,
} from "lucide-react";
import { PROPERTY_TYPES, isSinglePageType } from "@/lib/seo-urls";
import {
  getCommercialSpecs,
  getCoworkingSpecs,
  getFarmlandSpecs,
  getIndustrialSpecs,
  getLandPricePerUnit,
  getPlotSpecs,
  getVisibleSingleSections,
} from "@/lib/property-sections";
import { FaqSection } from "@/components/site/property/sections/FaqSection";
import { AmenitiesSection, getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";
import { FloorPlanSection } from "@/components/site/property/sections/FloorPlanSection";
import { LocalitySection } from "@/components/site/property/sections/LocalitySection";
import { PhotosSection } from "@/components/site/property/sections/PhotosSection";
import { FloorPlanTeaser } from "@/components/site/property/FloorPlanTeaser";
import { PhotosTeaser } from "@/components/site/property/PhotosTeaser";
import { PropertyInfoSidebar } from "@/components/site/property/PropertyInfoSidebar";
import { PropertyTopActions } from "@/components/site/property/PropertyTopActions";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";

type PropertyDetailsViewProps = {
  property: SeoProperty;
};

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  // Single-page types stack every section on this overview with anchor ids;
  // multi-page types keep the teaser cards linking out to subpages.
  const isSingle = isSinglePageType(property.propertyType);
  const faqsFor = (section: string) =>
    (property.faqs || []).filter((f) => f.section === section);
  // Single-page types show a section only when it has at least one data item.
  const visibleSections = isSingle ? getVisibleSingleSections(property) : [];
  const showSection = (id: "amenities" | "floor-plan" | "locality" | "photos") =>
    visibleSections.includes(id);

  const images = property.images ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const currentImage = images.length > 0 ? images[Math.min(activeImg, images.length - 1)] : undefined;
  const placeholderUrl = getPlaceholderImage({ propertyType: property.propertyType });

  const propertyTypeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label ||
    property.propertyType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const listingType = property.status.toLowerCase().includes("rent")
    ? "for-rent"
    : "for-sale";
  const isSale = listingType === "for-sale";

  const locData = property.locations?.[0]?.localityData;
  const locRow = property.locations?.[0] as unknown as
    | { address?: string | null; landmark?: string | null }
    | undefined;
  const addrPart = (locRow?.address || locRow?.landmark || "").split(",")[0].trim();
  const rawSub =
    (property as any).sublocation ||
    (property as any).locality ||
    (locData as any)?.subLocation ||
    (locData as any)?.locality ||
    addrPart;
  const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const subLocation = rawSub && rawSub.toLowerCase() !== property.city.toLowerCase() ? capFirst(rawSub) : "";

  const areaNum = property.details?.areaSqft ? parseFloat(property.details.areaSqft) : NaN;
  const priceNum = parseFloat(property.price);
  // Land is priced per cent, never per sq.ft — and only land-relevant rows
  // show for plot/farmland (no beds/baths/parking/furnishing).
  const isLand = property.propertyType === "plot" || property.propertyType === "farmland";
  const landSpecs =
    property.propertyType === "plot"
      ? getPlotSpecs(property.details)
      : property.propertyType === "farmland"
        ? getFarmlandSpecs(property.details)
        : [];
  // Workspace types curate their own rows too — the generic building rows
  // below stay hidden for them, same as land.
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
  const hasLandArea = landSpecs.some(
    (r) => r.label === "Plot Area" || r.label === "Farm Area"
  );
  const perSqft =
    getLandPricePerUnit(property.price, property.details, property.propertyType) ??
    (Number.isFinite(areaNum) && areaNum > 0 && Number.isFinite(priceNum)
      ? `₹ ${Math.round(priceNum / areaNum).toLocaleString("en-IN")} / sq.ft`
      : null);

  const title = property.seo?.seoData?.overview?.h1 || property.title;

  const overviewStats: { icon: React.ReactNode; label: string; value: string }[] = [
    ...(!isLand && !isWorkspace && property.details?.bedrooms
      ? [{ icon: <BedDouble className="w-5! h-5!" />, label: "Bedrooms", value: `${property.details.bedrooms} BHK` }]
      : []),
    ...(!isLand && !isWorkspace && property.details?.bathrooms
      ? [{ icon: <Bath className="w-5! h-5!" />, label: "Bathrooms", value: `${property.details.bathrooms}` }]
      : []),
    // Apartment-only: floor over total, shown only when both are stored.
    // A zero/empty half means "not stored", never rendered as-is.
    ...(property.propertyType === "apartment" &&
    property.details?.floorNumber != null &&
    property.details.floorNumber !== "" &&
    Number(property.details?.totalFloors) > 0
      ? [{ icon: <Layers className="w-5! h-5!" />, label: "Floor No", value: `${property.details.floorNumber} / ${property.details.totalFloors}` }]
      : []),
    ...(!hasLandArea && !isWorkspace && property.details?.areaSqft
      ? [{ icon: <Square className="w-5! h-5!" />, label: "Area", value: `${property.details.areaSqft} sq.ft` }]
      : []),
    ...(!isLand && !isWorkspace && property.details?.parking
      ? [{ icon: <Car className="w-5! h-5!" />, label: "Parking", value: `${property.details.parking} Covered` }]
      : []),
    ...(!isLand && !isWorkspace && formatFurnishing(property.details)
      ? [{ icon: <ShieldCheck className="w-5! h-5!" />, label: "Furnishing", value: formatFurnishing(property.details) as string }]
      : []),
    ...(perSqft
      ? [
          {
            icon: <Tag className="w-5! h-5!" />,
            label: perSqft.includes("/cent") ? "Price / Cent" : "Price / Sq.Ft",
            value: perSqft,
          },
        ]
      : []),
    ...landSpecs.map((spec) => {
      const Icon = spec.icon;
      return { icon: <Icon className="w-5! h-5!" />, label: spec.label, value: spec.value };
    }),
    ...workspaceSpecs.map((spec) => {
      const Icon = spec.icon;
      return { icon: <Icon className="w-5! h-5!" />, label: spec.label, value: spec.value };
    }),
    { icon: <Calendar className="w-5! h-5!" />, label: "Listed On", value: formatDate(property.createdAt) },
    { icon: <Building2 className="w-5! h-5!" />, label: "Property Type", value: propertyTypeLabel },
    ...(property.propertyCode
      ? [{ icon: <Info className="w-5! h-5!" />, label: "Property ID", value: property.propertyCode }]
      : []),
  ];

  // Amenities preview — real tags only, never a hardcoded fallback.
  // Normalized amenities first, raw join as fallback (tests and older
  // payloads carry either shape).
  const normalizedNames = (property.amenities ?? [])
    .map((a) => a.amenity?.name)
    .filter((n): n is string => !!n && n.trim() !== "");
  const rawNames = (
    (property as unknown as { propertyAmenities?: { amenity?: { name?: string } }[] })
      .propertyAmenities ?? []
  )
    .map((pa) => pa.amenity?.name)
    .filter((n): n is string => !!n && n.trim() !== "");
  const amenityNames = (normalizedNames.length > 0 ? normalizedNames : rawNames).slice(0, 6);

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="flex! flex-col! gap-5!">
      <PropertyTopActions property={property} />

      <div className="grid! grid-cols-1! lg:grid-cols-3! gap-5!">
        {/* Left column */}
        <div className="lg:col-span-2! flex! flex-col! gap-5! min-w-0!">
          {/* Hero gallery (the #overview anchor on single-page types) */}
          <div
            {...(isSingle ? { id: "overview" } : {})}
            className={`relative! rounded-[20px]! overflow-hidden! bg-gray-100! h-[300px]! md:h-[430px]! group/gallery${isSingle ? " scroll-mt-40!" : ""}`}
          >
            <ListingImage
              key={currentImage?.imageUrl ?? "placeholder"}
              src={currentImage?.imageUrl ?? null}
              placeholderSrc={placeholderUrl}
              alt={title}
              eager
              className="w-full! h-full! object-cover! animate-fade-in!"
            />
            <div className="absolute! inset-0! bg-gradient-to-t! from-black/25! via-transparent! to-transparent! pointer-events-none!" />

            {/* Overlay badges */}
            <div className="absolute! top-4! right-4! flex! gap-2!">
              <span
                className={`inline-flex! items-center! px-4! py-2! rounded-xl! text-xs! font-semibold! backdrop-blur-md! ${isSale ? "bg-[#27427f]/95! text-white!" : "bg-gray-900/85! text-white!"}`}
              >
                {isSale ? "For Sale" : "For Rent"}
              </span>
              <span className="inline-flex! items-center! px-4! py-2! rounded-xl! bg-white/95! backdrop-blur-md! text-gray-900! text-xs! font-semibold! shadow-sm!">
                {propertyTypeLabel}
              </span>
            </div>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  aria-label="Previous photo"
                  className="absolute! left-4! top-1/2! -translate-y-1/2! h-10! w-10! items-center! justify-center! rounded-full! bg-black/45! backdrop-blur-md! text-white! hover:bg-black/65! transition-all! cursor-pointer! hidden! group-hover/gallery:flex!"
                >
                  <ChevronLeft className="w-5! h-5!" />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Next photo"
                  className="absolute! right-4! top-1/2! -translate-y-1/2! flex! h-10! w-10! items-center! justify-center! rounded-full! bg-black/45! backdrop-blur-md! text-white! hover:bg-black/65! transition-all! cursor-pointer!"
                >
                  <ChevronRight className="w-5! h-5!" />
                </button>
              </>
            )}

            {/* Counter + photos button */}
            {images.length > 0 && (
            <div className="absolute! bottom-4! right-4! flex! items-center! gap-2!">
              {images.length > 1 && (
                <span className="px-3! py-1.5! rounded-full! bg-black/45! backdrop-blur-md! text-white! text-xs! font-medium! tabular-nums!">
                  {activeImg + 1} / {images.length}
                </span>
              )}
              <Link
                href={isSingle ? "#photos" : `/${property.canonicalSlug}/photos`}
                className="inline-flex! items-center! gap-2! px-4! py-2! bg-white/95! backdrop-blur-md! rounded-xl! text-gray-900! text-xs! font-semibold! no-underline! hover:bg-white! transition-all! shadow-sm!"
              >
                <Images className="w-4! h-4!" />
                {images.length} Photos
              </Link>
            </div>
            )}
          </div>

          {/* Overview card */}
          {overviewStats.length > 0 && (
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
              <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">
                Property Overview of {title}
              </h2>
              <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! sm:grid-cols-3! gap-x-4! gap-y-7!">
                {overviewStats.map((stat, i) => (
                  <div key={i} className="flex! items-start! gap-1.5! min-w-0!">
                    <div className="w-12! h-12! flex! items-center! justify-center! text-[#27427f]! shrink-0!">
                      {stat.icon}
                    </div>
                    <div className="min-w-0!">
                      <p className="text-[12px]! text-gray-400! font-normal! leading-tight!">
                        {stat.label}
                      </p>
                      <p className="text-[14px]! font-semibold! text-gray-900! mt-1! leading-snug! break-words!">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About card */}
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">About this Property</h2>
            {property.description ? (
              <div
                className="mt-4! prose! max-w-none! text-gray-500! font-normal! leading-relaxed! text-medium! [&_p]:mb-6! [&_h3]:text-xl! [&_h3]:font-semibold! [&_h3]:text-gray-900! [&_h3]:mt-10! [&_h3]:mb-4! [&_ul]:list-disc! [&_ul]:pl-5! [&_li]:mb-2! [&_strong]:font-medium! [&_strong]:text-gray-900!"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatDescriptionParagraphs(property.description), { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']) }) }}
              />
            ) : (
              <p className="mt-4! text-gray-500! font-light! italic!">
                Detailed description will be available soon. Contact us for more information.
              </p>
            )}
          </div>

          {isSingle ? (
            <>
              {/* Single-page types: full sections stacked with anchor ids.
                  Embedded sections skip their own CTA — one page-level CTA below. */}
              {showSection("amenities") && (
                <section id="amenities" className="scroll-mt-40! flex! flex-col! gap-5! min-w-0!">
                  <AmenitiesSection property={property} embedded />
                </section>
              )}
              {showSection("floor-plan") && (
                <section id="floor-plan" className="scroll-mt-40! flex! flex-col! gap-5! min-w-0!">
                  <FloorPlanSection property={property} embedded />
                </section>
              )}
              {showSection("locality") && (
                <section id="locality" className="scroll-mt-40! flex! flex-col! gap-5! min-w-0!">
                  <LocalitySection property={property} embedded />
                </section>
              )}
              {showSection("photos") && (
                <section id="photos" className="scroll-mt-40! flex! flex-col! gap-5! min-w-0!">
                  <PhotosSection property={property} embedded />
                </section>
              )}
            </>
          ) : (
            <>
              {/* Locality teaser (renders only when the sublocation has an overview) */}
              {subLocation ? (
                <LocalityTeaser
                  locality={subLocation}
                  city={property.city}
                  localityHref={`/${property.canonicalSlug}/locality`}
                />
              ) : null}

          {/* Amenities card — real tags only; hidden when the listing has none */}
          {amenityNames.length > 0 && (
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <div className="flex! items-center! justify-between!">
              <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">Key Amenities</h2>
              <Link
                href={`/${property.canonicalSlug}/amenities`}
                className="inline-flex! items-center! gap-2! text-sm! font-medium! text-[#27427f]! hover:text-[#1a2d59]! transition-colors! no-underline!"
              >
                View All
              </Link>
            </div>
            <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! md:grid-cols-3! gap-6!">
              {amenityNames.map((name) => {
                const Icon = getIconForAmenity(name);
                return (
                  <div key={name} className="flex! items-center! gap-3!">
                    <div className="text-gray-500!">
                      <Icon className="w-4.5! h-4.5!" />
                    </div>
                    <span className="font-semibold! text-base! text-gray-600!">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          )}

              {/* Floor plan teaser: key measurements only, linking to the sub-page */}
              <FloorPlanTeaser
                details={property.details}
                floorPlanHref={`/${property.canonicalSlug}/floor-plan`}
              />

              {/* Photos teaser: primary-first strip with overflow count, hidden when empty */}
              <PhotosTeaser
                images={property.images ?? []}
                title={property.title}
                photosHref={`/${property.canonicalSlug}/photos`}
              />
            </>
          )}

          {/* FAQ Section (Overview only) */}
          <FaqSection faqs={faqsFor("overview")} />

          {/* Shared contact call-to-action, identical on every page */}
          <NeedMoreDetails propertyType={property.propertyType} />
        </div>

        {/* Right sidebar — the same card shown on every sub-page */}
        <div className="lg:col-span-1! min-w-0!">
          <PropertyInfoSidebar property={property} />
        </div>
      </div>
    </div>
  );
}
