"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { MapPin, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function NewLocalityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cityName: "",
    localityName: "",
    stateName: "Tamil Nadu",
    countryName: "India",
    countryCode: "IN",
    postalCode: "",
    isActive: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? ((e.target as HTMLInputElement).checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/localities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            city_name: formData.cityName,
            locality_name: formData.localityName || null,
            state_name: formData.stateName,
            country_name: formData.countryName,
            country_code: formData.countryCode,
            postal_code: formData.postalCode || null,
            is_active: formData.isActive
          }
        })
      });

      if (!res.ok) {
        throw new Error("Failed to add locality");
      }

      alert("Locality added successfully!");
      router.push("/admin/localities");
    } catch (e) {
      console.error(e);
      alert("Failed to add locality. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full! max-w-4xl! mx-auto! space-y-6!">
      <div className="flex! items-center! justify-between! gap-4!">
        <div className="flex! items-center! gap-4!">
          <Link href="/admin/localities" className="p-2.5! bg-white! border! border-gray-200! rounded-xl! hover:bg-gray-50! transition-colors! text-gray-600!">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Add Locality</h2>
            <p className="text-sm! text-gray-500! mt-1!">Create a new city or sublocation</p>
          </div>
        </div>
      </div>

      <div className="bg-white! rounded-3xl! shadow-sm! border! border-gray-100! overflow-hidden!">
        <form onSubmit={handleSubmit} className="p-6! sm:p-8! space-y-8!">
          <div className="grid! grid-cols-1! sm:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="block! text-sm! font-medium! text-gray-700!">City Name *</label>
              <input
                type="text"
                name="cityName"
                value={formData.cityName}
                onChange={handleChange}
                required
                className="w-full! px-4! py-3! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-gray-900! transition-all!"
                placeholder="e.g. Coimbatore"
              />
            </div>
            
            <div className="space-y-2!">
              <label className="block! text-sm! font-medium! text-gray-700!">Sublocation / Area</label>
              <input
                type="text"
                name="localityName"
                value={formData.localityName}
                onChange={handleChange}
                className="w-full! px-4! py-3! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-gray-900! transition-all!"
                placeholder="e.g. RS Puram (Leave blank if adding a city only)"
              />
            </div>

            <div className="space-y-2!">
              <label className="block! text-sm! font-medium! text-gray-700!">State *</label>
              <input
                type="text"
                name="stateName"
                value={formData.stateName}
                onChange={handleChange}
                required
                className="w-full! px-4! py-3! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-gray-900! transition-all!"
                placeholder="e.g. Tamil Nadu"
              />
            </div>
            
            <div className="space-y-2!">
              <label className="block! text-sm! font-medium! text-gray-700!">Pincode / Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full! px-4! py-3! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-gray-900! transition-all!"
                placeholder="e.g. 641002"
              />
            </div>
          </div>
          
          <div className="flex! items-center! gap-2!">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive === 1}
              onChange={handleChange}
              className="w-4! h-4! text-gray-900! bg-gray-100! border-gray-300! rounded! focus:ring-gray-900!"
            />
            <label htmlFor="isActive" className="text-sm! font-medium! text-gray-700!">Active Status</label>
          </div>

          <div className="flex! items-center! justify-end! gap-3! pt-6! border-t! border-gray-100!">
            <Link href="/admin/localities" className="px-5! py-2.5! text-sm! font-medium! text-gray-600! hover:bg-gray-50! rounded-xl! transition-colors!">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex! items-center! gap-2! px-6! py-2.5! bg-gray-900! hover:bg-gray-800! text-white! text-sm! font-medium! rounded-xl! transition-all! disabled:opacity-50! disabled:cursor-not-allowed!"
            >
              {submitting ? <Loader2 size={18} className="animate-spin!" /> : <Save size={18} />}
              Save Locality
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
