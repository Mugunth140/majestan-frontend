"use client";

import { useState } from "react";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Phone,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Shield,
  Zap,
  Droplets,
  ShieldCheck,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
  ArrowRight,
  Tag,
  Info,
  Ruler,
  Coins,
} from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { FaqSection } from "@/components/site/property/sections/FaqSection";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";

type PropertyDetailsViewProps = {
  property: SeoProperty;
};

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num === 0) return "Price on Request";
  if (num >= 10000000)
    return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (num >= 100000)
    return `₹ ${(num / 100000).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  const images =
    property.images?.length > 0
      ? property.images
      : [
          {
            id: 0,
            imageUrl: "/assets/images/home/apartment-buy.png",
            imageKey: "default",
            isPrimary: true,
            createdAt: "",
          },
        ];

  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const currentImage = images[Math.min(activeImg, images.length - 1)];

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

  const propertyTypeSlug =
    Object.entries(PROPERTY_TYPES).find(
      ([, data]) => data.apiValue === property.propertyType
    )?.[0] || property.propertyType;

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
  const locationLine = [subLocation, property.city, property.state].filter(Boolean).join(", ");

  const areaNum = property.details?.areaSqft ? parseFloat(property.details.areaSqft) : NaN;
  const priceNum = parseFloat(property.price);
  const perSqft =
    Number.isFinite(areaNum) && areaNum > 0 && Number.isFinite(priceNum)
      ? `₹ ${Math.round(priceNum / areaNum).toLocaleString("en-IN")} / sq.ft`
      : null;

  const title = property.seo?.seoData?.overview?.h1 || property.title;

  const sidebarSpecs: { icon: React.ReactNode; label: string; value: string | null }[] = [
    property.details?.bedrooms
      ? { icon: <BedDouble className="w-4.5! h-4.5!" />, label: "BHK", value: `${property.details.bedrooms} BHK` }
      : null,
    property.details?.areaSqft
      ? { icon: <Ruler className="w-4.5! h-4.5!" />, label: "Built-Up Area", value: `${property.details.areaSqft} Sq Ft` }
      : null,
    { icon: <Calendar className="w-4.5! h-4.5!" />, label: "Listed", value: formatDate(property.createdAt) },
    { icon: <Building2 className="w-4.5! h-4.5!" />, label: "Property Type", value: propertyTypeLabel },
  ].filter((s) => s && s.value) as { icon: React.ReactNode; label: string; value: string }[];

  const overviewStats: { icon: React.ReactNode; label: string; value: string }[] = [
    ...(property.details?.bedrooms
      ? [{ icon: <BedDouble className="w-5! h-5!" />, label: "Bedrooms", value: `${property.details.bedrooms} BHK` }]
      : []),
    ...(property.details?.bathrooms
      ? [{ icon: <Bath className="w-5! h-5!" />, label: "Bathrooms", value: `${property.details.bathrooms}` }]
      : []),
    ...(property.details?.areaSqft
      ? [{ icon: <Square className="w-5! h-5!" />, label: "Area", value: `${property.details.areaSqft} sq.ft` }]
      : []),
    ...(property.details?.parking
      ? [{ icon: <Car className="w-5! h-5!" />, label: "Parking", value: `${property.details.parking} Covered` }]
      : []),
    ...(property.details?.furnished != null
      ? [{ icon: <ShieldCheck className="w-5! h-5!" />, label: "Furnishing", value: property.details.furnished ? "Furnished" : "Unfurnished" }]
      : []),
    ...(perSqft
      ? [{ icon: <Tag className="w-5! h-5!" />, label: "Price / Sq.Ft", value: perSqft }]
      : []),
    { icon: <Calendar className="w-5! h-5!" />, label: "Listed On", value: formatDate(property.createdAt) },
    { icon: <Building2 className="w-5! h-5!" />, label: "Property Type", value: propertyTypeLabel },
    ...(property.propertyCode
      ? [{ icon: <Info className="w-5! h-5!" />, label: "Property ID", value: property.propertyCode }]
      : []),
  ];

  // Amenities preview
  const amenitiesPreview = [
    { icon: <Shield className="w-4.5! h-4.5!" />, name: "24/7 Security" },
    { icon: <Zap className="w-4.5! h-4.5!" />, name: "Power Backup" },
    { icon: <Droplets className="w-4.5! h-4.5!" />, name: "Water Supply" },
    ...(property.details?.parking
      ? [
          {
            icon: <Car className="w-4.5! h-4.5!" />,
            name: "Reserved Parking",
          },
        ]
      : []),
    ...(property.details?.furnished
      ? [
          {
            icon: <ShieldCheck className="w-4.5! h-4.5!" />,
            name: "Fully Furnished",
          },
        ]
      : []),
  ];

  // Section quick links
  const sectionLinks = [
    {
      href: `/${property.canonicalSlug}/amenities`,
      label: "Amenities",
      icon: <Sparkles className="w-5! h-5!" />,
      desc: "View all facilities",
    },
    {
      href: `/${property.canonicalSlug}/floor-plan`,
      label: "Floor Plan",
      icon: <Grid3X3 className="w-5! h-5!" />,
      desc: "Layout & configs",
    },
    {
      href: `/${property.canonicalSlug}/locality`,
      label: "Locality",
      icon: <MapPinned className="w-5! h-5!" />,
      desc: "Nearby places",
    },
    {
      href: `/${property.canonicalSlug}/photos`,
      label: "Photos",
      icon: <Images className="w-5! h-5!" />,
      desc: `${images.length} available`,
    },
  ];

  const handleShare = async () => {
    const url = `${window.location.origin}/${property.canonicalSlug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="flex! flex-col! gap-5!">
      {/* Top Actions Bar */}
      <div className="flex! flex-col! sm:flex-row! justify-between! items-start! sm:items-center! gap-4!">
        <Link
          href={`/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`}
          className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! hover:text-gray-900! transition-colors! no-underline!"
        >
          <ChevronLeft className="w-4! h-4!" />
          Back to listings
        </Link>

        <div className="flex! items-center! gap-4!">
          <button
            onClick={handleShare}
            className="inline-flex! items-center! gap-2! px-5! py-2! rounded-xl! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-gray-300! hover:text-gray-900! transition-all! shadow-sm! cursor-pointer!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
            {copied ? "Copied" : "Share"}
          </button>
          <WishlistButton propertyId={property.id} propertyType={property.propertyType} variant="pill" />
        </div>
      </div>

      <div className="grid! grid-cols-1! lg:grid-cols-3! gap-5!">
        {/* Left column */}
        <div className="lg:col-span-2! flex! flex-col! gap-5! min-w-0!">
          {/* Hero gallery */}
          <div className="relative! rounded-[20px]! overflow-hidden! bg-gray-100! h-[300px]! md:h-[430px]! group/gallery!">
            <img
              key={currentImage.imageUrl}
              src={currentImage.imageUrl}
              alt={title}
              className="w-full! h-full! object-cover! animate-fade-in!"
              loading="eager"
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
            <div className="absolute! bottom-4! right-4! flex! items-center! gap-2!">
              {images.length > 1 && (
                <span className="px-3! py-1.5! rounded-full! bg-black/45! backdrop-blur-md! text-white! text-xs! font-medium! tabular-nums!">
                  {activeImg + 1} / {images.length}
                </span>
              )}
              <Link
                href={`/${property.canonicalSlug}/photos`}
                className="inline-flex! items-center! gap-2! px-4! py-2! bg-white/95! backdrop-blur-md! rounded-xl! text-gray-900! text-xs! font-semibold! no-underline! hover:bg-white! transition-all! shadow-sm!"
              >
                <Images className="w-4! h-4!" />
                {images.length} Photos
              </Link>
            </div>
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(property.description, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']) }) }}
              />
            ) : (
              <p className="mt-4! text-gray-500! font-light! italic!">
                Detailed description will be available soon. Contact us for more information.
              </p>
            )}
          </div>

          {/* Locality teaser (renders only when the sublocation has an overview) */}
          {subLocation ? (
            <LocalityTeaser
              locality={subLocation}
              city={property.city}
              localityHref={`/${property.canonicalSlug}/locality`}
            />
          ) : null}

          {/* Amenities card */}
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
              {amenitiesPreview.map((amenity, i) => (
                <div key={i} className="flex! items-center! gap-3!">
                  <div className="text-gray-500!">
                    {amenity.icon}
                  </div>
                  <span className="font-semibold! text-base! text-gray-600!">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explore more card */}
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">Explore More</h2>
            <div className="mt-5! grid! grid-cols-1! sm:grid-cols-2! gap-4!">
              {sectionLinks.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group! flex! items-center! justify-between! p-5! border! border-gray-200! bg-gray-50/60! rounded-2xl! hover:border-gray-300! hover:bg-white! hover:shadow-sm! transition-all! no-underline!"
                >
                  <div className="flex! items-center! gap-4!">
                    <div className="w-11! h-11! flex! items-center! justify-center! text-gray-600! transition-all!">
                      {section.icon}
                    </div>
                    <div>
                      <p className="text-[15px]! font-medium! text-gray-900!">
                        {section.label}
                      </p>
                      <p className="text-[13px]! font-light! text-gray-500! mt-0.5!">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5! h-5! text-gray-400! group-hover:text-gray-900! group-hover:translate-x-0.5! transition-all!" />
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ Section (Overview only) */}
          <FaqSection faqs={(property.faqs || []).filter(f => f.section === 'overview')} />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1! min-w-0!">
          <div className="lg:sticky! lg:top-[140px]! flex! flex-col! gap-5!">
            {/* Info card */}
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm!">
              <div className="flex! items-start! justify-between! gap-3!">
                <h1 className="text-xl! font-normal! text-[#27427f]! leading-snug!">
                  {title} {property.city}
                </h1>
              </div>

              {locationLine ? (
                <p className="mt-2! flex! items-start! gap-2! text-[13px]! text-gray-500! leading-relaxed!">
                  <MapPin className="w-4! h-4! shrink-0! mt-1! text-gray-400!" />
                  {locationLine}
                </p>
              ) : null}

              {sidebarSpecs.length > 0 && (
                <div className="mt-5! pt-5! border-t! border-gray-100! grid! grid-cols-2! gap-x-3! gap-y-5!">
                  {sidebarSpecs.map((spec, i) => (
                    <div key={i} className="flex! items-start! gap-2.5! min-w-0!">
                      <span className="text-gray-400! shrink-0!">{spec.icon}</span>
                      <span className="min-w-0!">
                        <span className="block! text-[12px]! text-gray-400! font-normal! leading-tight!">
                          {spec.label}
                        </span>
                        <span className="block! text-base! font-semibold! text-gray-800! mt-1! leading-snug!">
                          {spec.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5! pt-5! border-t! border-gray-100!">
                <p className="text-xl! font-medium! text-gray-900! tracking-tight!">
                  {formatPrice(property.price)}
                  {!isSale && (
                    <span className="text-sm! font-normal! text-gray-500!"> / mo</span>
                  )}
                </p>
                {perSqft && (
                  <p className="text-[13px]! font-normal! text-gray-500! mt-1!">{perSqft}</p>
                )}
              </div>

              <div className="mt-4! flex! flex-col! gap-2.5!">
                <button className="w-full! bg-[#27427f]! text-white! font-normal! text-base! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!">
                  <Phone className="w-4! h-4!" />
                  Enquire Now
                </button>
                <button className="w-full! bg-white! text-[#27427f]! border! border-[#27427f]/25! hover:bg-[#27427f]/5! font-normal! text-base! py-3! rounded-xl! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!">
                  <Calendar className="w-4! h-4!" />
                  Schedule Visit
                </button>
              </div>

              <div className="mt-5! pt-3! border-t! border-gray-100! flex! items-center! justify-center! gap-1! text-[13px]! font-normal! text-gray-500! ">
                <Coins  className="w-4! h-4! text-yellow-500! shrink-0!" />
                {!property.brokerageType || property.brokerageType === 'no_brokerage'
                  ? 'No brokerage for this property'
                  : property.brokerageType === 'percentage'
                    ? `Brokerage: Only ${property.brokerageValue}% on Sale Value`
                    : `Brokerage: Just ${property.brokerageValue} Days Rent`}
              </div>

              {property.propertyCode && (
                <p className="mt-2! flex! items-center! justify-center! gap-2! text-[12px]! text-gray-400!">
                  <Info className="w-3.5! h-3.5!" />
                  ID: {property.propertyCode}
                </p>
              )}
            </div>

            {/* Listed-by card */}
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm! flex! items-center! gap-4!">
              <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
                <Building2 className="w-6! h-6! text-gray-600!" />
              </div>
              <div>
                <p className="text-xs! text-gray-500! font-normal! uppercase! tracking-wider! mb-0.5!">
                  Listed By
                </p>
                <p className="font-medium! text-base! text-gray-900!">
                  Majestan Realty
                </p>
                <p className="text-xs! font-light! text-gray-500! mt-1! flex! items-center! gap-1.5!">
                  <ShieldCheck className="w-3.5! h-3.5! text-emerald-500!" />
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
