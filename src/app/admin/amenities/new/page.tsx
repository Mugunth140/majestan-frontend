"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";

export default function AdminNewAmenityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    slug: "",
    is_active: 1
  });

  const AMENITY_CATEGORIES = [
    'security', 'utilities', 'recreation', 'community', 
    'connectivity', 'interior', 'feature', 'utility', 'other'
  ];

  const handleNameChange = (val: string) => {
    // auto-generate slug from name
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name: val, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }
    
    setSaving(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/amenities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.localStorage.removeItem("majestan_access_token");
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to add amenity");
      }

      toast.success("Amenity added successfully!");
      router.push("/admin/amenities");
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="!p-6 !w-full !space-y-6">
      <div className="!flex !items-center !gap-4">
        <Link href="/admin/amenities" className="!p-2 hover:!bg-gray-100 dark:hover:!bg-[#262730] dark:!bg-[#262730] !rounded-xl !transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">Add Amenity</h1>
          <p className="!text-[14px] !text-gray-500 dark:!text-gray-400 !mt-1">Create a new amenity for property listings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        <div className="!p-6 !space-y-6">
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            
            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Amenity Name <span className="!text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="!w-full !px-4 !py-2.5 !bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !transition-all"
                placeholder="e.g., Swimming Pool"
              />
            </div>
            
            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">URL Slug <span className="!text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')})}
                className="!w-full !px-4 !py-2.5 !bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !transition-all"
                placeholder="e.g., swimming-pool"
              />
            </div>

            <div className="!space-y-2">
              <label className="!text-[14px] !font-medium !text-gray-800 dark:!text-white">Category <span className="!text-red-500">*</span></label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="ignore !block !w-full !px-4 !py-2.5 !bg-gray-50 dark:!bg-[#1c1d27] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !text-[14px] !text-gray-800 dark:!text-white !appearance-auto focus:!outline-none focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !transition-all"
              >
                {AMENITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="!capitalize">{cat}</option>
                ))}
              </select>
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
            href="/admin/amenities"
            className="!px-6 !py-2.5 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 hover:!bg-gray-100 dark:hover:!bg-[#262730] dark:!bg-[#262730] !rounded-xl !transition-colors"
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
            Save Amenity
          </button>
        </div>
      </form>
    </div>
  );
}
