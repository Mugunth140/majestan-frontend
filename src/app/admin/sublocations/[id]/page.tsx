"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import type { AdminCity } from "@/lib/location-options";
import { toast } from "@/components/ui/toast-store";

export default function AdminEditSublocationPage() {
  const router = useRouter();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<AdminCity[]>([]);
  
  const [formData, setFormData] = useState({
    city_id: "",
    locality_name: "",
    postal_code: "",
    is_active: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        
        // Fetch cities
        const citiesRes = await fetch(`${API_BASE_URL}/admin/cities/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (citiesRes.ok) {
          const json = await citiesRes.json();
          const arr = json.data || json || [];
          setCities(Array.isArray(arr) ? arr : []);
        }

        // Fetch sublocation
        const res = await fetch(`${API_BASE_URL}/admin/sublocations/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const sub = json.data || json;
          if (sub) {
            setFormData({
              city_id: sub.city_id ? sub.city_id.toString() : "",
              locality_name: sub.locality_name || "",
              postal_code: sub.postal_code || "",
              is_active: sub.is_active !== undefined ? sub.is_active : 1
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city_id) {
      toast.warning("Please select a city");
      return;
    }

    setSaving(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/sublocations/${id}`, {
        method: "PATCH",
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
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to update sublocation");
      }

      toast.success("Sublocation updated !successfully");
      router.push("/admin/sublocations");
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="!p-6">Loading...</div>;
  }

  return (
    <div className="!p-6 !w-full !space-y-6">
      <div className="!flex !items-center !gap-4">
        <Link href="/admin/sublocations" className="!p-2 hover:!bg-gray-100 dark:hover:!bg-[#262730] dark:!bg-[#262730] !rounded-xl !transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">Edit Sublocation</h1>
          <p className="!text-[14px] !text-gray-500 dark:!text-gray-400 !mt-1">Update area details and city mapping.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        <div className="!p-6 !space-y-6">
          
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            
            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Select City <span className="!text-red-500">*</span></label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                className="ignore !block !w-full !px-4 !py-2.5 !bg-gray-50 dark:!bg-[#1c1d27] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white !appearance-auto focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !transition-all"
              >
                <option value="">-- Select a City --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name} {city.state_name ? `(${city.state_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Sublocation / Locality Name <span className="!text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.locality_name}
                onChange={(e) => setFormData({...formData, locality_name: e.target.value})}
                className="!w-full !px-4 !py-2.5 !bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !transition-all"
                placeholder="e.g., Velachery"
              />
            </div>

            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Postal / PIN Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                className="!w-full !px-4 !py-2.5 !bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !transition-all"
                placeholder="e.g., 600042"
              />
            </div>

            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Status</label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                className="ignore !block !w-full !px-4 !py-2.5 !bg-gray-50 dark:!bg-[#1c1d27] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white !appearance-auto focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !transition-all"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="!p-6 !bg-gray-50 dark:!bg-[#1c1d27]/50 !border-t !border-gray-100 dark:!border-[#262730] !flex !justify-end !gap-3">
          <Link
            href="/admin/sublocations"
            className="!px-6 !py-2.5 !text-[14px] !font-medium !text-gray-600 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-[#262730] dark:!bg-[#262730] !rounded-xl !transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="!inline-flex !items-center !gap-2 !px-6 !py-2.5 !bg-blue-600 hover:!bg-blue-700 !text-white !text-[14px] !font-medium !rounded-xl !transition-all disabled:!opacity-50"
          >
            {saving ? (
              <div className="!w-5 !h-5 !border-2 !border-current !border-t-transparent !rounded-full !animate-spin" />
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
