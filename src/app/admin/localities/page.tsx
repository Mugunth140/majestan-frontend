"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  MapPin, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function AdminLocalitiesPage() {
  const [localities, setLocalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLocalities();
  }, []);

  const fetchLocalities = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/localities`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setLocalities(json.data?.items || json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocalities();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this locality?")) return;
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/localities/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLocalities();
      } else {
        console.error("Failed to delete locality");
      }
    } catch (e) {
      console.error(e);
    }
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
        <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Cities & Areas</h2>
        <Link href="/admin/localities/new" className="inline-flex! items-center! gap-2! bg-gray-900! hover:bg-gray-800! text-white! px-5! py-2.5! rounded-xl! font-medium! transition-all! shadow-sm!">
          <Plus size={18} />
          Add City / Area
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
              placeholder="Search localities..." 
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
                <th scope="col" className="px-6! py-4! font-medium!">Locality Name</th>
                <th scope="col" className="px-6! py-4! font-medium!">City / State</th>
                <th scope="col" className="px-6! py-4! font-medium!">Pincode</th>
                <th scope="col" className="px-6! py-4! font-medium!">Status</th>
                <th scope="col" className="px-6! py-4! font-medium! text-right!">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y! divide-gray-100!">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6! py-12! text-center! text-gray-500!">
                    <div className="flex! justify-center! items-center! gap-2!">
                      <div className="w-4! h-4! rounded-full! border-2! border-gray-300! border-t-gray-900! animate-spin!" />
                      Loading localities...
                    </div>
                  </td>
                </tr>
              ) : localities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6! py-12! text-center! text-gray-500!">
                    No localities found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                localities.map((locality) => (
                  <tr key={locality.id} className="bg-white! hover:bg-gray-50/50! transition-colors! group!">
                    <td className="px-6! py-4!">
                      <div className="flex! items-center! gap-3!">
                        <div className="w-10! h-10! rounded-lg! bg-gray-100! flex! items-center! justify-center! text-gray-400! flex-shrink-0!">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div className="font-medium! text-gray-900! group-hover:text-blue-600! transition-colors!">{locality.locality_name || locality.city_name}</div>
                          <div className="text-xs! text-gray-400! mt-0.5! truncate! max-w-xs!">{locality.country_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-900! capitalize!">{locality.city_name || 'N/A'}</div>
                      <div className="text-xs! text-gray-400! mt-0.5!">{locality.state_name || 'N/A'}</div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-900!">{locality.postal_code || '-'}</div>
                    </td>
                    <td className="px-6! py-4!">
                      {getStatusBadge(locality.is_active)}
                    </td>
                    <td className="px-6! py-4! text-right!">
                      <div className="flex! items-center! justify-end! gap-2!">
                        <Link href={`/admin/localities/${locality.id}`} className="p-2! text-gray-400! hover:text-emerald-600! hover:bg-emerald-50! rounded-lg! transition-colors!" title="Edit Locality">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(locality.id)} className="p-2! text-gray-400! hover:text-rose-600! hover:bg-rose-50! rounded-lg! transition-colors!" title="Delete Locality">
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