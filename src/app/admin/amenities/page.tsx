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
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast-store";

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAmenities(search, 1);
    }
  }, []);

  useEffect(() => {
    fetchAmenities(search, currentPage);
  }, [currentPage]);

  const fetchAmenities = async (searchQuery = search, page = currentPage) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/amenities`);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", "10");
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
          setAmenities(Array.isArray(arr) ? arr : []); 
        setTotalItems(json.data?.total || json.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAmenities(search, 1);
    }
  };

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: "Delete amenity?",
      text: `"${item.name}" will be permanently deleted.`,
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
      const res = await fetch(`${API_BASE_URL}/admin/amenities/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Amenity deleted successfully");
        fetchAmenities();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete amenity");
      }
    } catch {
      toast.error("Network error — could not delete amenity");
    }
  };

  const getStatusBadge = (isActive: number | boolean) => {
    // Handle both boolean (true/false) and integer (1/0) representations
    const active = isActive === true || isActive === 1;
    if (active) {
      return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-emerald-50 !text-emerald-600"><CheckCircle size={12} /> Active</span>;
    }
    return <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-50 dark:!bg-[#1c1d27] !text-gray-600 dark:!text-gray-300"><XCircle size={12} /> Inactive</span>;
  };

  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <h2 className="!text-2xl !font-medium !text-gray-800 dark:!text-white !tracking-tight">Amenities Management</h2>
        <Link href="/admin/amenities/new" className="!inline-flex !items-center !gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-sm hover:!shadow-blue-500/20 !px-5 !py-2.5 !rounded-xl !font-medium !transition-all !shadow-sm">
          <Plus size={18} />
          Add Amenity
        </Link>
      </div>
      
      <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        {/* Toolbar */}
        <div className="!p-3 !border-b !border-gray-100 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
          <div className="!flex !items-center !gap-3 !w-full sm:!w-auto">
            <button className="!p-2.5 !text-gray-500 dark:!text-gray-400 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] dark:!bg-[#1c1d27] !rounded-xl !border !border-gray-100 dark:!border-[#262730] !shadow-sm !transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="!relative !w-full sm:!w-80">
            <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none">
              <Search size={20} className="!text-gray-400" />
            </div>
            <input 
              type="text" 
              className="!bg-[#fbfbfc] dark:!bg-[#0f1015] !border !border-gray-100 dark:!border-[#262730] !text-gray-800 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-blue-500/20 dark:focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!border-blue-500 !shadow-sm !block !w-full !pl-12 !p-2 !outline-none !transition-all" 
              placeholder="Search amenities..." 
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
                <th scope="col" className="!px-6 !py-4 !font-medium">Amenity Name</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Category</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Status</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    <div className="!flex !justify-center !items-center !gap-2">
                      <div className="!w-4 !h-4 !rounded-full !border-2 !border-gray-300 !border-t-gray-900 !animate-spin" />
                      Loading amenities...
                    </div>
                  </td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    No amenities found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                amenities.map((amenity) => (
                  <tr key={amenity.id} className="!bg-white dark:!bg-[#171821] hover:!bg-[#fbfbfc] dark:!bg-[#0f1015] !transition-colors !group">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-lg !bg-gray-100 dark:!bg-[#262730] !flex !items-center !justify-center !text-gray-400 !flex-shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="!font-medium !text-gray-800 dark:!text-white group-hover:!text-blue-600 !transition-colors">{amenity.name}</div>
                          <div className="!text-[12px] !text-gray-400 !mt-0.5 !truncate ">{amenity.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!text-gray-800 dark:!text-white !capitalize">{amenity.category || 'General'}</div>
                    </td>
                    <td className="!px-6 !py-4">
                      {getStatusBadge(amenity.isActive !== undefined ? amenity.isActive : amenity.is_active)}
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <div className="!flex !items-center !justify-end !gap-2">
                        <Link href={`/admin/amenities/edit/${amenity.id}`} className="!p-2 !text-gray-400 hover:!text-emerald-600 hover:!bg-emerald-50 dark:hover:!bg-emerald-950/30 !rounded-lg !transition-colors" title="Edit Amenity">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(amenity)} className="!p-2 !text-gray-400 hover:!text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/30 !rounded-lg !transition-colors" title="Delete Amenity">
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

        {/* Pagination controls */}
        {!loading && totalItems > 0 && (
          <div className="!p-5 !border-t !border-gray-100 dark:!border-[#262730] !flex !items-center !justify-between">
            <span className="!text-[14px] !text-gray-500 dark:!text-gray-400">
              Showing <span className="!font-medium !text-gray-800 dark:!text-white">{(currentPage - 1) * 10 + 1}</span> to <span className="!font-medium !text-gray-800 dark:!text-white">{Math.min(currentPage * 10, totalItems)}</span> of <span className="!font-medium !text-gray-800 dark:!text-white">{totalItems}</span> items
            </span>
            <div className="!flex !gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed hover:!text-gray-800 dark:!text-white !transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * 10 >= totalItems}
                className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed hover:!text-gray-800 dark:!text-white !transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}