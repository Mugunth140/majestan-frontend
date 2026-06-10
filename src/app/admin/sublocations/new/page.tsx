"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import type { AdminCity } from "@/lib/location-options";

export default function AdminNewSublocationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState<AdminCity[]>([]);
  
  const [formData, setFormData] = useState({
    city_id: "",
    locality_name: "",
    postal_code: "",
    is_active: 1
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const res = await fetch(`${API_BASE_URL}/admin/cities/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const arr = json.data || json || [];
          setCities(Array.isArray(arr) ? arr : []);
        }
      } catch (e) {
        console.error("Failed to fetch cities", e);
      }
    };
    fetchCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city_id) {
      alert("Please select a city");
      return;
    }
    
    setSaving(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/sublocations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: {
          ...formData,
          city_id: parseInt(formData.city_id)
        }}),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.localStorage.removeItem("majestan_access_token");
          alert("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to add sublocation");
      }

      alert("Sublocation added successfully!");
      router.push("/admin/sublocations");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6! max-w-4xl! mx-auto! space-y-6!">
      <div className="flex! items-center! gap-4!">
        <Link href="/admin/sublocations" className="p-2! hover:bg-gray-100! rounded-xl! transition-colors!">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl! font-bold! text-gray-900!">Add Sublocation</h1>
          <p className="text-sm! text-gray-500! mt-1!">Create a new sublocation or area and map it to a city.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! overflow-hidden!">
        <div className="p-6! space-y-6!">
          
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Select City <span className="text-red-500!">*</span></label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                className="ignore block! w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! text-gray-900! appearance-auto! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
              >
                <option value="">-- Select a City --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name} {city.state_name ? '(' + city.state_name + ')' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Sublocation / Locality Name <span className="text-red-500!">*</span></label>
              <input
                type="text"
                required
                value={formData.locality_name}
                onChange={(e) => setFormData({...formData, locality_name: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                placeholder="e.g., Velachery"
              />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Postal / PIN Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                placeholder="e.g., 600042"
              />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Status</label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                className="ignore block! w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! text-gray-900! appearance-auto! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6! bg-gray-50/50! border-t! border-gray-100! flex! justify-end! gap-3!">
          <Link
            href="/admin/sublocations"
            className="px-6! py-2.5! text-sm! font-medium! text-gray-600! hover:bg-gray-100! rounded-xl! transition-colors!"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex! items-center! gap-2! px-6! py-2.5! bg-blue-600! hover:bg-blue-700! text-white! text-sm! font-medium! rounded-xl! transition-all! disabled:opacity-50!"
          >
            {saving ? (
              <div className="w-5! h-5! border-2! border-current! border-t-transparent! rounded-full! animate-spin!" />
            ) : (
              <Save size={18} />
            )}
            Save Sublocation
          </button>
        </div>
      </form>
    </div>
  );
}
