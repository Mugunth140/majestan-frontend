"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, ImagePlus, X, Check, ChevronDown,
} from "lucide-react";
import type { AdminCity, AdminSublocation } from "@/lib/location-options";
import { toast } from "@/components/ui/toast-store";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial Space" },
  { value: "coworking", label: "Coworking" },
  { value: "farmland", label: "Farmland" },
  { value: "industrial", label: "Industrial Space" },
  { value: "individual_portion", label: "Independent House" },
];

interface FormData {
  title: string;
  description: string;
  price: string;
  propertyType: string;
  listingType: string;
  status: string;
  cityId: string;
  sublocationId: string;
  city: string;
  state: string;
  country: string;
  slug: string;
  builderName: string;
  // Location
  address: string;
  landmark: string;
  pincode: string;
  latitude: string;
  longitude: string;
  // Details
  bedrooms: string;
  bathrooms: string;
  parking: string;
  areaSqft: string;
  buildUpArea: string;
  carpetArea: string;
  totalFloors: string;
  facing: string;
  furnished: string;
}

const emptyForm: FormData = {
  title: "", description: "", price: "", propertyType: "apartment",
  listingType: "Sell", status: "available",
  cityId: "", sublocationId: "", city: "", state: "", country: "India",
  slug: "", builderName: "",
  address: "", landmark: "", pincode: "", latitude: "", longitude: "",
  bedrooms: "", bathrooms: "", parking: "", areaSqft: "",
  buildUpArea: "", carpetArea: "", totalFloors: "", facing: "", furnished: "",
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const propertyType = searchParams.get("type") || "apartment";

  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<AdminCity[]>([]);
  const [localities, setLocalities] = useState<AdminSublocation[]>([]);
  const [amenities, setAmenities] = useState<{ id: number; name: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [amenitySearch, setAmenitySearch] = useState("");

  const filteredAmenities = useMemo(() =>
    amenities.filter(a => a.name.toLowerCase().includes(amenitySearch.toLowerCase())),
    [amenities, amenitySearch]
  );

  const availableSublocations = useMemo(() =>
    formData.cityId ? localities.filter(l => l.city_id === Number(formData.cityId)) : [],
    [localities, formData.cityId]
  );

  // ── Fetch reference data & property ────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      const token = window.localStorage.getItem("majestan_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [amenitiesRes, citiesRes, subsRes, propRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/amenities`, { headers }),
        fetch(`${API_BASE_URL}/admin/cities/all`, { headers }),
        fetch(`${API_BASE_URL}/admin/sublocations/all`, { headers }),
        fetch(`${API_BASE_URL}/admin/properties/${propertyType}/${id}`, { headers }),
      ]);

      if (amenitiesRes.ok) {
        const j = await amenitiesRes.json();
        const arr = j.data?.items || j.items || j.data || j || [];
        setAmenities(Array.isArray(arr) ? arr : []);
      }
      if (citiesRes.ok) {
        const j = await citiesRes.json();
        setAvailableCities((j.data || j || []) as AdminCity[]);
      }
      if (subsRes.ok) {
        const j = await subsRes.json();
        setLocalities((j.data || j || []) as AdminSublocation[]);
      }

      if (propRes.ok) {
        const j = await propRes.json();
        const p = j.data || j;
        const det = p.propertyDetails || {};
        const locs = p.propertyLocations || [];
        const loc = locs[0] || {};
        const subloc = loc.sublocation || {};

        setFormData({
          title: p.title || "",
          description: p.description || "",
          price: p.price ? String(p.price) : "",
          propertyType: p.propertyType || propertyType,
          listingType: p.listingType || "Sell",
          status: p.status || "available",
          cityId: subloc.cityId ? String(subloc.cityId) : "",
          sublocationId: loc.locationId ? String(loc.locationId) : "",
          city: p.city || "",
          state: p.state || "",
          country: p.country || "India",
          slug: p.slug || "",
          builderName: p.builderName || "",
          address: loc.address || "",
          landmark: loc.landmark || "",
          pincode: loc.pincode || "",
          latitude: loc.latitude ? String(loc.latitude) : "",
          longitude: loc.longitude ? String(loc.longitude) : "",
          bedrooms: det.bedrooms != null ? String(det.bedrooms) : "",
          bathrooms: det.bathrooms != null ? String(det.bathrooms) : "",
          parking: det.parking != null ? String(det.parking) : "",
          areaSqft: det.areaSqft ? String(det.areaSqft) : "",
          buildUpArea: det.buildUpArea ? String(det.buildUpArea) : "",
          carpetArea: det.carpetArea ? String(det.carpetArea) : "",
          totalFloors: det.totalFloors ? String(det.totalFloors) : "",
          facing: det.facing || "",
          furnished: det.furnished === true ? "true" : det.furnished === false ? "false" : "",
        });

        if (p.propertyAmenities) {
          setSelectedAmenities(p.propertyAmenities.map((a: any) => a.amenityId));
        }
        if (p.propertyFiles) {
          setExistingImages(p.propertyFiles.map((f: any) => f.fileUrl || f.file_url || "").filter(Boolean));
        }
      }

      setLoadingProperty(false);
    };

    fetchAll().catch(err => {
      console.error(err);
      setLoadingProperty(false);
    });
  }, [id, propertyType]);

  // ── Handlers ───────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cityId") {
      const cityData = availableCities.find(c => c.id === Number(value));
      setFormData(prev => ({
        ...prev,
        cityId: value,
        sublocationId: "",
        city: cityData?.city_name || "",
        state: cityData?.state_name || "",
        country: cityData?.country_name || "India",
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId) ? prev.filter(id => id !== amenityId) : [...prev, amenityId]
    );
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const uploadImagesToR2 = async (): Promise<string[]> => {
    const keys: string[] = [];
    const token = window.localStorage.getItem("majestan_access_token");
    for (const file of newImages) {
      const presignRes = await fetch(
        `${API_BASE_URL}/properties/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!presignRes.ok) throw new Error(`Presigned URL failed for ${file.name}`);
      const { data } = await presignRes.json();
      const uploadRes = await fetch(data.url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`);
      keys.push(data.key);
    }
    return keys;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let newKeys: string[] = [];
      if (newImages.length > 0) {
        newKeys = await uploadImagesToR2();
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        status: formData.status,
        cityId: Number(formData.cityId) || undefined,
        sublocationId: Number(formData.sublocationId) || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        slug: formData.slug || undefined,
        builderName: formData.builderName || undefined,
        location: {
          address: formData.address || undefined,
          landmark: formData.landmark || undefined,
          pincode: formData.pincode || undefined,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined,
        },
        details: {
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
          parking: formData.parking ? Number(formData.parking) : undefined,
          areaSqft: formData.areaSqft ? Number(formData.areaSqft) : undefined,
          buildUpArea: formData.buildUpArea ? Number(formData.buildUpArea) : undefined,
          carpetArea: formData.carpetArea ? Number(formData.carpetArea) : undefined,
          totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
          facing: formData.facing || undefined,
          furnished: formData.furnished === "true" ? true : formData.furnished === "false" ? false : undefined,
        },
        amenities: selectedAmenities.map(amenityId => ({ amenityId })),
        files: [
          ...existingImages.map(url => ({ fileType: "IMAGE", fileUrl: url })),
          ...newKeys.map(key => ({ fileType: "IMAGE", fileUrl: key })),
        ],
      };

      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/properties/${formData.propertyType}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Property updated successfully");
        router.push("/admin/properties");
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray(err.message) ? err.message.join(", ") : (err.message || "Failed to update property");
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ── Input styles ───────────────────────────────────────────
  const inputCls = "!w-full !bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !rounded-xl !px-4 !py-3 !text-[14px] !text-gray-800 dark:!text-white focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !outline-none !transition-all";
  const selectCls = "!w-full !appearance-none !bg-gray-50 dark:!bg-[#1c1d27] !border !border-gray-200 dark:!border-[#262730] !text-gray-800 dark:!text-white !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer";
  const labelCls = "!text-[13px] !font-medium !text-gray-700 dark:!text-gray-300";

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="!space-y-1.5">
        <label className={labelCls}>{label}</label>
        {children}
      </div>
    );
  }

  function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
      <div className="!relative">
        {children}
        <div className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400"><ChevronDown size={16} /></div>
      </div>
    );
  }

  function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
      <div className="!pb-4 !border-b !border-gray-100 dark:!border-[#262730]">
        <h3 className="!text-[15px] !font-semibold !text-gray-800 dark:!text-white">{title}</h3>
        {subtitle && <p className="!text-[13px] !text-gray-400 !mt-0.5">{subtitle}</p>}
      </div>
    );
  }

  if (loadingProperty) {
    return (
      <div className="!flex !items-center !justify-center !h-64 !gap-3 !text-gray-500">
        <Loader2 className="!animate-spin" size={22} />
        <span className="!text-[14px]">Loading property details...</span>
      </div>
    );
  }

  return (
    <div className="!w-full !space-y-6">
      {/* Page Header */}
      <div className="!flex !items-center !gap-4">
        <Link href="/admin/properties" className="!p-2 !text-gray-500 dark:!text-gray-400 hover:!bg-white dark:hover:!bg-[#171821] hover:!border-gray-100 dark:hover:!border-[#262730] !border !border-transparent !rounded-xl !transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">Edit Property</h2>
          <p className="!text-[13px] !text-gray-400 !mt-0.5">{formData.title || "Loading..."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="!space-y-5">

        {/* ── Basic Information ───────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !p-6 !space-y-5">
          <SectionHeader title="Basic Information" />
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <div className="md:!col-span-2">
              <Field label="Property Title *">
                <input required name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="E.g. Luxury 3BHK Apartment in Coimbatore" />
              </Field>
            </div>
            <Field label="Property Type">
              <SelectWrapper>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={selectCls}>
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Listing Type">
              <SelectWrapper>
                <select name="listingType" value={formData.listingType} onChange={handleChange} className={selectCls}>
                  <option value="Sell">For Sale</option>
                  <option value="Rent">For Rent</option>
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Status">
              <SelectWrapper>
                <select name="status" value={formData.status} onChange={handleChange} className={selectCls}>
                  <option value="available">Available</option>
                  <option value="unavailable">Hidden (Unavailable)</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Builder / Owner Name">
              <input name="builderName" value={formData.builderName} onChange={handleChange} className={inputCls} placeholder="E.g. Sobha Developers" />
            </Field>
            <Field label="Price (₹) *">
              <input required name="price" type="number" value={formData.price} onChange={handleChange} className={inputCls} placeholder="E.g. 15000000" />
            </Field>
            <Field label="SEO Slug">
              <input name="slug" value={formData.slug} onChange={handleChange} className={inputCls} placeholder="auto-generated if left blank" />
            </Field>
          </div>
          <Field label="Description *">
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className={inputCls} placeholder="Detailed description of the property..." />
          </Field>
        </div>

        {/* ── Location ───────────────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !p-6 !space-y-5">
          <SectionHeader title="Location" />
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Field label="City">
              <SelectWrapper>
                <select name="cityId" value={formData.cityId} onChange={handleChange} className={selectCls}>
                  <option value="">Select City</option>
                  {availableCities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Sublocation / Area">
              <SelectWrapper>
                <select name="sublocationId" value={formData.sublocationId} onChange={handleChange} disabled={!formData.cityId} className={selectCls + " disabled:!opacity-50 disabled:!cursor-not-allowed"}>
                  <option value="">{formData.cityId ? "Select Area" : "Select City First"}</option>
                  {availableSublocations.map(s => <option key={s.id} value={s.id}>{s.locality_name}</option>)}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="State">
              <input readOnly name="state" value={formData.state} className={inputCls + " !opacity-60 !cursor-not-allowed"} />
            </Field>
            <Field label="Country">
              <input readOnly name="country" value={formData.country} className={inputCls + " !opacity-60 !cursor-not-allowed"} />
            </Field>
            <div className="md:!col-span-2">
              <Field label="Address">
                <input name="address" value={formData.address} onChange={handleChange} className={inputCls} placeholder="Street address" />
              </Field>
            </div>
            <Field label="Landmark">
              <input name="landmark" value={formData.landmark} onChange={handleChange} className={inputCls} placeholder="E.g. Near City Mall" />
            </Field>
            <Field label="Pincode">
              <input name="pincode" value={formData.pincode} onChange={handleChange} className={inputCls} placeholder="E.g. 641001" />
            </Field>
            <Field label="Latitude">
              <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className={inputCls} placeholder="E.g. 11.0168" />
            </Field>
            <Field label="Longitude">
              <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className={inputCls} placeholder="E.g. 76.9558" />
            </Field>
          </div>
        </div>

        {/* ── Specifications ─────────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !p-6 !space-y-5">
          <SectionHeader title="Specifications" />
          <div className="!grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4 !gap-5">
            <Field label="Bedrooms">
              <input name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleChange} className={inputCls} placeholder="3" />
            </Field>
            <Field label="Bathrooms">
              <input name="bathrooms" type="number" min="0" value={formData.bathrooms} onChange={handleChange} className={inputCls} placeholder="2" />
            </Field>
            <Field label="Parking">
              <input name="parking" type="number" min="0" value={formData.parking} onChange={handleChange} className={inputCls} placeholder="1" />
            </Field>
            <Field label="Area (sqft)">
              <input name="areaSqft" type="number" min="0" value={formData.areaSqft} onChange={handleChange} className={inputCls} placeholder="1500" />
            </Field>
            <Field label="Build-up Area (sqft)">
              <input name="buildUpArea" type="number" min="0" value={formData.buildUpArea} onChange={handleChange} className={inputCls} placeholder="1600" />
            </Field>
            <Field label="Carpet Area (sqft)">
              <input name="carpetArea" type="number" min="0" value={formData.carpetArea} onChange={handleChange} className={inputCls} placeholder="1300" />
            </Field>
            <Field label="Total Floors">
              <input name="totalFloors" type="number" min="0" value={formData.totalFloors} onChange={handleChange} className={inputCls} placeholder="10" />
            </Field>
            <Field label="Facing Direction">
              <SelectWrapper>
                <select name="facing" value={formData.facing} onChange={handleChange} className={selectCls}>
                  <option value="">Select</option>
                  {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Furnished Status">
              <SelectWrapper>
                <select name="furnished" value={formData.furnished} onChange={handleChange} className={selectCls}>
                  <option value="">Select</option>
                  <option value="true">Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </SelectWrapper>
            </Field>
          </div>
        </div>

        {/* ── Amenities ──────────────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !p-6 !space-y-4">
          <SectionHeader title="Amenities" subtitle={`${selectedAmenities.length} selected`} />
          <input
            type="text"
            placeholder="Search amenities..."
            value={amenitySearch}
            onChange={e => setAmenitySearch(e.target.value)}
            className={inputCls + " !py-2"}
          />
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 !gap-2.5 !max-h-64 !overflow-y-auto !pr-1">
            {filteredAmenities.map(amenity => {
              const active = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`!flex !items-center !gap-2 !p-2.5 !rounded-xl !border !text-[13px] !font-medium !transition-all !text-left ${active
                    ? "!bg-blue-600 !border-blue-600 !text-white"
                    : "!bg-white dark:!bg-[#171821] !border-gray-200 dark:!border-[#262730] !text-gray-700 dark:!text-gray-300 hover:!border-blue-300 dark:hover:!border-blue-700"
                  }`}
                >
                  <div className={`!w-4 !h-4 !rounded !flex !items-center !justify-center !flex-shrink-0 ${active ? "!bg-white/20" : "!border !border-gray-300 dark:!border-gray-600"}`}>
                    {active && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className="!truncate">{amenity.name}</span>
                </button>
              );
            })}
            {filteredAmenities.length === 0 && (
              <p className="!col-span-full !text-[13px] !text-gray-400 !italic">No amenities match your search.</p>
            )}
          </div>
        </div>

        {/* ── Images ─────────────────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !p-6 !space-y-4">
          <SectionHeader title="Property Images" subtitle="Existing images are retained unless removed" />
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-4">
            {existingImages.map((img, i) => (
              <div key={`ex-${i}`} className="!relative !aspect-square !rounded-xl !overflow-hidden !border !border-gray-200 dark:!border-[#262730] !group">
                <img src={img} alt="" className="!w-full !h-full !object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="!absolute !inset-0 !bg-black/0 group-hover:!bg-black/20 !transition-all" />
                <button
                  type="button"
                  onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="!absolute !top-2 !right-2 !p-1.5 !bg-white dark:!bg-[#171821] hover:!bg-rose-50 !text-gray-600 dark:!text-gray-300 hover:!text-rose-600 !rounded-lg !shadow-sm !opacity-0 group-hover:!opacity-100 !transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={`new-${i}`} className="!relative !aspect-square !rounded-xl !overflow-hidden !border-2 !border-blue-200 dark:!border-blue-800 !group">
                <img src={URL.createObjectURL(img)} alt="" className="!w-full !h-full !object-cover" />
                <div className="!absolute !top-1.5 !left-1.5 !px-1.5 !py-0.5 !bg-blue-600 !text-white !text-[10px] !font-medium !rounded">NEW</div>
                <button
                  type="button"
                  onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="!absolute !top-2 !right-2 !p-1.5 !bg-white dark:!bg-[#171821] hover:!bg-rose-50 !text-gray-600 hover:!text-rose-600 !rounded-lg !shadow-sm !opacity-0 group-hover:!opacity-100 !transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="!relative !aspect-square !rounded-xl !border-2 !border-dashed !border-gray-300 dark:!border-[#262730] hover:!border-blue-400 dark:hover:!border-blue-600 !flex !flex-col !items-center !justify-center !gap-2 !cursor-pointer !transition-all hover:!bg-blue-50/50 dark:hover:!bg-blue-950/20">
              <ImagePlus className="!text-gray-400" size={24} />
              <span className="!text-[12px] !font-medium !text-gray-400">Add Images</span>
              <input type="file" multiple accept="image/*" className="!hidden" onChange={handleImageAdd} />
            </label>
          </div>
        </div>

        {/* ── Footer ─────────────────────── */}
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !p-5 !flex !items-center !justify-between">
          <Link href="/admin/properties" className="!px-5 !py-2.5 !text-[14px] !font-medium !text-gray-600 dark:!text-gray-300 hover:!text-gray-800 dark:hover:!text-white !transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="!inline-flex !items-center !gap-2 !px-8 !py-2.5 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-sm hover:!shadow-blue-500/20 !rounded-xl !text-[14px] !font-semibold !transition-all disabled:!opacity-70 disabled:!cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="!animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Update Property"}
          </button>
        </div>

      </form>
    </div>
  );
}
