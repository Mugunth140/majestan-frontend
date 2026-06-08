"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Upload, X, Save, ArrowLeft, Loader2, ImagePlus } from "lucide-react";
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
  });

  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
        ...formData,
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
        <Link href="/admin/properties" className="p-2! text-gray-500! hover:bg-white! rounded-xl! transition-colors!">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Add New Property</h2>
      </div>

      {error && (
        <div className="p-4! bg-rose-50! text-rose-600! border! border-rose-100! rounded-xl! text-sm! font-medium!">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white! rounded-3xl! shadow-sm! border! border-gray-100! overflow-hidden!">
        <div className="p-8! space-y-8!">
          
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">Property Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!" placeholder="E.g. Luxury 3BHK Villa in Indiranagar" />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">Price (₹)</label>
              <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!" placeholder="E.g. 15000000" />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!">
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="independent-house">Independent House</option>
                <option value="commercial-space">Commercial</option>
              </select>
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!">
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
              </select>
            </div>
            
            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">City</label>
              <input required name="city" value={formData.city} onChange={handleChange} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!" placeholder="E.g. Coimbatore" />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-bold! text-gray-700!">State</label>
              <input required name="state" value={formData.state} onChange={handleChange} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!" placeholder="E.g. Tamil Nadu" />
            </div>
          </div>

          <div className="space-y-2!">
            <label className="text-sm! font-bold! text-gray-700!">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full! bg-gray-50! border! border-gray-200! rounded-xl! px-4! py-3! text-sm! focus:ring-2! focus:ring-gray-900! focus:border-gray-900! outline-none! transition-all!" placeholder="Detailed description of the property..."></textarea>
          </div>

          {/* Image Upload Section */}
          <div className="pt-6! border-t! border-gray-100!">
            <h3 className="text-lg! font-bold! text-gray-900! mb-4!">Property Images</h3>
            
            <div className="grid! grid-cols-2! sm:grid-cols-3! md:grid-cols-4! lg:grid-cols-5! gap-4!">
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
                <span className="text-xs! font-bold! text-gray-500!">Add Images</span>
                <input type="file" multiple accept="image/*" className="hidden!" onChange={handleImageChange} />
              </label>
            </div>
          </div>

        </div>

        <div className="p-6! bg-gray-50! border-t! border-gray-100! flex! justify-end! gap-4!">
          <Link href="/admin/properties" className="px-6! py-3! text-sm! font-bold! text-gray-600! hover:text-gray-900! transition-colors!">Cancel</Link>
          <button disabled={loading} type="submit" className="inline-flex! items-center! gap-2! px-8! py-3! bg-gray-900! hover:bg-gray-800! text-white! rounded-xl! text-sm! font-bold! transition-all! disabled:opacity-70!">
            {loading ? <Loader2 size={18} className="animate-spin!" /> : <Save size={18} />}
            {uploadingImages ? "Uploading Images..." : loading ? "Saving..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
