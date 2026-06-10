"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { X, Save, ArrowLeft, Loader2, ImagePlus, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { AdminCity, AdminSublocation } from "@/lib/location-options";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const propertyType = searchParams.get('type') || 'apartment';
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "apartment",
    status: "available",
    cityId: "",
    sublocationId: "",
    city: "",
    state: "",
    country: "India",
    slug: "",
    builderName: "",
    subLocation: "",
    bedrooms: "",
    bathrooms: "",
    areaSqft: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [amenities, setAmenities] = useState<{ id: number; name: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [localities, setLocalities] = useState<AdminSublocation[]>([]);
  const [availableCities, setAvailableCities] = useState<AdminCity[]>([]);
  const resolvedCityId =
    formData.cityId ||
    String(
      availableCities.find(
        (city) => city.city_name.toLowerCase() === formData.city.toLowerCase(),
      )?.id ?? "",
    );
  const availableSublocations = useMemo(
    () =>
      resolvedCityId
        ? localities.filter(
            (locality) => locality.city_id === Number(resolvedCityId),
          )
        : [],
    [localities, resolvedCityId],
  );
  const resolvedSublocationId =
    formData.sublocationId ||
    String(
      availableSublocations.find(
        (sublocation) =>
          sublocation.locality_name.toLowerCase() ===
          formData.subLocation.toLowerCase(),
      )?.id ?? "",
    );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const [amenitiesRes, citiesRes, sublocationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/amenities`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/admin/cities/all`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/admin/sublocations/all`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (amenitiesRes.ok) {
          const json = await amenitiesRes.json();
          const arr = json.data?.items || json.items || json.data || json || [];
          setAmenities(Array.isArray(arr) ? arr : []);
        }

        if (citiesRes.ok) {
          const json = await citiesRes.json();
          const citiesData = (json.data || json || []) as AdminCity[];
          setAvailableCities(citiesData);
          
          if (sublocationsRes.ok) {
            const subJson = await sublocationsRes.json();
            setLocalities((subJson.data || subJson || []) as AdminSublocation[]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch form data", err);
      }
    };
    
    const fetchPropertyData = async () => {
      if (!id) return;
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const res = await fetch(`${API_BASE_URL}/admin/properties/${propertyType}/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const p = json.data || json;
          const propertyLocation = p.propertyLocations?.[0];
          const selectedSublocation = propertyLocation?.sublocation;
          const details = p.propertyDetails || {};
          setFormData({
            title: p.title || "",
            description: p.description || "",
            price: p.price ? String(p.price) : "",
            propertyType: p.propertyType || propertyType,
            status: p.status || "available",
            cityId: selectedSublocation?.cityId
              ? String(selectedSublocation.cityId)
              : "",
            sublocationId: propertyLocation?.locationId
              ? String(propertyLocation.locationId)
              : "",
            city: p.city || "",
            state: p.state || "",
            country: p.country || "India",
            slug: p.slug || "",
            builderName: p.builderName || "",
            subLocation: selectedSublocation?.localityName || "",
            bedrooms: details.bedrooms ? String(details.bedrooms) : "",
            bathrooms: details.bathrooms ? String(details.bathrooms) : "",
            areaSqft: details.areaSqft ? String(details.areaSqft) : "",
          });
          if (p.propertyAmenities) {
             setSelectedAmenities(
               p.propertyAmenities.map(
                 (amenity: { amenityId: number }) => amenity.amenityId,
               ),
             );
          }
          if (p.propertyFiles) {
             setExistingImages(
               p.propertyFiles.map(
                 (file: { fileUrl: string }) => file.fileUrl,
               ),
             );
          }
        }
      } catch (err) {
        console.error("Failed to fetch property", err);
      } finally {
        setLoadingProperty(false);
      }
    };

    Promise.all([fetchData(), fetchPropertyData()]);
  }, [id, propertyType]);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cityId") {
      const cityData = availableCities.find((city) => city.id === Number(value));
      setFormData({
        ...formData,
        cityId: value,
        city: cityData?.city_name || "",
        sublocationId: "",
        subLocation: "",
        state: cityData?.state_name || "",
        country: cityData?.country_name || "India",
      });
    } else if (name === "sublocationId") {
      const sublocation = localities.find((item) => item.id === Number(value));
      setFormData({
        ...formData,
        sublocationId: value,
        subLocation: sublocation?.locality_name || "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImagesToR2 = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const token = window.localStorage.getItem("majestan_access_token");

    for (const file of images) {
      // 1. Get Presigned URL
      const presignedRes = await fetch(
        `${API_BASE_URL}/admin/media/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!presignedRes.ok) {
        throw new Error("Failed to get presigned URL for " + file.name);
      }

      const { data } = await presignedRes.json();
      const { url, key } = data;

      // 2. Upload directly to R2
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload " + file.name + " to R2");
      }

      // Store the R2 key (we'll assume the public bucket URL will be formed by the backend or frontend)
      uploadedUrls.push(key);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadingImages(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");

      // 1. Upload Images
      const uploadedImageKeys = await uploadImagesToR2();
      setUploadingImages(false);

      // 2. Create Property
      const payload = {
        title: formData.title,
        price: formData.price,
        propertyType: formData.propertyType,
        status: formData.status,
        cityId: Number(resolvedCityId),
        sublocationId: Number(resolvedSublocationId),
        city: formData.city,
        state: formData.state,
        country: formData.country,
        builderName: formData.builderName,
        description: formData.description,
        details: {
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          areaSqft: Number(formData.areaSqft) || 0
        },
        location: {
          subLocation: formData.subLocation
        },
        amenities: selectedAmenities.map(id => ({ amenityId: id })),
        ownerId: 1, // Defaulting for now
        files: [
          ...existingImages.map(url => ({ fileType: "IMAGE", fileUrl: url })),
          ...uploadedImageKeys.map(key => ({ fileType: "IMAGE", fileUrl: key }))
        ]
      };

      const res = await fetch(`${API_BASE_URL}/admin/properties/${propertyType}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update property");
      }

      router.push("/admin/properties");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setUploadingImages(false);
      setLoading(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="w-full! max-w-5xl! mx-auto! space-y-6! flex! items-center! justify-center! h-64!">
        <div className="flex! items-center! gap-2! text-gray-500!">
          <Loader2 className="animate-spin!" size={20} />
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full! max-w-5xl! mx-auto! space-y-6!">
      <div className="flex! items-center! gap-4!">
        <Link href="/admin/properties" className="p-2! text-gray-500! hover:bg-white! rounded-xl! transition-colors!">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-[22px]! font-semibold! text-gray-800! tracking-tight!">Edit Property</h2>
      </div>

      {error && (
        <div className="p-4! bg-rose-50! text-rose-600! border! border-rose-100! rounded-xl! text-[14px]! font-medium!">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white! rounded-2xl! border! border-gray-100! shadow-[0_4px_20px_rgba(0,0,0,0.03)]! overflow-hidden!">
        <div className="p-8! space-y-8!">
          
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Property Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. Luxury 3BHK Villa" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Price (₹)</label>
              <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. 15000000" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Property Type</label>
              <div className="relative!">
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full! appearance-none! bg-gray-50! border! border-gray-200! text-gray-800! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-1! focus:ring-gray-900/50! outline-none! transition-all! cursor-pointer! block!">
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial Space</option>
                  <option value="coworking">Coworking</option>
                  <option value="farmland">Farmland</option>
                  <option value="industrial">Industrial Space</option>
                  <option value="individual_portion">Independent House</option>
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Property ID</label>
              <input 
                type="text" 
                readOnly 
                value={`Auto-generated (${
                  formData.propertyType === 'apartment' ? 'AP' : 
                  formData.propertyType === 'villa' ? 'V' : 
                  formData.propertyType === 'plot' ? 'P' : 
                  formData.propertyType === 'commercial' ? 'CS' :
                  formData.propertyType === 'coworking' ? 'CW' : 
                  formData.propertyType === 'farmland' ? 'FL' : 
                  formData.propertyType === 'industrial' ? 'IS' :
                  formData.propertyType === 'individual_portion' ? 'IP' : ''
                }-XXXX)`}
                className="w-full! bg-gray-50/50! border! border-gray-100! shadow-sm! rounded-xl! px-4! py-3! text-[14px]! text-gray-500! font-medium! cursor-not-allowed! outline-none!" 
              />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Status</label>
              <div className="relative!">
                <select name="status" value={formData.status} onChange={handleChange} className="w-full! appearance-none! bg-gray-50! border! border-gray-200! text-gray-800! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-1! focus:ring-gray-900/50! outline-none! transition-all! cursor-pointer! block!">
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable (Hidden)</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">City</label>
              <div className="relative!">
                <select required name="cityId" value={resolvedCityId} onChange={handleChange} className="w-full! appearance-none! bg-gray-50! border! border-gray-200! text-gray-800! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-1! focus:ring-gray-900/50! outline-none! transition-all! cursor-pointer! block!">
                  <option value="" disabled>Select City</option>
                  {availableCities.map(city => (
                    <option key={city.id} value={city.id}>{city.city_name}</option>
                  ))}
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Sublocation (Area)</label>
              <div className="relative!">
                <select required name="sublocationId" value={resolvedSublocationId} onChange={handleChange} disabled={!resolvedCityId} className="w-full! appearance-none! bg-gray-50! border! border-gray-200! text-gray-800! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-1! focus:ring-gray-900/50! outline-none! transition-all! cursor-pointer! block! disabled:opacity-50! disabled:cursor-not-allowed!">
                  <option value="" disabled>{resolvedCityId ? "Select Area" : "Select City First"}</option>
                  {availableSublocations.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.locality_name}</option>
                  ))}
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">State</label>
              <input required readOnly name="state" value={formData.state} className="w-full! bg-gray-50/50! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-500! shadow-sm!" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">BHKs / Bedrooms</label>
              <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. 3" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Bathrooms</label>
              <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. 2" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Area (Sqft)</label>
              <input name="areaSqft" type="number" value={formData.areaSqft} onChange={handleChange} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. 1500" />
            </div>

            <div className="space-y-2!">
              <label className="text-[14px]! font-medium! text-gray-800!">Builder Name</label>
              <input name="builderName" value={formData.builderName} onChange={handleChange} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="E.g. Sobha Developers" />
            </div>
          </div>

          <div className="space-y-2!">
            <label className="text-[14px]! font-medium! text-gray-800!">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! px-4! py-3! text-[14px]! text-gray-800! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! outline-none! transition-all!" placeholder="Detailed description of the property..."></textarea>
          </div>

          {/* Amenities Section */}
          <div className="pt-6! border-t! border-gray-100!">
            <h3 className="text-lg! font-semibold! text-gray-800! mb-4!">Amenities</h3>
            <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-3!">
              {amenities.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex! items-center! gap-3! p-3! rounded-xl! border! text-[14px]! font-medium! transition-all! ${
                    selectedAmenities.includes(amenity.id) 
                      ? 'bg-gray-900! border-gray-900! text-white!' 
                      : 'bg-white! border-gray-200! text-gray-700! hover:border-gray-300! hover:bg-gray-50!'
                  }`}
                >
                  <div className={`w-5! h-5! rounded-md! border! flex! items-center! justify-center! ${
                    selectedAmenities.includes(amenity.id)
                      ? 'bg-white! border-white!'
                      : 'bg-white! border-gray-300!'
                  }`}>
                    {selectedAmenities.includes(amenity.id) && <Check size={14} className="text-gray-800!" />}
                  </div>
                  {amenity.name}
                </button>
              ))}
              {amenities.length === 0 && (
                <div className="col-span-full! text-[14px]! text-gray-500! italic!">No amenities available.</div>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="pt-6! border-t! border-gray-100!">
            <h3 className="text-lg! font-semibold! text-gray-800! mb-4!">Property Images</h3>
            
            <div className="grid! grid-cols-2! sm:grid-cols-3! md:grid-cols-4! lg:grid-cols-5! gap-4!">
              {existingImages.map((img, i) => (
                <div key={`exist-${i}`} className="relative! aspect-square! rounded-2xl! overflow-hidden! border! border-gray-200! group!">
                  <img src={img} alt="Existing Preview" className="w-full! h-full! object-cover!" />
                  <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute! top-2! right-2! p-1.5! bg-white/90! hover:bg-rose-50! text-gray-600! hover:text-rose-600! rounded-lg! backdrop-blur-sm! transition-colors! opacity-0! group-hover:opacity-100!">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {images.map((img, i) => (
                <div key={i} className="relative! aspect-square! rounded-2xl! overflow-hidden! border! border-gray-200! group!">
                  <img src={URL.createObjectURL(img)} alt="Preview" className="w-full! h-full! object-cover!" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute! top-2! right-2! p-1.5! bg-white/90! hover:bg-rose-50! text-gray-600! hover:text-rose-600! rounded-lg! backdrop-blur-sm! transition-colors! opacity-0! group-hover:opacity-100!">
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <label className="relative! aspect-square! rounded-2xl! border-2! border-dashed! border-gray-300! hover:border-gray-400! hover:bg-gray-50! flex! flex-col! items-center! justify-center! gap-2! cursor-pointer! transition-all!">
                <ImagePlus className="text-gray-400!" size={28} />
                <span className="text-[12px]! font-semibold! text-gray-500!">Add Images</span>
                <input type="file" multiple accept="image/*" className="hidden!" onChange={handleImageChange} />
              </label>
            </div>
          </div>

        </div>

        <div className="p-6! bg-gray-50! border-t! border-gray-100! flex! justify-end! gap-4!">
          <Link href="/admin/properties" className="px-6! py-3! text-[14px]! font-semibold! text-gray-600! hover:text-gray-800! transition-colors!">Cancel</Link>
          <button disabled={loading} type="submit" className="inline-flex! items-center! gap-2! px-8! py-3! bg-blue-600! hover:bg-blue-700! text-white! shadow-sm! hover:shadow-blue-500/20! rounded-xl! text-[14px]! font-semibold! transition-all! disabled:opacity-70!">
            {loading ? <Loader2 size={18} className="animate-spin!" /> : <Save size={18} />}
            {uploadingImages ? "Uploading Images..." : loading ? "Saving..." : "Update Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
