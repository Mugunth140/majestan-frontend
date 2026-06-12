import Link from "next/link";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Phone,
  Share2,
  Heart,
  ChevronLeft,
  Building2,
  Calendar,
  Compass,
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
  Clock,
  Info,
} from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/seo-urls";

type PropertyDetailsViewProps = {
  property: SeoProperty;
};

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num >= 10000000)
    return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (num >= 100000)
    return `₹ ${(num / 100000).toFixed(2).replace(/\.?0+$/, "")} Lac`;
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

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const galleryImages = images.slice(1, 5);

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

  // Quick stat cards data
  const quickStats = [
    property.details?.bedrooms
      ? {
          icon: <BedDouble className="w-5! h-5!" />,
          label: "Bedrooms",
          value: `${property.details.bedrooms} BHK`,
        }
      : null,
    property.details?.bathrooms
      ? {
          icon: <Bath className="w-5! h-5!" />,
          label: "Bathrooms",
          value: `${property.details.bathrooms}`,
        }
      : null,
    property.details?.areaSqft
      ? {
          icon: <Square className="w-5! h-5!" />,
          label: "Area",
          value: `${property.details.areaSqft} sq.ft`,
        }
      : null,
    property.details?.parking
      ? {
          icon: <Car className="w-5! h-5!" />,
          label: "Parking",
          value: `${property.details.parking} Covered`,
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

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

  return (
    <div className="bg-[#fafafa]! min-h-screen! pb-24!">
      <div className="container! mx-auto! px-4! sm:px-6! py-8! max-w-7xl!">
        {/* Top Actions Bar */}
        <div className="flex! flex-col! sm:flex-row! justify-between! items-start! sm:items-center! gap-4! mb-8!">
          <Link
            href={`/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`}
            className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! hover:text-gray-900! transition-colors! no-underline!"
          >
            <ChevronLeft className="w-4! h-4!" />
            Back to listings
          </Link>

          <div className="flex! items-center! gap-4!">
            <button className="inline-flex! items-center! gap-2! px-5! py-2! rounded-full! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-gray-300! hover:text-gray-900! transition-all! shadow-sm!">
              <Share2 className="w-4! h-4!" />
              Share
            </button>
            <button className="inline-flex! items-center! gap-2! px-5! py-2! rounded-full! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-red-200! hover:text-red-600! hover:bg-red-50! transition-all! shadow-sm!">
              <Heart className="w-4! h-4!" />
              Save
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="mb-12!">
          <div className="grid! grid-cols-1! md:grid-cols-4! gap-2! h-[400px]! md:h-[500px]! rounded-[24px]! overflow-hidden!">
            <div
              className={`relative! ${galleryImages.length > 0 ? "md:col-span-3!" : "md:col-span-4!"} h-full! group!`}
            >
              <img
                src={primaryImage.imageUrl}
                alt={property.title}
                className="w-full! h-full! object-cover! transition-transform! duration-[2000ms]! ease-out! group-hover:scale-105!"
                loading="eager"
              />
              <div className="absolute! inset-0! bg-black/10! group-hover:bg-black/5! transition-colors! duration-500!" />
              
              <div className="absolute! top-6! left-6! flex! gap-3!">
                <span className="px-4! py-1.5! bg-white/95! backdrop-blur-md! rounded-full! text-xs! font-medium! tracking-wide! text-gray-900! shadow-sm!">
                  {propertyTypeLabel}
                </span>
                <span
                  className={`px-4! py-1.5! rounded-full! text-xs! font-medium! tracking-wide! shadow-sm! backdrop-blur-md! ${isSale ? "bg-[#27427f]/95! text-white!" : "bg-white/95! text-gray-900!"}`}
                >
                  {isSale ? "For Sale" : "For Rent"}
                </span>
              </div>
              
              <Link
                href={`/${property.canonicalSlug}/photos`}
                className="absolute! bottom-6! right-6! inline-flex! items-center! gap-2! px-5! py-2.5! bg-white/95! backdrop-blur-md! rounded-full! text-gray-900! text-sm! font-medium! no-underline! hover:bg-white! transition-all! shadow-sm!"
              >
                <Images className="w-4.5! h-4.5!" />
                {images.length} Photos
              </Link>
            </div>

            {galleryImages.length > 0 && (
              <div className="hidden! md:grid! grid-cols-1! grid-rows-2! gap-2! h-full!">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <div
                    key={img.id}
                    className="relative! h-full! group!"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${property.title} - View ${i + 2}`}
                      className="w-full! h-full! object-cover! transition-transform! duration-700! group-hover:scale-105! cursor-pointer!"
                      loading="lazy"
                    />
                    <div className="absolute! inset-0! bg-black/10! group-hover:bg-black/0! transition-colors! duration-300!" />
                    {i === 1 && images.length > 3 && (
                      <Link
                         href={`/${property.canonicalSlug}/photos`}
                        className="absolute! inset-0! bg-black/40! backdrop-blur-sm! flex! items-center! justify-center! cursor-pointer! hover:bg-black/50! transition-colors! no-underline!"
                      >
                        <span className="text-white! font-medium! text-lg! tracking-wide!">
                          +{images.length - 3} More
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid! grid-cols-1! lg:grid-cols-3! gap-12!">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2! space-y-12!">
            
            {/* Header Info */}
            <div className="border-b! border-gray-200! pb-10!">
              <div className="flex! items-center! gap-2! text-gray-500! mb-4!">
                <MapPin className="w-4! h-4!" />
                <span className="text-sm! font-normal! tracking-wide!">
                  {property.city}
                  {property.state ? `, ${property.state}` : ""}
                </span>
              </div>
              <div className="flex! flex-col! md:flex-row! items-start! justify-between! gap-6!">
                <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! leading-tight! tracking-tight!">
                  {property.seo?.seoData?.overview?.h1 || property.title}
                </h1>
                <div className="text-left! md:text-right! shrink-0!">
                  <p className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight!">
                    {formatPrice(property.price)}
                  </p>
                  {property.details?.areaSqft &&
                    !isNaN(parseFloat(property.price)) && (
                      <p className="text-sm! font-normal! text-gray-500! mt-2!">
                        ₹{" "}
                        {Math.round(
                          parseFloat(property.price) /
                            parseFloat(property.details.areaSqft)
                        ).toLocaleString("en-IN")}{" "}
                        / sq.ft
                      </p>
                    )}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex! flex-wrap! items-center! gap-4! mt-8! text-sm! font-light! text-gray-500!">
                <div className="flex! items-center! gap-2!">
                  <Calendar className="w-4! h-4!" />
                  Listed {formatDate(property.createdAt)}
                </div>
                <span className="w-1! h-1! rounded-full! bg-gray-300!"></span>
                <div className="flex! items-center! gap-2!">
                  <Tag className="w-4! h-4!" />
                  {propertyTypeLabel}
                </div>
                {property.propertyCode && (
                  <>
                    <span className="w-1! h-1! rounded-full! bg-gray-300!"></span>
                    <div className="flex! items-center! gap-2!">
                      <Info className="w-4! h-4!" />
                      ID: {property.propertyCode}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            {quickStats.length > 0 && (
              <div>
                <h2 className="text-lg! font-semibold! text-gray-900! mb-6!">Overview</h2>
                <div className="grid! grid-cols-2! sm:grid-cols-4! gap-6!">
                  {quickStats.map((stat, i) => (
                    <div key={i} className="flex! flex-col! gap-2!">
                      <div className="w-10! h-10! rounded-full! border! border-gray-200! flex! items-center! justify-center! text-gray-600!">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs! text-gray-500! font-normal! uppercase! tracking-widest! mb-0.5!">
                          {stat.label}
                        </p>
                        <p className="text-base! font-medium! text-gray-900!">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pt-10! border-t! border-gray-200!">
              <h2 className="text-lg! font-semibold! text-gray-900! mb-6!">About this Property</h2>
              {property.description ? (
                <div
                  className="prose! max-w-none! text-gray-600! font-light! leading-loose! [&_p]:mb-6! [&_h3]:text-xl! [&_h3]:font-semibold! [&_h3]:text-gray-900! [&_h3]:mt-10! [&_h3]:mb-4! [&_ul]:list-disc! [&_ul]:pl-5! [&_li]:mb-2! [&_strong]:font-medium! [&_strong]:text-gray-900!"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              ) : (
                <p className="text-gray-500! font-light! italic!">
                  Detailed description will be available soon. Contact us for more information.
                </p>
              )}
            </div>

            {/* Amenities Preview */}
            <div className="pt-10! border-t! border-gray-200!">
              <div className="flex! items-center! justify-between! mb-8!">
                <h2 className="text-lg! font-semibold! text-gray-900!">Key Amenities</h2>
                <Link
                  href={`/${property.canonicalSlug}/amenities`}
                  className="inline-flex! items-center! gap-2! text-sm! font-medium! text-[#27427f]! hover:text-[#1a2d59]! transition-colors! no-underline!"
                >
                  View All
                  <ArrowRight className="w-4! h-4!" />
                </Link>
              </div>
              <div className="grid! grid-cols-2! md:grid-cols-3! gap-6!">
                {amenitiesPreview.map((amenity, i) => (
                  <div key={i} className="flex! items-center! gap-3!">
                    <div className="text-gray-400!">
                      {amenity.icon}
                    </div>
                    <span className="font-normal! text-sm! text-gray-700!">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore More Sections */}
            <div className="pt-10! border-t! border-gray-200!">
              <h2 className="text-lg! font-semibold! text-gray-900! mb-6!">Explore More</h2>
              <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4!">
                {sectionLinks.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group! flex! items-center! justify-between! p-6! border! border-gray-200! bg-white! rounded-[20px]! hover:border-gray-300! hover:shadow-sm! transition-all! no-underline!"
                  >
                    <div className="flex! items-center! gap-4!">
                      <div className="w-12! h-12! rounded-full! bg-gray-50! flex! items-center! justify-center! text-gray-600! group-hover:bg-white! transition-all!">
                        {section.icon}
                      </div>
                      <div>
                        <p className="text-base! font-medium! text-gray-900!">
                          {section.label}
                        </p>
                        <p className="text-sm! font-light! text-gray-500! mt-0.5!">
                          {section.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5! h-5! text-gray-300! rotate-180! group-hover:text-gray-900! transition-colors!" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1!">
            <div className="sticky! top-[140px]! space-y-6!">
              
              {/* Pricing & Contact Card */}
              <div className="bg-white! rounded-[24px]! p-8! border! border-gray-200! shadow-[0_4px_20px_rgb(0,0,0,0.03)]!">
                <div className="mb-8!">
                  <p className="text-gray-500! font-normal! text-sm! tracking-wide! uppercase! mb-2!">
                    {isSale ? "Asking Price" : "Monthly Rent"}
                  </p>
                  <div className="flex! items-baseline! gap-2!">
                    <h2 className="text-3xl! font-semibold! text-gray-900! tracking-tight!">
                      {formatPrice(property.price)}
                    </h2>
                    {!isSale && (
                      <span className="text-sm! font-light! text-gray-500!">
                        / mo
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4!">
                  <button className="w-full! bg-gray-900! text-white! font-medium! text-base! py-3.5! rounded-full! hover:bg-gray-800! transition-all! flex! items-center! justify-center! gap-2!">
                    <Phone className="w-4.5! h-4.5!" />
                    Contact Owner
                  </button>

                  <button className="w-full! bg-white! text-gray-900! border! border-gray-300! hover:border-gray-900! hover:bg-gray-50! font-medium! text-base! py-3.5! rounded-full! transition-all! flex! items-center! justify-center! gap-2!">
                    <Calendar className="w-4.5! h-4.5!" />
                    Schedule Visit
                  </button>
                </div>
                
                <div className="mt-6! pt-6! border-t! border-gray-100! flex! items-center! justify-center! gap-2! text-sm! font-normal! text-gray-500!">
                  <ShieldCheck className="w-4! h-4! text-emerald-500!" />
                  {!property.brokerageType || property.brokerageType === 'no_brokerage' 
                    ? 'No brokerage for this property' 
                    : property.brokerageType === 'percentage' 
                      ? `Brokerage: Only ${property.brokerageValue}% on Sale Value` 
                      : `Brokerage: Just ${property.brokerageValue} Days Rent`}
                </div>
              </div>

              {/* Agent/Owner Info */}
              <div className="bg-white! rounded-[24px]! p-6! border! border-gray-200! flex! items-center! gap-4!">
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
                    Verified Partner
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
