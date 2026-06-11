"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  Building2, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast-store";
import { formatToShortIndianCurrency } from "@/lib/utils/currency.util";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

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

  useEffect(() => {
    fetchProperties();
  }, [filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleDelete = async (property: any) => {
    const result = await Swal.fire({
      title: "Delete property?",
      text: `"${property.title}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(
        `${API_BASE_URL}/admin/properties/${property.propertyType}/${property.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        toast.success("Property deleted successfully");
        fetchProperties();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete property");
      }
    } catch {
      toast.error("Network error — could not delete property");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-emerald-50 !text-emerald-600"><CheckCircle size={12} /> Available</span>;
      case 'unavailable':
        return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-100 dark:!bg-[#262730] !text-gray-500 dark:!text-gray-400"><XCircle size={12} /> Hidden</span>;
      case 'sold':
        return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-rose-50 !text-rose-600"><XCircle size={12} /> Sold</span>;
      case 'rented':
        return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-blue-50 !text-blue-600"><Clock size={12} /> Rented</span>;
      default:
        return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-50 dark:!bg-[#1c1d27] !text-gray-600 dark:!text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <h2 className="!text-2xl !font-medium !text-gray-800 dark:!text-white !tracking-tight !ml-2.5">Properties Management</h2>
        <Link href="/admin/properties/new" className="!inline-flex !items-center !gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-sm hover:!shadow-blue-500/20 !px-5 !py-2.5 !rounded-xl !font-medium !transition-all">
          <Building2 size={18} />
          Add Property
        </Link>
      </div>
      
      <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        {/* Toolbar */}
        <div className="!p-5 !border-b !border-gray-100 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
          <div className="!flex !items-center !gap-3 !w-full sm:!w-auto">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="!bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !text-gray-800 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !outline-none !block !p-2.5 !outline-none !transition-all"
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
            <button className="!p-2.5 !text-gray-500 dark:!text-gray-400 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] dark:!bg-[#1c1d27] !rounded-xl !border !border-gray-100 dark:!border-[#262730] !shadow-sm !transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="!relative !w-full sm:!w-80">
            <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none">
              <Search size={18} className="!text-gray-400" />
            </div>
            <input 
              type="text" 
              className="!bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !text-gray-800 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !block !w-full !pl-10 !p-2.5 !outline-none !transition-all" 
              placeholder="Search properties..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Table */}
        <div className="!overflow-x-auto">
          <table className="!w-full !text-[14px] !text-left !text-gray-500 dark:!text-gray-400">
            <thead className="!text-[12px] !text-gray-400 !uppercase !bg-gray-50 dark:!bg-[#1c1d27]/50">
              <tr>
                <th scope="col" className="!px-6 !py-4 !font-medium">Property</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Type / Location</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Price</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Status</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    <div className="!flex !justify-center !items-center !gap-2">
                      <div className="!w-4 !h-4 !rounded-full !border-2 !border-gray-300 !border-t-gray-900 !animate-spin" />
                      Loading properties...
                    </div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    No properties found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="!bg-white dark:!bg-[#171821] hover:!bg-[#fbfbfc] dark:!bg-[#0f1015] !transition-colors !group">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-lg !bg-gray-100 dark:!bg-[#262730] !flex !items-center !justify-center !text-gray-400 !flex-shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="!font-medium !text-gray-800 dark:!text-white group-hover:!text-blue-600 !transition-colors">{property.title}</div>
                          <div className="!text-[12px] !text-gray-400 !mt-0.5">{property.propertyCode || `ID: ${property.id}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!text-gray-800 dark:!text-white !capitalize font-medium!">{property.propertyType}</div>
                      <div className="!text-[12px] !text-gray-400 !mt-0.5">{property.city}, {property.state}</div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!text-gray-800 dark:!text-white !font-semibold">
                        {property.price ? `${formatToShortIndianCurrency(property.price)}` : 'N/A'}
                      </div>
                      <div className="!text-[12px] !text-gray-400 !mt-0.5 !capitalize">For {property.listingType}</div>
                    </td>
                    <td className="!px-6 !py-4">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <div className="!flex !items-center !justify-end !gap-2">
                        <Link href={`/admin/properties/view/${property.id}?type=${property.propertyType}`} className="!p-2 !text-gray-400 hover:!text-blue-600 hover:!bg-blue-50 dark:hover:!bg-blue-950/30 !rounded-lg !transition-colors" title="View Details">
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/properties/edit/${property.id}?type=${property.propertyType}`} className="!p-2 !text-gray-400 hover:!text-emerald-600 hover:!bg-emerald-50 dark:hover:!bg-emerald-950/30 !rounded-lg !transition-colors" title="Edit Property">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(property)} className="!p-2 !text-gray-400 hover:!text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/30 !rounded-lg !transition-colors" title="Delete Property">
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
          <div className="!p-5 !border-t !border-gray-100 dark:!border-[#262730] !flex !items-center !justify-between">
            <span className="!text-[14px] !text-gray-500 dark:!text-gray-400">Showing <span className="!font-medium !text-gray-800 dark:!text-white">{properties.length}</span> properties</span>
            <div className="!flex !gap-2">
              <button className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] dark:!bg-[#1c1d27] hover:!text-gray-800 dark:!text-white !transition-colors">Previous</button>
              <button className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] dark:!bg-[#1c1d27] hover:!text-gray-800 dark:!text-white !transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
