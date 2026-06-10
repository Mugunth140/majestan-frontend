"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  CheckCircle2, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/amenities`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
          setAmenities(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAmenities();
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-emerald-50! text-emerald-600!"><CheckCircle size={12} /> Active</span>;
    }
    return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-gray-50! text-gray-600!"><XCircle size={12} /> Inactive</span>;
  };

  return (
    <div className="w-full! max-w-7xl! mx-auto! space-y-6!">
      <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4!">
        <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Amenities Management</h2>
        <Link href="/admin/amenities/new" className="inline-flex! items-center! gap-2! bg-gray-900! hover:bg-gray-800! text-white! px-5! py-2.5! rounded-xl! font-medium! transition-all! shadow-sm!">
          <Plus size={18} />
          Add Amenity
        </Link>
      </div>
      
      <div className="bg-white! rounded-3xl! shadow-sm! border! border-gray-100! overflow-hidden!">
        {/* Toolbar */}
        <div className="p-5! border-b! border-gray-100! flex! flex-col! sm:flex-row! gap-4! items-center! justify-between!">
          <div className="flex! items-center! gap-3! w-full! sm:w-auto!">
            <button className="p-2.5! text-gray-500! hover:bg-gray-50! rounded-xl! border! border-gray-200! transition-colors!">
              <Filter size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative! w-full! sm:w-80!">
            <div className="absolute! inset-y-0! left-0! flex! items-center! pl-3! pointer-events-none!">
              <Search size={18} className="text-gray-400!" />
            </div>
            <input 
              type="text" 
              className="bg-gray-50! border! border-gray-200! text-gray-900! text-sm! rounded-xl! focus:ring-gray-900! focus:border-gray-900! block! w-full! pl-10! p-2.5! outline-none! transition-all!" 
              placeholder="Search amenities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto!">
          <table className="w-full! text-sm! text-left! text-gray-500!">
            <thead className="text-xs! text-gray-400! uppercase! bg-gray-50/50!">
              <tr>
                <th scope="col" className="px-6! py-4! font-medium!">Amenity Name</th>
                <th scope="col" className="px-6! py-4! font-medium!">Category</th>
                <th scope="col" className="px-6! py-4! font-medium!">Status</th>
                <th scope="col" className="px-6! py-4! font-medium! text-right!">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y! divide-gray-100!">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6! py-12! text-center! text-gray-500!">
                    <div className="flex! justify-center! items-center! gap-2!">
                      <div className="w-4! h-4! rounded-full! border-2! border-gray-300! border-t-gray-900! animate-spin!" />
                      Loading amenities...
                    </div>
                  </td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6! py-12! text-center! text-gray-500!">
                    No amenities found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                amenities.map((amenity) => (
                  <tr key={amenity.id} className="bg-white! hover:bg-gray-50/50! transition-colors! group!">
                    <td className="px-6! py-4!">
                      <div className="flex! items-center! gap-3!">
                        <div className="w-10! h-10! rounded-lg! bg-gray-100! flex! items-center! justify-center! text-gray-400! flex-shrink-0!">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="font-medium! text-gray-900! group-hover:text-blue-600! transition-colors!">{amenity.name}</div>
                          <div className="text-xs! text-gray-400! mt-0.5! truncate! max-w-xs!">{amenity.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-900! capitalize!">{amenity.category || 'General'}</div>
                    </td>
                    <td className="px-6! py-4!">
                      {getStatusBadge(amenity.status)}
                    </td>
                    <td className="px-6! py-4! text-right!">
                      <div className="flex! items-center! justify-end! gap-2!">
                        <button className="p-2! text-gray-400! hover:text-emerald-600! hover:bg-emerald-50! rounded-lg! transition-colors!" title="Edit Amenity">
                          <Edit size={16} />
                        </button>
                        <button className="p-2! text-gray-400! hover:text-rose-600! hover:bg-rose-50! rounded-lg! transition-colors!" title="Delete Amenity">
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