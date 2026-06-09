"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function AdminNewCityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    city_name: "",
    state_name: "",
    country_name: "India",
    country_code: "IN",
    is_active: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        throw new Error("Failed to add city");
      }

      alert("City added successfully!");
      router.push("/admin/cities");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6! max-w-4xl! mx-auto! space-y-6!">
      <div className="flex! items-center! gap-4!">
        <Link href="/admin/cities" className="p-2! hover:bg-gray-100! rounded-xl! transition-colors!">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl! font-bold! text-gray-900!">Add City</h1>
          <p className="text-sm! text-gray-500! mt-1!">Create a new city for property listings.</p>
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
              <label className="text-sm! font-medium! text-gray-900!">State Name</label>
              <input
                type="text"
                value={formData.state_name}
                onChange={(e) => setFormData({...formData, state_name: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                placeholder="e.g., Tamil Nadu"
              />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Country</label>
              <input
                type="text"
                value={formData.country_name}
                onChange={(e) => setFormData({...formData, country_name: e.target.value})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                placeholder="e.g., India"
              />
            </div>

            <div className="space-y-2!">
              <label className="text-sm! font-medium! text-gray-900!">Status</label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                className="w-full! px-4! py-2.5! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! transition-all!"
                style={{ display: "block", visibility: "visible", width: "100%", height: "50px", border: "2px solid black", backgroundColor: "white", color: "black", opacity: 1, position: "relative", zIndex: 10, appearance: "auto" }}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6! bg-gray-50/50! border-t! border-gray-100! flex! justify-end! gap-3!" style={{ display: 'block', width: '100%', minHeight: '45px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#111827', borderRadius: '0.75rem', padding: '0.625rem 1rem', opacity: 1, position: 'relative', zIndex: 10, appearance: 'auto' }}>
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
            Save City
          </button>
        </div>
      </form>
    </div>
  );
}
