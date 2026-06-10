"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";
import Swal from "sweetalert2";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCities = async () => {
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/cities`);
      if (search) url.searchParams.append("search", search);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
        setCities(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Are you sure?", text: "This city will be deleted permanently.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#9ca3af", confirmButtonText: "Yes, delete it!" });
    if (!result.isConfirmed) return;
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCities();
      } else {
        toast.error("Failed to delete city");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (isActive: number) => {
    return isActive ? (
      <span className="px-3! py-1! bg-emerald-50! text-emerald-600! rounded-full! text-[12px]! font-medium! border! border-emerald-100!">
        Active
      </span>
    ) : (
      <span className="px-3! py-1! bg-gray-50! text-gray-500! rounded-full! text-[12px]! font-medium! border! border-gray-200!">
        Inactive
      </span>
    );
  };

  return (
    <div className="px-3! w-full! space-y-3!">
      {/* Header */}
      <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4!">
        <div>
          <h1 className="text-2xl! font-medium! text-gray-800! tracking-tight! ml-3!">Cities</h1>
        </div>
        <Link 
          href="/admin/cities/new" 
          className="inline-flex! items-center! justify-center! gap-2! bg-blue-600! hover:bg-blue-700! text-white! px-4! py-2! rounded-xl! font-medium! transition-all! shadow-sm! hover:shadow-blue-500/20!"
        >
          <Plus size={20} />
          Add City
        </Link>
      </div>

      {/* Filters */}
      <div>
        <div className="relative! m-2.5! outline! outline-gray-200! rounded-2xl! focus-within:outline-blue-500/50! focus-within:outline-2! transition-all!">
          <Search className="absolute! left-3! top-1/2! -translate-y-1/2! text-gray-400!" size={20} />
          <input
            type="text"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full! pl-10! pr-4! py-2.5! bg-[#fbfbfc]! border! border-gray-100! rounded-xl! text-[14px]! text-gray-800! focus:outline-none! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! transition-all!"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-[0_4px_20px_rgba(0,0,0,0.03)]! overflow-hidden!">
        <div className="overflow-x-auto!">
          <table className="w-full! text-left! border-collapse!">
            <thead>
              <tr className="bg-[#fbfbfc]! border-b! border-gray-100!">
                <th className="px-6! py-4! text-[12px]! font-semibold! text-gray-500! uppercase! tracking-wider!">City</th>
                <th className="px-6! py-4! text-[12px]! font-semibold! text-gray-500! uppercase! tracking-wider!">State / Country</th>
                <th className="px-6! py-4! text-[12px]! font-semibold! text-gray-500! uppercase! tracking-wider!">Status</th>
                <th className="px-6! py-4! text-[12px]! font-semibold! text-gray-500! uppercase! tracking-wider! text-right!">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y! divide-gray-100!">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6! py-12! text-center!">
                    <div className="flex! items-center! justify-center! gap-2! text-gray-400!">
                      <div className="w-5! h-5! border-2! border-current! border-t-transparent! rounded-full! animate-spin!" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6! py-12! text-center! text-gray-500!">
                    No cities found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city.id} className="bg-white! hover:bg-[#fbfbfc]! transition-colors! group!">
                    <td className="px-6! py-4!">
                      <div className="flex! items-center! gap-3!">
                        <div className="w-10! h-10! rounded-lg! bg-gray-100! flex! items-center! justify-center! text-gray-400! shrink-0!">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div className="font-medium! text-gray-800! group-hover:text-blue-600! transition-colors! capitalize!">{city.city_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-800! capitalize!">{city.state_name || 'N/A'}</div>
                      <div className="text-[12px]! text-gray-400! mt-0.5!">{city.country_name || 'N/A'} ({city.country_code})</div>
                    </td>
                    <td className="px-6! py-4!">
                      {getStatusBadge(city.is_active)}
                    </td>
                    <td className="px-6! py-4! text-right!">
                      <div className="flex! items-center! justify-end! gap-2!">
                        <Link href={`/admin/cities/${city.id}`} className="p-2! text-gray-400! hover:text-emerald-600! hover:bg-emerald-50! rounded-lg! transition-colors!" title="Edit City">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(city.id)} className="p-2! text-gray-400! hover:text-rose-600! hover:bg-rose-50! rounded-lg! transition-colors!" title="Delete City">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}