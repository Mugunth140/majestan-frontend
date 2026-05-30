import Image from "next/image";
import Link from "next/link";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import { MapPin, BedDouble, Bath, Square, Car, Ruler, Phone, CheckCircle2, Share2, Heart, ChevronLeft, Building2 } from "lucide-react";
import { PROPERTY_TYPES, LISTING_TYPES, buildListingUrl } from "@/lib/seo-urls";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";

type PropertyDetailsViewProps = {
  property: SeoProperty;
};

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  const images = property.images?.length > 0 
    ? property.images 
    : [{ id: 0, imageUrl: "/assets/images/home/apartment-buy.png", imageKey: "default", isPrimary: true, createdAt: "" }];

  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const galleryImages = images.slice(1, 5); // Up to 4 more images for grid

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lac`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const propertyTypeLabel = Object.values(PROPERTY_TYPES).find(p => p.apiValue === property.propertyType)?.label 
    || property.propertyType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
  // Infer listing type based on url/data if possible. Assume 'for-sale' if not explicit
  const listingType = property.status.toLowerCase().includes('rent') ? 'for-rent' : 'for-sale';
  const breadcrumbItems = [
    { label: listingType === 'for-rent' ? 'For Rent' : 'For Sale', href: `/${listingType}/${property.propertyType}/${property.city}` },
    { label: propertyTypeLabel, href: `/${listingType}/${property.propertyType}/${property.city}` },
    { label: property.city, href: `/${listingType}/${property.propertyType}/${property.city}` },
    { label: property.title }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumbs & Navigation */}
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-4">
          <PropertyNavigation slug={property.canonicalSlug} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#27427f] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to search
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-red-500">
              <Heart className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="bg-white rounded-2xl p-2 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[500px]">
            <div className={`relative rounded-xl overflow-hidden ${galleryImages.length > 0 ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-4'} h-full group`}>
              <img 
                src={primaryImage.imageUrl} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-sm font-bold text-[#27427f] shadow-sm">
                  {propertyTypeLabel}
                </span>
                <span className="px-3 py-1.5 bg-[#ffc900] rounded-lg text-sm font-bold text-[#161e2d] shadow-sm uppercase">
                  {property.status}
                </span>
              </div>
            </div>
            
            {galleryImages.length > 0 && (
              <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-2 h-full">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden h-full">
                    <img 
                      src={img.imageUrl} 
                      alt={`${property.title} - View ${i + 2}`} 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                    {i === 1 && images.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                        <span className="text-white font-semibold text-lg">+{images.length - 3} Photos</span>
                      </div>
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
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-bold text-[#161e2d] mb-4 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <MapPin className="w-5 h-5 text-[#27427f]" />
                <span className="text-lg">{property.city}{property.state ? `, ${property.state}` : ''}</span>
              </div>

              {/* Quick Facts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
                {property.details?.bedrooms && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <BedDouble className="w-4 h-4" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <span className="font-semibold text-lg">{property.details.bedrooms} BHK</span>
                  </div>
                )}
                {property.details?.bathrooms && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <span className="font-semibold text-lg">{property.details.bathrooms} Baths</span>
                  </div>
                )}
                {property.details?.areaSqft && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Square className="w-4 h-4" />
                      <span className="text-sm">Area</span>
                    </div>
                    <span className="font-semibold text-lg">{property.details.areaSqft} sq.ft</span>
                  </div>
                )}
                {property.details?.parking && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Car className="w-4 h-4" />
                      <span className="text-sm">Parking</span>
                    </div>
                    <span className="font-semibold text-lg">{property.details.parking} Covered</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#161e2d] mb-6">About this Property</h2>
              {property.description ? (
                <div 
                  className="prose! max-w-none! text-gray-600! leading-relaxed! [&_p]:mb-4! [&_p]:text-base! [&_p]:leading-relaxed! [&_span]:text-base! [&_span]:leading-relaxed! [&_h3]:text-xl! [&_h3]:font-semibold! [&_h3]:text-[#161e2d]! [&_h3]:mt-6! [&_h3]:mb-3! [&_ul]:list-disc! [&_ul]:pl-5! [&_li]:mb-2! [&_strong]:text-[#161e2d]! [&_strong]:font-semibold!" 
                  dangerouslySetInnerHTML={{ __html: property.description }} 
                />
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}
            </div>

            {/* Amenities Placeholder */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#161e2d] mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Mock amenities since API doesn't provide them yet */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">24/7 Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Power Backup</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Water Supply</span>
                </div>
                {property.details?.parking && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">Reserved Parking</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[140px] space-y-6">
              
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="mb-6">
                  <p className="text-gray-500 font-medium mb-1">Asking Price</p>
                  <div className="flex items-end gap-2">
                    <h2 className="text-4xl font-extrabold text-[#27427f]">{formatPrice(property.price)}</h2>
                  </div>
                  {property.details?.areaSqft && !isNaN(parseFloat(property.price)) && (
                    <p className="text-sm text-gray-400 mt-2">
                      ₹ {Math.round(parseFloat(property.price) / parseFloat(property.details.areaSqft)).toLocaleString('en-IN')} / sq.ft
                    </p>
                  )}
                </div>

                <button className="w-full bg-[#ffc900] hover:bg-[#f0bd00] text-[#161e2d] font-bold text-lg py-4 rounded-xl transition-all shadow-[0_4px_14px_rgba(255,201,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,201,0,0.5)] mb-4 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Owner
                </button>
                
                <button className="w-full bg-white hover:bg-gray-50 text-[#27427f] border-2 border-[#27427f]/10 hover:border-[#27427f]/30 font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  Schedule a Visit
                </button>
              </div>

              {/* Agent/Owner Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Listed By</p>
                  <p className="font-bold text-[#161e2d] text-lg">Owner / Agent</p>
                  <p className="text-sm text-gray-500">Member since {new Date(property.createdAt).getFullYear()}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
