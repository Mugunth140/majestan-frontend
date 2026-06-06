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

  const listingType = property.status.toLowerCase().includes("rent") || property.listingType === "Rent"
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
    <div className="bg-[#f2f5f9]! min-h-screen! pb-24!">
      <div className="container! mx-auto! px-4! sm:px-6! py-6! max-w-7xl!">
        {/* Top Actions Bar */}
        <div className="flex! flex-col! sm:flex-row! justify-between! items-start! sm:items-center! gap-4! mb-6!">
          <Link
            href={`/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`}
            className="inline-flex! items-center! gap-2! text-sm! font-bold! text-[#27427f]/70! hover:text-[#27427f]! transition-colors! no-underline! bg-white/50! backdrop-blur-md! px-4! py-2! rounded-xl! shadow-sm!"
          >
            <ChevronLeft className="w-4! h-4!" />
            Back to listings
          </Link>

          <div className="flex! items-center! gap-3!">
            <button className="inline-flex! items-center! gap-2! px-5! py-2.5! rounded-xl! bg-white! border! border-gray-100! text-sm! font-bold! text-[#27427f]! hover:bg-[#27427f]/5! hover:-translate-y-0.5! transition-all! shadow-[0_4px_12px_rgba(0,0,0,0.03)]!">
              <Share2 className="w-4! h-4!" />
              Share
            </button>
            <button className="inline-flex! items-center! gap-2! px-5! py-2.5! rounded-xl! bg-white! border! border-gray-100! text-sm! font-bold! text-red-500! hover:bg-red-50! hover:-translate-y-0.5! transition-all! shadow-[0_4px_12px_rgba(0,0,0,0.03)]!">
              <Heart className="w-4! h-4!" />
              Save
            </button>
          </div>
        </div>

        {/* Hero Gallery - Premium Redesign */}
        <div className="bg-white! rounded-[32px]! p-2.5! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! mb-10! border! border-gray-100/50!">
          <div className="grid! grid-cols-1! md:grid-cols-4! gap-2.5! h-[350px]! md:h-[550px]!">
            <div
              className={`relative! rounded-[24px]! overflow-hidden! ${galleryImages.length > 0 ? "md:col-span-2! lg:col-span-3!" : "md:col-span-4!"} h-full! group!`}
            >
              <img
                src={primaryImage.imageUrl}
                alt={property.title}
                className="w-full! h-full! object-cover! transition-transform! duration-[1500ms]! ease-out! group-hover:scale-110!"
                loading="eager"
              />
              <div className="absolute! inset-0! bg-gradient-to-t! from-black/60! via-black/10! to-transparent!" />
              
              <div className="absolute! top-6! left-6! flex! gap-3!">
                <span className="px-4! py-2! bg-white/95! backdrop-blur-md! rounded-xl! text-xs! font-extrabold! tracking-widest! uppercase! text-[#27427f]! shadow-lg!">
                  {propertyTypeLabel}
                </span>
                <span
                  className={`px-4! py-2! rounded-xl! text-xs! font-extrabold! tracking-widest! uppercase! shadow-lg! backdrop-blur-md! ${isSale ? "bg-[#ffc900]/95! text-[#161e2d]!" : "bg-[#27427f]/95! text-white!"}`}
                >
                  {isSale ? "For Sale" : "For Rent"}
                </span>
              </div>
              
              <Link
                href={`/${property.canonicalSlug}/photos`}
                className="absolute! bottom-6! right-6! inline-flex! items-center! gap-2! px-5! py-3! bg-black/50! backdrop-blur-xl! rounded-xl! text-white! text-sm! font-bold! no-underline! hover:bg-black/70! hover:-translate-y-1! transition-all! border! border-white/10!"
              >
                <Images className="w-4.5! h-4.5!" />
                {images.length} Photo{images.length !== 1 ? "s" : ""}
              </Link>
            </div>

            {galleryImages.length > 0 && (
              <div className="hidden! md:grid! grid-cols-1! grid-rows-2! gap-2.5! h-full!">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <div
                    key={img.id}
                    className="relative! rounded-[24px]! overflow-hidden! h-full! group!"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${property.title} - View ${i + 2}`}
                      className="w-full! h-full! object-cover! transition-transform! duration-700! group-hover:scale-110! cursor-pointer!"
                      loading="lazy"
                    />
                    <div className="absolute! inset-0! bg-black/0! group-hover:bg-black/20! transition-colors! duration-300!" />
                    {i === 1 && images.length > 3 && (
                      <Link
                        href={`/${property.canonicalSlug}/photos`}
                        className="absolute! inset-0! bg-black/50! backdrop-blur-sm! flex! items-center! justify-center! cursor-pointer! hover:bg-black/60! transition-colors! no-underline!"
                      >
                        <span className="text-white! font-bold! text-xl! tracking-wide!">
                          +{images.length - 3} Photos
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid! grid-cols-1! lg:grid-cols-3! gap-8!">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2! space-y-8!">
            {/* Header Info */}
            <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50! relative! overflow-hidden!">
              <div className="absolute! top-0! right-0! w-64! h-64! bg-gradient-to-br! from-[#27427f]/5! to-transparent! rounded-full! blur-3xl! -translate-y-1/2! translate-x-1/2!" />
              
              <div className="flex! flex-col! md:flex-row! items-start! justify-between! gap-6! mb-8! relative! z-10!">
                <div className="flex-1!">
                  <div className="flex! items-center! gap-2! text-gray-500! mb-4!">
                    <div className="flex! items-center! justify-center! w-8! h-8! rounded-full! bg-[#27427f]/10!">
                      <MapPin className="w-4! h-4! text-[#27427f]!" />
                    </div>
                    <span className="text-sm! font-bold! tracking-wide!">
                      {property.city}
                      {property.state ? `, ${property.state}` : ""}
                    </span>
                  </div>
                  <h1 className="font-['Lexend',sans-serif]! text-3xl! md:text-4xl! font-extrabold! text-[#161e2d]! leading-tight!">
                    {property.title}
                  </h1>
                </div>
                <div className="text-left! md:text-right! shrink-0! bg-[#f8f9fa]! p-5! rounded-2xl! md:bg-transparent! md:p-0! w-full! md:w-auto!">
                  <p className="text-sm! text-gray-400! font-bold! uppercase! tracking-widest! mb-1.5!">Price</p>
                  <p className="font-['Lexend',sans-serif]! text-3xl! md:text-4xl! font-black! text-[#27427f]!">
                    {formatPrice(property.price)}
                  </p>
                  {property.details?.areaSqft &&
                    !isNaN(parseFloat(property.price)) && (
                      <p className="text-sm! font-bold! text-[#ffc900]! mt-2! bg-[#ffc900]/10! inline-block! px-3! py-1! rounded-lg!">
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

              {/* Quick Facts */}
              {quickStats.length > 0 && (
                <div className="grid! grid-cols-2! md:grid-cols-4! gap-4! pt-8! border-t! border-gray-100!">
                  {quickStats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex! flex-col! justify-center! items-start! gap-3! bg-white! rounded-2xl! p-5! border! border-gray-100! shadow-sm! hover:shadow-md! hover:-translate-y-1! transition-all! duration-300!"
                    >
                      <div className="w-12! h-12! rounded-xl! bg-gradient-to-br! from-[#27427f]/10! to-[#27427f]/5! flex! items-center! justify-center! text-[#27427f]! shrink-0!">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs! text-gray-400! font-bold! uppercase! tracking-widest! mb-1!">
                          {stat.label}
                        </p>
                        <p className="text-lg! font-black! text-[#161e2d]!">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Meta info */}
              <div className="flex! flex-wrap! gap-3! mt-8! pt-6! border-t! border-gray-100!">
                <div className="flex! items-center! gap-2! text-xs! font-bold! text-gray-500! bg-gray-50! px-4! py-2! rounded-lg!">
                  <Calendar className="w-4! h-4!" />
                  Listed {formatDate(property.createdAt)}
                </div>
                <div className="flex! items-center! gap-2! text-xs! font-bold! text-gray-500! bg-gray-50! px-4! py-2! rounded-lg!">
                  <Tag className="w-4! h-4!" />
                  {propertyTypeLabel}
                </div>
                {property.propertyCode && (
                  <div className="flex! items-center! gap-2! text-xs! font-bold! text-gray-500! bg-gray-50! px-4! py-2! rounded-lg!">
                    <Info className="w-4! h-4!" />
                    ID: {property.propertyCode}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
              <h2 className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-[#161e2d]! mb-6! flex! items-center! gap-3!">
                <div className="p-2! bg-[#27427f]/10! rounded-lg!">
                  <Info className="w-5! h-5! text-[#27427f]!" />
                </div>
                About this Property
              </h2>
              {property.description ? (
                <div
                  className="prose! max-w-none! text-gray-600! leading-loose! [&_p]:mb-5! [&_p]:text-base! [&_p]:leading-loose! [&_span]:text-base! [&_span]:leading-loose! [&_h3]:text-xl! [&_h3]:font-bold! [&_h3]:text-[#161e2d]! [&_h3]:mt-8! [&_h3]:mb-4! [&_ul]:list-none! [&_ul]:pl-0! [&_li]:mb-3! [&_li]:pl-6! [&_li]:relative! [&_li]:before:content-['']! [&_li]:before:absolute! [&_li]:before:left-0! [&_li]:before:top-3! [&_li]:before:w-2! [&_li]:before:h-2! [&_li]:before:bg-[#27427f]! [&_li]:before:rounded-full! [&_strong]:text-[#161e2d]! [&_strong]:font-bold!"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              ) : (
                <div className="text-center! py-8!">
                  <p className="text-gray-400! italic! text-base!">
                    Detailed description will be available soon. Contact us for
                    more information about this property.
                  </p>
                </div>
              )}
            </div>

            {/* Amenities Preview */}
            <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
              <div className="flex! items-center! justify-between! mb-8!">
                <h2 className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-[#161e2d]! flex! items-center! gap-3!">
                  <div className="p-2! bg-green-50! rounded-lg!">
                    <Sparkles className="w-5! h-5! text-green-600!" />
                  </div>
                  Key Amenities
                </h2>
                <Link
                  href={`/${property.canonicalSlug}/amenities`}
                  className="inline-flex! items-center! gap-2! text-sm! font-bold! text-[#27427f]! hover:text-white! hover:bg-[#27427f]! px-4! py-2! rounded-xl! transition-all! no-underline! bg-[#27427f]/5!"
                >
                  View All
                  <ArrowRight className="w-4! h-4!" />
                </Link>
              </div>
              <div className="grid! grid-cols-2! md:grid-cols-3! gap-5!">
                {amenitiesPreview.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex! items-center! gap-4! bg-white! rounded-2xl! p-4! border! border-gray-100! shadow-sm! hover:border-green-200! hover:shadow-md! transition-all!"
                  >
                    <div className="w-12! h-12! rounded-xl! bg-green-50! flex! items-center! justify-center! text-green-600! shrink-0!">
                      {amenity.icon}
                    </div>
                    <span className="font-bold! text-sm! text-[#161e2d]!">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore More Sections */}
            <div className="bg-gradient-to-br! from-[#161e2d]! to-[#27427f]! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.15)]! border! border-white/10! relative! overflow-hidden!">
              <div className="absolute! inset-0! bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]! opacity-5!" />
              <h2 className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-white! mb-8! relative! z-10!">
                Explore More
              </h2>
              <div className="grid! grid-cols-1! sm:grid-cols-2! gap-5! relative! z-10!">
                {sectionLinks.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group! flex! items-center! gap-5! bg-white/5! backdrop-blur-md! rounded-2xl! p-5! border! border-white/10! hover:bg-white/10! hover:-translate-y-1! transition-all! no-underline!"
                  >
                    <div className="w-14! h-14! rounded-xl! bg-white/10! flex! items-center! justify-center! text-white! group-hover:bg-[#ffc900]! group-hover:text-[#161e2d]! transition-all! shrink-0!">
                      {section.icon}
                    </div>
                    <div className="flex-1! min-w-0!">
                      <p className="text-base! font-bold! text-white! group-hover:text-[#ffc900]! transition-colors!">
                        {section.label}
                      </p>
                      <p className="text-sm! text-white/60! mt-1!">
                        {section.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-5! h-5! text-white/30! group-hover:text-[#ffc900]! transition-colors! shrink-0!" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1!">
            <div className="sticky! top-[140px]! space-y-6!">
              
              {/* Pricing Card */}
              <div className="bg-white! rounded-[32px]! p-8! shadow-[0_20px_40px_rgb(0,0,0,0.06)]! border! border-gray-100/80! relative! overflow-hidden!">
                <div className="absolute! top-0! left-0! w-full! h-2! bg-gradient-to-r! from-[#27427f]! to-[#ffc900]!" />
                
                <div className="mb-8!">
                  <p className="text-gray-400! font-bold! text-xs! uppercase! tracking-widest! mb-2!">
                    {isSale ? "Asking Price" : "Monthly Rent"}
                  </p>
                  <div className="flex! items-end! gap-2!">
                    <h2 className="font-['Lexend',sans-serif]! text-4xl! md:text-5xl! font-black! text-[#161e2d]! tracking-tight!">
                      {formatPrice(property.price)}
                    </h2>
                    {!isSale && (
                      <span className="text-sm! font-bold! text-gray-400! mb-2!">
                        / mo
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4!">
                  <button className="w-full! bg-gradient-to-r! from-[#ffc900]! to-[#f0bd00]! text-[#161e2d]! font-black! text-lg! py-4! rounded-2xl! hover:-translate-y-1! transition-all! duration-300! shadow-[0_8px_20px_rgba(255,201,0,0.3)]! hover:shadow-[0_12px_25px_rgba(255,201,0,0.4)]! flex! items-center! justify-center! gap-3!">
                    <Phone className="w-5! h-5!" />
                    Contact Owner
                  </button>

                  <button className="w-full! bg-white! text-[#27427f]! border-2! border-[#27427f]/10! hover:border-[#27427f]! hover:bg-[#27427f]/5! font-bold! text-lg! py-4! rounded-2xl! transition-all! duration-300! flex! items-center! justify-center! gap-3!">
                    <Calendar className="w-5! h-5!" />
                    Schedule Visit
                  </button>
                </div>
                
                <div className="mt-6! pt-6! border-t! border-gray-100! flex! items-center! justify-center! gap-2! text-sm! font-bold! text-gray-400!">
                  <ShieldCheck className="w-4! h-4! text-green-500!" />
                  No brokerage for this property
                </div>
              </div>

              {/* Agent/Owner Info */}
              <div className="bg-white! rounded-[24px]! p-6! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
                <div className="flex! items-center! gap-5!">
                  <div className="w-16! h-16! rounded-[16px]! bg-gradient-to-br! from-[#27427f]! to-[#161e2d]! flex! items-center! justify-center! shadow-lg! shrink-0!">
                    <Building2 className="w-8! h-8! text-white!" />
                  </div>
                  <div>
                    <p className="text-[10px]! text-[#27427f]! font-black! uppercase! tracking-widest! mb-1.5! bg-[#27427f]/10! inline-block! px-2! py-0.5! rounded-md!">
                      Listed By
                    </p>
                    <p className="font-['Lexend',sans-serif]! font-extrabold! text-lg! text-[#161e2d]!">
                      Majestan Realty
                    </p>
                    <p className="text-xs! font-bold! text-gray-400! mt-1! flex! items-center! gap-1.5!">
                      <Clock className="w-3.5! h-3.5!" />
                      Verified Partner
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Badge */}
              <div className="relative! overflow-hidden! bg-gradient-to-br! from-emerald-500! to-green-600! rounded-[24px]! p-6! shadow-[0_8px_30px_rgba(16,185,129,0.2)]!">
                <div className="absolute! top-0! right-0! w-32! h-32! bg-white! opacity-10! rounded-full! blur-2xl! -translate-y-1/2! translate-x-1/2!" />
                <div className="flex! items-center! gap-4! relative! z-10!">
                  <div className="w-12! h-12! rounded-xl! bg-white/20! backdrop-blur-md! flex! items-center! justify-center! shrink-0! border! border-white/30!">
                    <ShieldCheck className="w-6! h-6! text-white!" />
                  </div>
                  <div>
                    <p className="text-base! font-black! text-white! tracking-wide!">
                      Verified Listing
                    </p>
                    <p className="text-xs! font-bold! text-white/80! mt-1! leading-relaxed!">
                      Property has been physically verified.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
