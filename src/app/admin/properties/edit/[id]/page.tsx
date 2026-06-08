"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Upload, X, Save, ArrowLeft, Loader2, ImagePlus, Check, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "apartment",
    status: "AVAILABLE",
    city: "",
    state: "",
    country: "India",
    slug: "",
    builderName: "",
    subLocation: "",
    bedrooms: "",
    areaSqft: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [amenities, setAmenities] = useState<{ id: number; name: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/amenities`);
        if (res.ok) {
          const json = await res.json();
          setAmenities(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch amenities", err);
      }
    };
    fetchAmenities();
  }, []);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        description: formData.description,
        price: formData.price,
        propertyType: formData.propertyType,
        status: formData.status,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        slug: formData.slug,
        builderName: formData.builderName,
        details: {
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : undefined,
        },
        location: {
          subLocation: formData.subLocation
        },
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          canonicalUrl: formData.canonicalUrl,
          ogTitle: formData.ogTitle,
          ogDescription: formData.ogDescription,
        },
        amenities: selectedAmenities.map(id => ({ amenityId: id })),
        ownerId: 1, // Defaulting for now
        files: uploadedImageKeys.map(key => ({
          fileType: "IMAGE",
          fileUrl: key
        }))
      };

      const res = await fetch(`${API_BASE_URL}/admin/properties/${formData.propertyType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create property");
      }

      router.push("/admin/properties");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setUploadingImages(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full! max-w-5xl! mx-auto! space-y-6!">
      <div className="flex! items-center! gap-4!">
        <Link href="/admin/properties" className="p-2! text-[var(--admin-text)]! bg-[var(--admin-surface)]! border! border-[var(--admin-border)]! hover:bg-[var(--admin-text)]! hover:text-[var(--admin-bg)]! transition-all!">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl! font-black! text-[var(--admin-text)]! uppercase! tracking-widest!">Add New Property</h2>
      </div>

      {error && (
        <div className="p-4! bg-rose-50! dark:bg-rose-950/50! text-rose-600! dark:text-rose-400! border! border-rose-600! text-sm! font-bold! uppercase! tracking-wider!">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[var(--admin-surface)]! border! border-[var(--admin-border)]! shadow-sm!">
        <div className="p-8! space-y-8!">
          
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Property Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. LUXURY 3BHK VILLA" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Price (₹)</label>
              <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. 15000000" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Property Type</label>
              <div className="relative!">
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full! appearance-none! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! uppercase! pl-4! pr-10! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all! cursor-pointer! block!">
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial Space</option>
                  <option value="coworking">Coworking</option>
                  <option value="farmland">Farmland</option>
                  <option value="industrial">Industrial Space</option>
                  <option value="individual_portion">Independent House</option>
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-[var(--admin-text-muted)]!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Property ID</label>
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
                }...)`}
                className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! px-4! py-3! text-sm! text-[var(--admin-text-muted)]! font-bold! uppercase! cursor-not-allowed! outline-none! opacity-70!" 
              />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Status</label>
              <div className="relative!">
                <select name="status" value={formData.status} onChange={handleChange} className="w-full! appearance-none! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! uppercase! pl-4! pr-10! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all! cursor-pointer! block!">
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable (Hidden)</option>
                  <option value="SOLD">Sold</option>
                  <option value="RENTED">Rented</option>
                </select>
                <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-[var(--admin-text-muted)]!">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">City</label>
              <input required name="city" value={formData.city} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. COIMBATORE" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Sublocation (Area)</label>
              <input required name="subLocation" value={formData.subLocation} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. THONDAMUTHUR" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">State</label>
              <input required name="state" value={formData.state} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. TAMIL NADU" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">BHKs / Bedrooms</label>
              <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. 3" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Area (Sqft)</label>
              <input name="areaSqft" type="number" value={formData.areaSqft} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. 1500" />
            </div>

            <div className="space-y-2!">
              <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Builder Name</label>
              <input name="builderName" value={formData.builderName} onChange={handleChange} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="E.G. SOBHA DEVELOPERS" />
            </div>
          </div>

          <div className="space-y-2!">
            <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! px-4! py-3! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! outline-none! transition-all!" placeholder="Detailed description of the property..."></textarea>
          </div>

          {/* Amenities Section */}
          <div className="pt-8! border-t! border-[var(--admin-border)]!">
            <h3 className="text-lg! font-black! text-[var(--admin-text)]! uppercase! tracking-widest! mb-6!">Amenities</h3>
            <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-4!">
              {amenities.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex! items-center! gap-3! p-4! border! text-sm! font-bold! uppercase! tracking-wider! transition-all! ${
                    selectedAmenities.includes(amenity.id) 
                      ? 'bg-[var(--admin-text)]! border-[var(--admin-text)]! text-[var(--admin-bg)]!' 
                      : 'bg-[var(--admin-bg)]! border-[var(--admin-border)]! text-[var(--admin-text)]! hover:border-[var(--admin-text)]!'
                  }`}
                >
                  <div className={`w-5! h-5! border! flex! items-center! justify-center! transition-colors! ${
                    selectedAmenities.includes(amenity.id)
                      ? 'bg-[var(--admin-bg)]! border-[var(--admin-bg)]!'
                      : 'bg-[var(--admin-bg)]! border-[var(--admin-border)]!'
                  }`}>
                    {selectedAmenities.includes(amenity.id) && <Check size={14} className="text-[var(--admin-text)]!" strokeWidth={3} />}
                  </div>
                  {amenity.name}
                </button>
              ))}
              {amenities.length === 0 && (
                <div className="col-span-full! text-sm! text-[var(--admin-text-muted)]! font-bold! uppercase! tracking-widest!">No amenities available.</div>
              )}
            </div>
          </div>

          {/* SEO Metadata Section */}
          <div className="pt-8! border-t! border-[var(--admin-border)]!">
            <h3 className="text-lg! font-black! text-[var(--admin-text)]! uppercase! tracking-widest! mb-6!">SEO Metadata</h3>
            <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
              <div>
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Meta Title</label>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="SEO Title" />
              </div>
              <div>
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Canonical URL</label>
                <input name="canonicalUrl" value={formData.canonicalUrl} onChange={handleChange} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="https://..." />
              </div>
              <div className="md:col-span-2!">
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={2} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="Brief description for search engines" />
              </div>
              <div className="md:col-span-2!">
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Meta Keywords</label>
                <input name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="keyword1, keyword2, keyword3" />
              </div>
              <div>
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">OG Title</label>
                <input name="ogTitle" value={formData.ogTitle} onChange={handleChange} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="Open Graph Title" />
              </div>
              <div>
                <label className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">OG Description</label>
                <input name="ogDescription" value={formData.ogDescription} onChange={handleChange} className="w-full! mt-2! px-4! py-3! bg-[var(--admin-bg)]! border! border-[var(--admin-border)]! text-[var(--admin-text)]! text-sm! font-bold! focus:ring-0! focus:border-[var(--admin-text)]! transition-all!" placeholder="Open Graph Description" />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="pt-8! border-t! border-[var(--admin-border)]!">
            <h3 className="text-lg! font-black! text-[var(--admin-text)]! uppercase! tracking-widest! mb-6!">Property Images</h3>
            
            <div className="grid! grid-cols-2! sm:grid-cols-3! md:grid-cols-4! lg:grid-cols-5! gap-4!">
              {images.map((img, i) => (
                <div key={i} className="relative! aspect-square! border! border-[var(--admin-border)]! overflow-hidden! group!">
                  <img src={URL.createObjectURL(img)} alt="Preview" className="w-full! h-full! object-cover!" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute! top-2! right-2! p-2! bg-[var(--admin-bg)]! hover:bg-rose-600! text-[var(--admin-text)]! hover:text-white! transition-colors! opacity-0! group-hover:opacity-100! border! border-[var(--admin-border)]!">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              
              <label className="relative! aspect-square! border-2! border-dashed! border-[var(--admin-border)]! hover:border-[var(--admin-text)]! bg-[var(--admin-bg)]! flex! flex-col! items-center! justify-center! gap-2! cursor-pointer! transition-all!">
                <ImagePlus className="text-[var(--admin-text-muted)]!" size={28} />
                <span className="text-xs! font-black! text-[var(--admin-text-muted)]! uppercase! tracking-widest!">Add Images</span>
                <input type="file" multiple accept="image/*" className="hidden!" onChange={handleImageChange} />
              </label>
            </div>
          </div>

        </div>

        <div className="p-6! bg-[var(--admin-bg)]! border-t! border-[var(--admin-border)]! flex! justify-end! gap-4!">
          <Link href="/admin/properties" className="px-8! py-4! text-sm! font-black! text-[var(--admin-text)]! hover:bg-[var(--admin-surface)]! border! border-transparent! hover:border-[var(--admin-border)]! uppercase! tracking-widest! transition-all!">Cancel</Link>
          <button disabled={loading} type="submit" className="inline-flex! items-center! gap-2! px-8! py-4! bg-[var(--admin-text)]! text-[var(--admin-bg)]! text-sm! font-black! uppercase! tracking-widest! transition-all! disabled:opacity-70! hover:opacity-90!">
            {loading ? <Loader2 size={18} className="animate-spin!" /> : <Save size={18} />}
            {uploadingImages ? "Uploading Images..." : loading ? "Saving..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
