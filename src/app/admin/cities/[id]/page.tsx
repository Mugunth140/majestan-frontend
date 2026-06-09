"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { INDIA_STATES_AND_UNION_TERRITORIES } from "@/lib/location-options";

export default function AdminEditCityPage() {
  const router = useRouter();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    city_name: "",
    state_name: "",
    country_name: "India",
    country_code: "IN",
    is_active: 1
  });

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const res = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const city = json.data;
          if (city) {
            setFormData({
              city_name: city.city_name || "",
              state_name: city.state_name || "",
              country_name: city.country_name || "India",
              country_code: city.country_code || "IN",
              is_active: city.is_active !== undefined ? city.is_active : 1
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCity();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to update city");
      }

      alert("City updated successfully!");
      router.push("/admin/cities");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6!">Loading...</div>;
  }

  return (
    <div className="p-6! max-w-4xl! mx-auto! space-y-6!">
      <div className="flex! items-center! gap-4!">
        <Link href="/admin/cities" className="p-2! hover:bg-gray-100! rounded-xl! transition-colors!">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl! font-bold! text-gray-900!">Edit City</h1>
          <p className="text-sm! text-gray-500! mt-1!">Update city details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! overflow-hidden!">
        <div className="p-6! space-y-6!">
          
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">City Name <span className="text-red-500!">*</span></label>
              <input
                type="text"
                required
                value={formData.city_name}
                onChange={(e) => setFormData({...formData, city_name: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                placeholder="e.g., Chennai"
              />
            </div>
            
            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">State Name <span className="text-red-500!">*</span></label>
              <select
                required
                value={formData.state_name}
                onChange={(e) => setFormData({...formData, state_name: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
              >
                <option value="" disabled>Select a state or union territory</option>
                {INDIA_STATES_AND_UNION_TERRITORIES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Country</label>
              <input
                type="text"
                readOnly
                value={formData.country_name}
                className="w-full! px-4! py-2.5! bg-gray-100! border! border-gray-200! rounded-xl! text-sm! text-gray-600!"
              />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Status</label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6! bg-gray-50/50! border-t! border-gray-100! flex! justify-end! gap-3!">
          <Link
            href="/admin/cities"
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
