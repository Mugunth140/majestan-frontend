"use client";

import { useState } from "react";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import { formatDate, formatFurnishing } from "@/lib/property-format";
import {
  BedDouble,
  Bath,
  Square,
  Car,
  Layers,
  Building2,
  Calendar,
  ShieldCheck,
  Tag,
  Info,
} from "lucide-react";
import { getPropertyFloorPlans } from "@/lib/property-floor-plans";
import { getAdditionalPropertyDetails } from "@/lib/property-detail-rows";
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
import { PropertyGallery } from "./PropertyGallery";
import { OV_ROOT, Panel, PanelLink, IconMark } from "@/components/site/project/overview/overview-ui";
import { TEXT_LINK } from "@/components/site/project/project-ui";
import { PropertyFinanceSection } from "./PropertyFinanceSection";
import { PropertyFurnishingSection } from "./PropertyFurnishingSection";
import styles from "./property-details.module.css";
import { PropertyInfoSidebar } from "@/components/site/property/PropertyInfoSidebar";
import { PropertyDescriptionPreview } from "@/components/site/property/PropertyDescriptionPreview";
import { PropertyTopActions } from "@/components/site/property/PropertyTopActions";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";
import { capFirst, getSublocation, type LocationRecord } from "@/lib/location-display";

type PropertyDetailsViewProps = {
  property: SeoProperty;
};

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  const [showAllPropertyDetails, setShowAllPropertyDetails] = useState(false);
  // Single-page types stack every section on this overview with anchor ids;
  // multi-page types keep the teaser cards linking out to subpages.
  const isSingle = isSinglePageType(property.propertyType);
  const faqsFor = (section: string) =>
    (property.faqs || []).filter((f) => f.section === section);
  // Single-page types show a section only when it has at least one data item.
  const visibleSections = isSingle ? getVisibleSingleSections(property) : [];
  const showSection = (id: "amenities" | "floor-plan" | "locality" | "photos") =>
    visibleSections.includes(id);

  const propertyTypeLabel =
    Object.values(PROPERTY_TYPES).find(
      (p) => p.apiValue === property.propertyType
    )?.label ||
    property.propertyType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const locRow = property.locations?.[0] as LocationRecord | undefined;
  const rawSub =
    (property as SeoProperty & { sublocation?: string }).sublocation ||
    (property as SeoProperty & { locality?: string }).locality ||
    getSublocation(locRow);
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
  // Land is priced per cent or not at all — never per sq.ft.
  const perSqft =
    getLandPricePerUnit(property.price, property.details, property.propertyType) ??
    (!isLand && Number.isFinite(areaNum) && areaNum > 0 && Number.isFinite(priceNum)
      ? `₹ ${Math.round(priceNum / areaNum).toLocaleString("en-IN")} / sq.ft`
      : null);

  const baseOverviewStats: { icon: React.ReactNode; label: string; value: string; wide?: boolean }[] = [
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
      ? [{ icon: <Square className="w-5! h-5!" />, label: "Area", value: `${Number(property.details.areaSqft).toLocaleString("en-IN", { maximumFractionDigits: 2 })} sq.ft` }]
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

  const overviewStats = [
    ...baseOverviewStats,
    ...getAdditionalPropertyDetails(property, baseOverviewStats.map((stat) => stat.label)).map((row) => {
      const Icon = row.icon;
      return { ...row, icon: <Icon className="w-5! h-5!" /> };
    }),
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

  const floorPlanPreviews = getPropertyFloorPlans(property);

  return (
    <div className={`${OV_ROOT} ${styles.root}`}>
      <PropertyTopActions property={property} />
      <div className={styles.columns}>
        <div className={styles.content}>
          <div {...(isSingle ? { id: "overview" } : {})} className="scroll-mt-40!">
            <PropertyGallery key={property.canonicalSlug} property={property} singlePage={isSingle} />
          </div>
          {/* Overview card */}
          {overviewStats.length > 0 && (
            <Panel id="property-details" title="Property details">
              <div id="property-details-grid" className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! sm:grid-cols-3! gap-x-4! gap-y-6!">
                {overviewStats.map((stat, index) => {
                  const collapsedVisibility = showAllPropertyDetails
                    ? ""
                    : index >= 6
                      ? "hidden!"
                      : index >= 4
                        ? "hidden! sm:flex!"
                        : "";
                  return (
                    <div key={stat.label} className={`flex! items-start! gap-3! min-w-0! ${stat.wide ? "col-span-2! sm:col-span-3!" : ""} ${collapsedVisibility}`}>
                      <div className="w-10! h-10! rounded-xl! bg-[#eef4ff]! flex! items-center! justify-center! text-[#1645bf]! shrink-0!">
                        {stat.icon}
                      </div>
                      <div className="min-w-0!">
                        <p className="text-xs! text-[#5f6b80]! font-medium! leading-tight!">
                          {stat.label}
                        </p>
                        <p className={`text-sm! font-semibold! text-gray-900! mt-1! leading-snug! break-words! ${stat.wide ? "whitespace-pre-line!" : ""}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {overviewStats.length > 4 && (
                <button
                  type="button"
                  aria-controls="property-details-grid"
                  aria-expanded={showAllPropertyDetails}
                  onClick={() => setShowAllPropertyDetails((show) => !show)}
                  className={`${TEXT_LINK} mt-5! inline-flex! text-sm! font-semibold! sm:hidden!`}
                >
                  {showAllPropertyDetails ? "Show less" : "View more"}
                </button>
              )}
              {overviewStats.length > 6 && (
                <button
                  type="button"
                  aria-controls="property-details-grid"
                  aria-expanded={showAllPropertyDetails}
                  onClick={() => setShowAllPropertyDetails((show) => !show)}
                  className={`${TEXT_LINK} mt-5! hidden! text-sm! font-semibold! sm:inline-flex!`}
                >
                  {showAllPropertyDetails ? "Show less" : "View more"}
                </button>
              )}
            </Panel>
          )}

          {/* About card */}
          <Panel id="about-property" title={`About ${property.title}`}>
            {property.description ? (
              <PropertyDescriptionPreview description={property.description} />
            ) : (
              <p className="mt-4! text-gray-500! font-normal!">
                Detailed description will be available soon. Contact us for more information.
              </p>
            )}
          </Panel>

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
              <Panel id="amenities-preview" title="Key amenities" meta={`${amenityNames.length} amenities at a glance`}
                action={<PanelLink href={`/${property.canonicalSlug}/amenities`}>View All</PanelLink>}>
                <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! md:grid-cols-3! gap-6!">
                  {amenityNames.map((name) => {
                    const Icon = getIconForAmenity(name);
                    return (
                      <div key={name} className="flex! items-center! gap-3!">
                        <IconMark Icon={Icon} />
                        <span className="font-medium! text-sm! text-[#1c2433]!">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Panel>
              )}

              <PropertyFurnishingSection property={property} preview />

              {/* Project floor-plan viewer with this property’s drawings and measurements */}
              <FloorPlanTeaser
                plans={floorPlanPreviews}
                propertyTitle={property.title}
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

          <PropertyFinanceSection property={property} />

          {/* FAQ Section (Overview only) */}
          <FaqSection faqs={faqsFor("overview")} />

          {/* Shared contact call-to-action, identical on every page */}
          <NeedMoreDetails propertyType={property.propertyType} />
        </div>

        {/* Right sidebar — the same card shown on every sub-page */}
        <aside aria-label="Enquire about this property" className={styles.aside}>
          <PropertyInfoSidebar property={property} />
        </aside>
      </div>
    </div>
  );
}
