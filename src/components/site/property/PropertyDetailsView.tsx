import Link from "next/link";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Phone,
  CheckCircle2,
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

  // Quick stat cards data
  const quickStats = [
    property.details?.bedrooms
      ? {
          icon: <BedDouble className="w-5 h-5" />,
          label: "Bedrooms",
          value: `${property.details.bedrooms} BHK`,
        }
      : null,
    property.details?.bathrooms
      ? {
          icon: <Bath className="w-5 h-5" />,
          label: "Bathrooms",
          value: `${property.details.bathrooms}`,
        }
      : null,
    property.details?.areaSqft
      ? {
          icon: <Square className="w-5 h-5" />,
          label: "Area",
          value: `${property.details.areaSqft} sq.ft`,
        }
      : null,
    property.details?.parking
      ? {
          icon: <Car className="w-5 h-5" />,
          label: "Parking",
          value: `${property.details.parking} Covered`,
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  // Amenities preview
  const amenitiesPreview = [
    { icon: <Shield className="w-4 h-4" />, name: "24/7 Security" },
    { icon: <Zap className="w-4 h-4" />, name: "Power Backup" },
    { icon: <Droplets className="w-4 h-4" />, name: "Water Supply" },
    ...(property.details?.parking
      ? [
          {
            icon: <Car className="w-4 h-4" />,
            name: "Reserved Parking",
          },
        ]
      : []),
    ...(property.details?.furnished
      ? [
          {
            icon: <ShieldCheck className="w-4 h-4" />,
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
      icon: <Sparkles className="w-4 h-4" />,
      desc: "View all amenities & facilities",
    },
    {
      href: `/${property.canonicalSlug}/floor-plan`,
      label: "Floor Plan",
      icon: <Grid3X3 className="w-4 h-4" />,
      desc: "Unit layouts & configurations",
    },
    {
      href: `/${property.canonicalSlug}/locality`,
      label: "Locality",
      icon: <MapPinned className="w-4 h-4" />,
      desc: "Nearby places & connectivity",
    },
    {
      href: `/${property.canonicalSlug}/photos`,
      label: "Photos",
      icon: <Images className="w-4 h-4" />,
      desc: `${images.length} photo${images.length !== 1 ? "s" : ""} available`,
    },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Top Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#27427f] transition-colors no-underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to search
          </Link>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
              <Share2 className="w-4 h-4 text-gray-500" />
              Share
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:shadow-md text-red-500">
              <Heart className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="bg-white rounded-2xl p-2 shadow-sm mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[500px]">
            <div
              className={`relative rounded-xl overflow-hidden ${galleryImages.length > 0 ? "md:col-span-2 lg:col-span-3" : "md:col-span-4"} h-full group`}
            >
              <img
                src={primaryImage.imageUrl}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-sm font-bold text-[#27427f] shadow-sm">
                  {propertyTypeLabel}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm uppercase ${isSale ? "bg-[#ffc900] text-[#161e2d]" : "bg-[#27427f] text-white"}`}
                >
                  {isSale ? "For Sale" : "For Rent"}
                </span>
              </div>
              {/* Photo count */}
              <Link
                href={`/${property.canonicalSlug}/photos`}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-semibold no-underline hover:bg-black/70 transition-colors"
              >
                <Images className="w-4 h-4" />
                {images.length} Photo{images.length !== 1 ? "s" : ""}
              </Link>
            </div>

            {galleryImages.length > 0 && (
              <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-2 h-full">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl overflow-hidden h-full"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${property.title} - View ${i + 2}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                      loading="lazy"
                    />
                    {i === 1 && images.length > 3 && (
                      <Link
                        href={`/${property.canonicalSlug}/photos`}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors no-underline"
                      >
                        <span className="text-white font-semibold text-lg">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="font-['Lexend',sans-serif] text-2xl md:text-3xl font-bold text-[#161e2d] leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500 mt-3">
                    <MapPin className="w-4 h-4 text-[#27427f]" />
                    <span className="text-sm">
                      {property.city}
                      {property.state ? `, ${property.state}` : ""}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-400 font-medium">Price</p>
                  <p className="font-['Lexend',sans-serif] text-2xl md:text-3xl font-extrabold text-[#27427f]">
                    {formatPrice(property.price)}
                  </p>
                  {property.details?.areaSqft &&
                    !isNaN(parseFloat(property.price)) && (
                      <p className="text-xs text-gray-400 mt-1">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                  {quickStats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#f8f9fa] rounded-xl p-3.5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#27427f]/5 flex items-center justify-center text-[#27427f] shrink-0">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className="text-sm font-bold text-[#161e2d]">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Listed {formatDate(property.createdAt)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Tag className="w-3.5 h-3.5" />
                  {propertyTypeLabel}
                </div>
                {property.propertyCode && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Info className="w-3.5 h-3.5" />
                    ID: {property.propertyCode}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="font-['Lexend',sans-serif] text-xl font-bold text-[#161e2d] mb-5 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#27427f]" />
                About this Property
              </h2>
              {property.description ? (
                <div
                  className="prose max-w-none text-gray-600 leading-relaxed [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_span]:text-[15px] [&_span]:leading-relaxed [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#161e2d] [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_strong]:text-[#161e2d] [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Detailed description will be available soon. Contact us for
                  more information about this property.
                </p>
              )}
            </div>

            {/* Amenities Preview */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Lexend',sans-serif] text-xl font-bold text-[#161e2d] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#27427f]" />
                  Key Amenities
                </h2>
                <Link
                  href={`/${property.canonicalSlug}/amenities`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#27427f] hover:text-[#1d3261] transition-colors no-underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesPreview.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-[#f8f9fa] rounded-xl p-3.5 border border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      {amenity.icon}
                    </div>
                    <span className="font-medium text-sm text-gray-700">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore More Sections */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="font-['Lexend',sans-serif] text-xl font-bold text-[#161e2d] mb-5">
                Explore More
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sectionLinks.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group flex items-center gap-4 bg-[#f8f9fa] rounded-xl p-4 border border-gray-100 hover:border-[#27427f]/20 hover:bg-[#27427f]/[0.02] transition-all no-underline"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#27427f]/5 flex items-center justify-center text-[#27427f] group-hover:bg-[#27427f] group-hover:text-white transition-all shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#161e2d] group-hover:text-[#27427f] transition-colors">
                        {section.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {section.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#27427f] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[140px] space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="mb-6">
                  <p className="text-gray-400 font-medium text-sm mb-1">
                    {isSale ? "Asking Price" : "Monthly Rent"}
                  </p>
                  <div className="flex items-end gap-2">
                    <h2 className="font-['Lexend',sans-serif] text-3xl md:text-4xl font-extrabold text-[#27427f]">
                      {formatPrice(property.price)}
                    </h2>
                    {!isSale && (
                      <span className="text-sm text-gray-400 mb-1">
                        / month
                      </span>
                    )}
                  </div>
                  {isSale &&
                    property.details?.areaSqft &&
                    !isNaN(parseFloat(property.price)) && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                        <Square className="w-3.5 h-3.5" />₹{" "}
                        {Math.round(
                          parseFloat(property.price) /
                            parseFloat(property.details.areaSqft)
                        ).toLocaleString("en-IN")}{" "}
                        / sq.ft
                      </p>
                    )}
                </div>

                <button className="w-full bg-[#ffc900] hover:bg-[#f0bd00] text-[#161e2d] font-bold text-base py-4 rounded-xl transition-all shadow-[0_4px_14px_rgba(255,201,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,201,0,0.5)] mb-3 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Owner
                </button>

                <button className="w-full bg-white hover:bg-gray-50 text-[#27427f] border-2 border-[#27427f]/10 hover:border-[#27427f]/30 font-bold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule a Visit
                </button>
              </div>

              {/* Agent/Owner Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#27427f]/10 to-[#27427f]/5 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    <Building2 className="w-7 h-7 text-[#27427f]/40" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                      Listed By
                    </p>
                    <p className="font-bold text-[#161e2d]">Majestan Realty</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Since {new Date(property.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Badge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Verified Listing
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      This property has been verified by Majestan Realty
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
