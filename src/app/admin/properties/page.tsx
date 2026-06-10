"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchProperties();
  }, [filterType]);

  const fetchProperties = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/properties/${filterType}`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
        setProperties(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-emerald-50! text-emerald-600!"><CheckCircle size={12} /> Available</span>;
      case 'unavailable':
        return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-gray-100! text-gray-500!"><XCircle size={12} /> Hidden</span>;
      case 'sold':
        return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-rose-50! text-rose-600!"><XCircle size={12} /> Sold</span>;
      case 'rented':
        return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-blue-50! text-blue-600!"><Clock size={12} /> Rented</span>;
      default:
        return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-xs! font-medium! bg-gray-50! text-gray-600!">{status}</span>;
    }
  };

  return (
    <div className="w-full! max-w-7xl! mx-auto! space-y-6!">
      <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4!">
        <h2 className="text-2xl! font-bold! text-gray-900! tracking-tight!">Properties Management</h2>
        <Link href="/admin/properties/new" className="inline-flex! items-center! gap-2! bg-gray-900! hover:bg-gray-800! text-white! px-5! py-2.5! rounded-xl! font-medium! transition-all! shadow-sm!">
          <Building2 size={18} />
          Add Property
        </Link>
      </div>
      
      <div className="bg-white! rounded-3xl! shadow-sm! border! border-gray-100! overflow-hidden!">
        {/* Toolbar */}
        <div className="p-5! border-b! border-gray-100! flex! flex-col! sm:flex-row! gap-4! items-center! justify-between!">
          <div className="flex! items-center! gap-3! w-full! sm:w-auto!">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-50! border! border-gray-200! text-gray-700! text-sm! rounded-xl! focus:ring-gray-900! focus:border-gray-900! block! p-2.5! outline-none! transition-all!"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial Space</option>
              <option value="coworking">Coworking</option>
              <option value="farmland">Farmland</option>
              <option value="industrial">Industrial Space</option>
              <option value="individual_portion">Independent House</option>
            </select>
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
              placeholder="Search properties..." 
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
                <th scope="col" className="px-6! py-4! font-medium!">Property</th>
                <th scope="col" className="px-6! py-4! font-medium!">Type / Location</th>
                <th scope="col" className="px-6! py-4! font-medium!">Price</th>
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
                      Loading properties...
                    </div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6! py-12! text-center! text-gray-500!">
                    No properties found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="bg-white! hover:bg-gray-50/50! transition-colors! group!">
                    <td className="px-6! py-4!">
                      <div className="flex! items-center! gap-3!">
                        <div className="w-10! h-10! rounded-lg! bg-gray-100! flex! items-center! justify-center! text-gray-400! flex-shrink-0!">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="font-medium! text-gray-900! group-hover:text-blue-600! transition-colors!">{property.title}</div>
                          <div className="text-xs! text-gray-400! mt-0.5!">{property.propertyCode || `ID: ${property.id}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-900! capitalize!">{property.propertyType}</div>
                      <div className="text-xs! text-gray-400! mt-0.5!">{property.city}, {property.state}</div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-900! font-medium!">₹{property.price || 'N/A'}</div>
                      <div className="text-xs! text-gray-400! mt-0.5! capitalize!">For {property.listingType}</div>
                    </td>
                    <td className="px-6! py-4!">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="px-6! py-4! text-right!">
                      <div className="flex! items-center! justify-end! gap-2!">
                        <button className="p-2! text-gray-400! hover:text-blue-600! hover:bg-blue-50! rounded-lg! transition-colors!" title="View Details">
                          <Eye size={16} />
                        </button>
                        <Link href={`/admin/properties/edit/${property.id}?type=${property.propertyType}`} className="p-2! text-gray-400! hover:text-emerald-600! hover:bg-emerald-50! rounded-lg! transition-colors!" title="Edit Property">
                          <Edit size={16} />
                        </Link>
                        <button className="p-2! text-gray-400! hover:text-rose-600! hover:bg-rose-50! rounded-lg! transition-colors!" title="Delete Property">
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
        
        {/* Pagination placeholder */}
        {!loading && properties.length > 0 && (
          <div className="p-5! border-t! border-gray-100! flex! items-center! justify-between!">
            <span className="text-sm! text-gray-500!">Showing <span className="font-medium! text-gray-900!">{properties.length}</span> properties</span>
            <div className="flex! gap-2!">
              <button className="px-4! py-2! text-sm! font-medium! text-gray-500! bg-white! border! border-gray-200! rounded-lg! hover:bg-gray-50! hover:text-gray-900! transition-colors!">Previous</button>
              <button className="px-4! py-2! text-sm! font-medium! text-gray-500! bg-white! border! border-gray-200! rounded-lg! hover:bg-gray-50! hover:text-gray-900! transition-colors!">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
