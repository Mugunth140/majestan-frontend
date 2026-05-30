import { type SeoProperty } from "@/lib/api/property-by-slug";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { PropertyNavigation } from "@/components/site/property/property-navigation";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { Phone, Building2 } from "lucide-react";

type PropertyLayoutProps = {
  property: SeoProperty;
  children: React.ReactNode;
  activeSection?: string;
};

function formatPrice(price: string) {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lac`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function PropertyLayout({ property, children, activeSection }: PropertyLayoutProps) {
  const propertyTypeLabel =
    Object.values(PROPERTY_TYPES).find((p) => p.apiValue === property.propertyType)?.label ||
    property.propertyType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const listingType = property.status.toLowerCase().includes("rent") ? "for-rent" : "for-sale";

  const breadcrumbItems = [
    {
      label: listingType === "for-rent" ? "For Rent" : "For Sale",
      href: `/${listingType}/${property.propertyType}/${property.city}`,
    },
    {
      label: propertyTypeLabel,
      href: `/${listingType}/${property.propertyType}/${property.city}`,
    },
    {
      label: property.city,
      href: `/${listingType}/${property.propertyType}/${property.city}`,
    },
    {
      label: property.title,
      href: `/${property.canonicalSlug}`,
    },
    ...(activeSection
      ? [{ label: activeSection.charAt(0).toUpperCase() + activeSection.slice(1) }]
      : []),
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Property Navigation */}
        <div className="mb-4">
          <PropertyNavigation slug={property.canonicalSlug} />
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2">{children}</div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[140px] space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="mb-6">
                  <p className="text-gray-500 font-medium mb-1">Asking Price</p>
                  <div className="flex items-end gap-2">
                    <h2 className="text-4xl font-extrabold text-[#27427f]">
                      {formatPrice(property.price)}
                    </h2>
                  </div>
                  {property.details?.areaSqft && !isNaN(parseFloat(property.price)) && (
                    <p className="text-sm text-gray-400 mt-2">
                      ₹{" "}
                      {Math.round(
                        parseFloat(property.price) / parseFloat(property.details.areaSqft)
                      ).toLocaleString("en-IN")}{" "}
                      / sq.ft
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
                  <p className="text-sm text-gray-500">
                    Member since {new Date(property.createdAt).getFullYear()}
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
