"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Building2,
  MapPin,
  Tag,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Sofa,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="!flex !flex-col !gap-0.5">
      <span className="!text-[11px] !font-medium !uppercase !tracking-wider !text-gray-400 dark:!text-gray-500">{label}</span>
      <span className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !overflow-hidden">
      <div className="!px-6 !py-4 !border-b !border-gray-50 dark:!border-[#262730] !bg-gray-50/50 dark:!bg-[#0f1015]/50">
        <h3 className="!text-[14px] !font-semibold !text-gray-800 dark:!text-white !uppercase !tracking-wider">{title}</h3>
      </div>
      <div className="!p-6">{children}</div>
    </div>
  );
}

export default function ViewPropertyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const propertyType = searchParams.get("type") || "apartment";

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const res = await fetch(`${API_BASE_URL}/admin/properties/${propertyType}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setProperty(json.data || json);
        }
      } catch (err) {
        console.error("Failed to fetch property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, propertyType]);

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-64">
        <Loader2 className="!animate-spin !text-blue-600" size={28} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !h-64 !gap-4">
        <p className="!text-gray-500 dark:!text-gray-400">Property not found.</p>
        <Link href="/admin/properties" className="!text-blue-600 hover:!underline !text-sm">Back to Properties</Link>
      </div>
    );
  }

  const details = property.propertyDetails || {};
  const locations = property.propertyLocations || [];
  const amenities = property.propertyAmenities || [];
  const files = property.propertyFiles || [];
  const images = [
    // prefer dedicated propertyImages (imageUrl field)
    ...(property.propertyImages || []).map((i: any) => i.imageUrl || i.image_url || ""),
    // fallback: propertyFiles that have a fileUrl (legacy)
    ...files.filter((f: any) => f.fileUrl || f.file_url).map((f: any) => f.fileUrl || f.file_url || ""),
  ].filter(Boolean);
  const faqs = property.faqs || [];

  const statusBadgeMap: Record<string, React.ReactElement> = {
    available: <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[13px] !font-medium !bg-emerald-50 !text-emerald-600 !border !border-emerald-100"><CheckCircle size={13} /> Available</span>,
    unavailable: <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[13px] !font-medium !bg-gray-100 dark:!bg-[#262730] !text-gray-500 dark:!text-gray-400 !border !border-gray-200 dark:!border-[#262730]"><XCircle size={13} /> Hidden</span>,
    sold: <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[13px] !font-medium !bg-rose-50 !text-rose-600 !border !border-rose-100"><XCircle size={13} /> Sold</span>,
    rented: <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[13px] !font-medium !bg-blue-50 !text-blue-600 !border !border-blue-100"><Clock size={13} /> Rented</span>,
  };
  const statusBadge = statusBadgeMap[property.status?.toLowerCase()] || <span className="!px-3 !py-1 !rounded-full !text-[13px] !font-medium !bg-gray-50 dark:!bg-[#1c1d27] !text-gray-500">{property.status}</span>;

  const typeLabel: Record<string, string> = {
    apartment: "Apartment", villa: "Villa", plot: "Plot",
    commercial: "Commercial Space", coworking: "Coworking",
    farmland: "Farmland", industrial: "Industrial Space",
    individual_portion: "Independent House",
  };

  return (
    <div className="!w-full !space-y-5">
      {/* Header */}
      <div className="!flex !items-center !justify-between !gap-4 !flex-wrap">
        <div className="!flex !items-center !gap-3">
          <button onClick={() => router.back()} className="!p-2 !text-gray-500 dark:!text-gray-400 hover:!bg-white dark:hover:!bg-[#171821] !rounded-xl !transition-colors !border !border-transparent hover:!border-gray-100 dark:hover:!border-[#262730]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">{property.title}</h2>
            <p className="!text-[13px] !text-gray-400 !mt-0.5">{property.propertyCode} · {typeLabel[property.propertyType] || property.propertyType}</p>
          </div>
        </div>
        <div className="!flex !items-center !gap-3">
          {statusBadge}
          <Link
            href={`/admin/properties/edit/${id}?type=${propertyType}`}
            className="!inline-flex !items-center !gap-2 !px-4 !py-2 !bg-blue-600 hover:!bg-blue-700 !text-white !rounded-xl !text-[14px] !font-medium !transition-all !shadow-sm"
          >
            <Edit size={15} /> Edit Property
          </Link>
        </div>
      </div>

      {/* Media Gallery */}
      {images.length > 0 && (
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !overflow-hidden">
          <div className="!relative !aspect-video !bg-gray-100 dark:!bg-[#0f1015]">
            <img
              src={images[activeImage]}
              alt={`Property image ${activeImage + 1}`}
              className="!w-full !h-full !object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                  className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !p-2 !bg-black/40 hover:!bg-black/60 !text-white !rounded-full !backdrop-blur-sm !transition-all">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                  className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !p-2 !bg-black/40 hover:!bg-black/60 !text-white !rounded-full !backdrop-blur-sm !transition-all">
                  <ChevronRight size={20} />
                </button>
                <div className="!absolute !bottom-3 !right-3 !px-2.5 !py-1 !bg-black/50 !text-white !text-[12px] !font-medium !rounded-full !backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="!p-4 !flex !gap-2 !overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`!flex-shrink-0 !w-16 !h-16 !rounded-xl !overflow-hidden !border-2 !transition-all ${i === activeImage ? "!border-blue-600" : "!border-transparent hover:!border-gray-300"}`}
                >
                  <img src={img} alt="" className="!w-full !h-full !object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !p-12 !flex !flex-col !items-center !gap-2 !text-gray-400">
          <ImageIcon size={36} strokeWidth={1.5} />
          <p className="!text-[14px]">No images uploaded</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
        {[
          { icon: <Tag size={18} />, label: "Price", value: `₹${Number(property.price).toLocaleString("en-IN")}` },
          { icon: <BedDouble size={18} />, label: "Bedrooms", value: details.bedrooms ?? "—" },
          { icon: <Bath size={18} />, label: "Bathrooms", value: details.bathrooms ?? "—" },
          { icon: <Maximize2 size={18} />, label: "Area (sqft)", value: details.areaSqft ? `${details.areaSqft} sqft` : "—" },
        ].map(stat => (
          <div key={stat.label} className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !p-4 !flex !items-center !gap-3">
            <div className="!w-9 !h-9 !rounded-xl !bg-blue-50 dark:!bg-blue-950/30 !text-blue-600 !flex !items-center !justify-center !flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="!text-[11px] !text-gray-400 !uppercase !tracking-wider">{stat.label}</p>
              <p className="!text-[15px] !font-semibold !text-gray-800 dark:!text-white">{String(stat.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-5">
        {/* Left — main info */}
        <div className="!lg:col-span-2 !space-y-5">

          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="!grid !grid-cols-2 md:!grid-cols-3 !gap-x-8 !gap-y-5">
              <InfoRow label="Title" value={property.title} />
              <InfoRow label="Property Code" value={property.propertyCode} />
              <InfoRow label="Property Type" value={typeLabel[property.propertyType] || property.propertyType} />
              <InfoRow label="Listing Type" value={property.listingType} />
              <InfoRow label="Status" value={property.status} />
              <InfoRow label="Builder / Owner" value={property.builderName} />
              <InfoRow label="Slug" value={property.slug} />
            </div>
            {property.description && (
              <div className="!mt-5 !pt-5 !border-t !border-gray-100 dark:!border-[#262730]">
                <p className="!text-[11px] !font-medium !uppercase !tracking-wider !text-gray-400 dark:!text-gray-500 !mb-2">Description</p>
                <p className="!text-[14px] !text-gray-600 dark:!text-gray-300 !leading-relaxed">{property.description}</p>
              </div>
            )}
          </Section>

          {/* Specifications */}
          <Section title="Specifications">
            <div className="!grid !grid-cols-2 md:!grid-cols-3 !gap-x-8 !gap-y-5">
              <InfoRow label="Bedrooms" value={details.bedrooms} />
              <InfoRow label="Bathrooms" value={details.bathrooms} />
              <InfoRow label="Parking" value={details.parking} />
              <InfoRow label="Area (sqft)" value={details.areaSqft} />
              <InfoRow label="Build-up Area" value={details.buildUpArea} />
              <InfoRow label="Carpet Area" value={details.carpetArea} />
              <InfoRow label="Total Floors" value={details.totalFloors} />
              <InfoRow label="Facing" value={details.facing} />
              <InfoRow label="Furnished" value={details.furnished} />
            </div>
          </Section>

          {/* Amenities */}
          {amenities.length > 0 && (
            <Section title="Amenities">
              <div className="!flex !flex-wrap !gap-2">
                {amenities.map((a: any) => (
                  <span key={a.amenityId || a.id} className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !bg-blue-50 dark:!bg-blue-950/30 !text-blue-700 dark:!text-blue-400 !rounded-lg !text-[13px] !font-medium !border !border-blue-100 dark:!border-blue-900/50">
                    <CheckCircle size={12} />
                    {a.amenity?.name || a.name || `Amenity #${a.amenityId}`}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <Section title="FAQs">
              <div className="!space-y-4">
                {faqs.map((faq: any, i: number) => (
                  <div key={i} className="!border-b !border-gray-50 dark:!border-[#262730] !pb-4 last:!border-0 last:!pb-0">
                    <p className="!text-[14px] !font-semibold !text-gray-800 dark:!text-white !mb-1">{faq.question}</p>
                    <p className="!text-[13px] !text-gray-500 dark:!text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right — location + meta */}
        <div className="!space-y-5">

          {/* Location */}
          <Section title="Location">
            <div className="!space-y-4">
              <div className="!flex !items-start !gap-2">
                <MapPin size={16} className="!text-blue-600 !mt-0.5 !flex-shrink-0" />
                <div>
                  <p className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">{property.city}</p>
                  <p className="!text-[13px] !text-gray-500">{property.state}, {property.country}</p>
                </div>
              </div>
              {locations.map((loc: any, i: number) => (
                <div key={i} className="!space-y-3 !pt-3 !border-t !border-gray-50 dark:!border-[#262730]">
                  <InfoRow label="Address" value={loc.address} />
                  <InfoRow label="Sublocation" value={loc.sublocation?.localityName} />
                  <InfoRow label="Landmark" value={loc.landmark} />
                  <InfoRow label="Pincode" value={loc.pincode} />
                  {loc.latitude && loc.longitude && (
                    <InfoRow label="Coordinates" value={`${loc.latitude}, ${loc.longitude}`} />
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="!space-y-4">
              <InfoRow label="Price" value={`₹${Number(property.price).toLocaleString("en-IN")}`} />
              <InfoRow label="Listing Type" value={property.listingType} />
            </div>
          </Section>

          {/* Meta */}
          <Section title="System Info">
            <div className="!space-y-4">
              <InfoRow label="ID" value={property.id} />
              <InfoRow label="Property Code" value={property.propertyCode} />
              <InfoRow label="Created" value={property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined} />
              <InfoRow label="Last Updated" value={property.updatedAt ? new Date(property.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined} />
              <InfoRow label="SEO Slug" value={property.slug} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
