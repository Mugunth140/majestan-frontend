"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";
import { useDebouncedValue } from "@/lib/use-debounced-value";

interface ProjectRow {
  id: number;
  name: string;
  projectType: string;
  city: string;
  status: string;
  slug: string;
  units?: { price?: string | null }[];
}

export default function AdminProjectsSeoPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 500);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });
        const res = await fetch(`${API_BASE_URL}/admin/projects?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr = json.data?.items ?? json.items ?? json.data ?? [];
        setProjects(Array.isArray(arr) ? arr : []);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const totalItems = projects.length;
  const paginated = projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="!w-full !space-y-6">
      <div className="!ml-2.5">
        <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">Project SEO</h2>
        <p className="!text-[14px] !text-gray-500 dark:!text-gray-400 !mt-1">
          Manage SEO metadata for project pages. Project data itself is managed in the CRM.
        </p>
      </div>

      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !overflow-hidden">
        <div className="!p-5 !border-b !border-gray-200 dark:!border-[#262730]">
          <div className="!relative !w-full sm:!w-80">
            <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none">
              <Search size={18} className="!text-gray-500 dark:!text-gray-400" />
            </div>
            <input
              type="text"
              className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !pl-10 !p-2.5 !outline-none !transition-all !placeholder-gray-500"
              placeholder="Search by name, builder or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="!overflow-x-auto">
          <table className="!w-full !text-[14px] !text-left !text-gray-500 dark:!text-gray-400">
            <thead className="!text-[12px] !text-gray-500 !uppercase !bg-gray-50 dark:!bg-[#0f1117]/60">
              <tr>
                <th scope="col" className="!px-6 !py-4 !font-medium">Project</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">Type</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">Status</th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-100 dark:!divide-[#262730]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="!px-6 !py-12 !text-center !text-gray-400">Loading...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="!px-6 !py-12 !text-center !text-gray-500">No projects found.</td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="hover:!bg-gray-50 dark:hover:!bg-[#0f1117]/40 !transition-colors">
                    <td className="!px-6 !py-4">
                      <div className="!font-medium !text-gray-800 dark:!text-white">{p.name}</div>
                      <div className="!text-[12px] !text-gray-400 !mt-0.5">{p.city} · /{p.slug}</div>
                    </td>
                    <td className="!px-6 !py-4 !text-center !capitalize">{p.projectType}</td>
                    <td className="!px-6 !py-4 !text-center !capitalize">{p.status}</td>
                    <td className="!px-6 !py-4 !text-center">
                      <Link
                        href={`/admin/projects/seo/${p.id}`}
                        className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !text-[13px] !font-medium !text-[#27427f] !bg-[#27427f]/5 hover:!bg-[#27427f]/10 !rounded-lg !transition-colors"
                      >
                        <Edit size={14} /> SEO
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalItems > itemsPerPage && (
          <div className="!p-5 !border-t !border-gray-200 dark:!border-[#262730] !flex !items-center !justify-between">
            <span className="!text-[14px] !text-gray-500">
              Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
            </span>
            <div className="!flex !gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="!px-4 !py-2 !text-[14px] !font-medium !border !border-gray-200 !rounded-lg disabled:!opacity-50 hover:!bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * itemsPerPage >= totalItems}
                className="!px-4 !py-2 !text-[14px] !font-medium !border !border-gray-200 !rounded-lg disabled:!opacity-50 hover:!bg-gray-50"
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
