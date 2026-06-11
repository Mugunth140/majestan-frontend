"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Mail,
  Phone
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/enquiries`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
        setLeads(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <h2 className="!text-[22px] !font-semibold !text-gray-800 dark:!text-white !tracking-tight">Leads Management</h2>
      </div>
      
      <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] shadow-[0_4px_20px_rgba(0,0,0,0.03)!] !overflow-hidden">
        {/* Toolbar */}
        <div className="!p-5 !border-b !border-gray-100 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
          <div className="!flex !items-center !gap-3 !w-full sm:!w-auto">
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
              placeholder="Search leads..." 
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
                <th scope="col" className="!px-6 !py-4 !font-medium">Customer</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Contact</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Interest</th>
                <th scope="col" className="!px-6 !py-4 !font-medium">Date</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    <div className="!flex !justify-center !items-center !gap-2">
                      <div className="!w-4 !h-4 !rounded-full !border-2 !border-gray-300 !border-t-gray-900 !animate-spin" />
                      Loading leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="!px-6 !py-12 !text-center !text-gray-500 dark:!text-gray-400">
                    No leads found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => (
                  <tr key={lead.id || idx} className="!bg-white dark:!bg-[#171821] hover:!bg-[#fbfbfc] dark:!bg-[#0f1015] !transition-colors !group">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-full !bg-gray-100 dark:!bg-[#262730] !flex !items-center !justify-center !text-gray-400 !flex-shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <div className="!font-medium !text-gray-800 dark:!text-white">{lead.name || 'Anonymous'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!flex !flex-col !gap-1">
                        <div className="!flex !items-center !gap-1 !text-gray-600 dark:!text-gray-300">
                          <Phone size={14} />
                          {lead.phone || 'N/A'}
                        </div>
                        <div className="!flex !items-center !gap-1 !text-gray-400 !text-[12px]">
                          <Mail size={12} />
                          {lead.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!text-gray-800 dark:!text-white !font-medium !capitalize">{lead.property_type || 'General'}</div>
                      <div className="!text-[12px] !text-gray-400 !mt-0.5 !capitalize">{lead.listing_type || 'Purchase/Rent'}</div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!text-gray-800 dark:!text-white">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <div className="!flex !items-center !justify-end !gap-2">
                        <button className="!p-2 !text-gray-400 hover:!text-blue-600 hover:!bg-blue-50 !rounded-lg !transition-colors" title="View Details">
                          <Eye size={16} />
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
