"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileSearch, AlertCircle, Edit } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";

interface SeoRecord {
  id: number;
  verificationStatus: string; // 'pending' | 'in_review' | 'approved'
  approvalStatus: string;     // 'draft' | 'published' | 'unpublished'
}

interface PropertySeoItem {
  id: number;
  title: string;
  propertyType: string;
  status: string;
  slug: string;
  propertyCode: string;
  seoId: number | null;
  verificationStatus: string | null;
  approvalStatus: string | null;
}

function VerificationBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-green-500/20 !text-green-400">
          Approved
        </span>
      );
    case "in_review":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-yellow-500/20 !text-yellow-400">
          In Review
        </span>
      );
    case "pending":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-yellow-500/20 !text-yellow-400">
          Pending
        </span>
      );
    default:
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500 dark:!text-gray-400">
          Not Started
        </span>
      );
  }
}

function ApprovalBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-green-500/20 !text-green-400">
          Published
        </span>
      );
    case "unpublished":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-red-500/20 !text-red-400">
          Unpublished
        </span>
      );
    case "draft":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500 dark:!text-gray-400">
          Draft
        </span>
      );
    default:
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500 dark:!text-gray-400">
          Draft
        </span>
      );
  }
}

function ListingStatusBadge({ status }: { status: string }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "—";

  switch (status?.toLowerCase()) {
    case "available":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-emerald-500/20 !text-emerald-400">
          {label}
        </span>
      );
    case "sold":
    case "rented":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-blue-500/20 !text-blue-400">
          {label}
        </span>
      );
    case "unavailable":
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500 dark:!text-gray-400">
          Hidden
        </span>
      );
    default:
      return (
        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500 dark:!text-gray-400">
          {label}
        </span>
      );
  }
}

function SkeletonRow() {
  return (
    <tr className="!border-b !border-gray-200 dark:!border-[#262730]">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="!px-6 !py-4">
          <div className="!h-4 !rounded-md !bg-[#262730] !animate-pulse !w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminPropertiesSeoPage() {
  const [properties, setProperties] = useState<PropertySeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const res = await fetch(`${API_BASE_URL}/admin/seo/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const arr: PropertySeoItem[] =
          json.data?.items ?? json.items ?? json.data ?? json ?? [];
        setProperties(Array.isArray(arr) ? arr : []);
      } catch {
        setError(true);
        toast.error("Failed to load SEO data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = properties.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.propertyCode ?? "").toLowerCase().includes(q);

    const approvalStatus = p.approvalStatus ?? "draft";
    const matchesApproval =
      approvalFilter === "all" || approvalStatus === approvalFilter;

    return matchesSearch && matchesApproval;
  });

  const totalItems = filtered.length;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, approvalFilter]);

  return (
    <div className="!w-full !space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <div className="!ml-2.5">
          <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">
            SEO &amp; Publish
          </h2>
          <p className="!text-[14px] !text-gray-500 dark:!text-gray-400 !mt-1">
            Manage SEO metadata and publish status for all property listings
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !overflow-hidden">
        {/* Toolbar */}
        <div className="!p-5 !border-b !border-gray-200 dark:!border-[#262730] !flex !flex-col sm:!flex-row !gap-4 !items-center !justify-between">
          {/* Status filter */}
          <div className="!flex !items-center !gap-3 !w-full sm:!w-auto">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !outline-none !block !p-2.5 !transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {/* Search */}
          <div className="!relative !w-full sm:!w-80">
            <div className="!absolute !inset-y-0 !left-0 !flex !items-center !pl-3 !pointer-events-none">
              <Search size={18} className="!text-gray-500 dark:!text-gray-400" />
            </div>
            <input
              type="text"
              className="!bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !text-gray-900 dark:!text-white !text-[14px] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !shadow-sm !block !w-full !pl-10 !p-2.5 !outline-none !transition-all !placeholder-gray-500"
              placeholder="Search by title or property code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="!overflow-x-auto">
          <table className="!w-full !text-[14px] !text-left !text-gray-500 dark:!text-gray-400">
            <thead className="!text-[12px] !text-gray-500 !uppercase !bg-gray-50 dark:!bg-white dark:!bg-[#0f1117]/60">
              <tr>
                <th scope="col" className="!px-6 !py-4 !font-medium">
                  Property
                </th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">
                  Type
                </th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">
                  Listing Status
                </th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">
                  SEO Status
                </th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">
                  Publish Status
                </th>
                <th scope="col" className="!px-6 !py-4 !font-medium !text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-[#262730]">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="!px-6 !py-12 !text-center !align-middle"
                  >
                    <div className="!flex !flex-col !items-center !gap-3 !text-gray-500">
                      <AlertCircle size={32} className="!text-red-400" />
                      <span className="!text-[14px]">
                        Failed to load SEO data. Please try again.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="!px-6 !py-12 !text-center !align-middle"
                  >
                    <div className="!flex !flex-col !items-center !gap-3 !text-gray-500">
                      <FileSearch size={32} className="!opacity-40" />
                      <span className="!text-[14px]">No properties found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((property) => (
                  <tr
                    key={property.id}
                    className="!bg-white dark:!bg-[#1a1f2e] hover:!bg-gray-50 dark:hover:!bg-[#1e2436] !transition-colors group"
                  >
                    {/* Property */}
                    <td className="!px-6 !py-4 !align-middle">
                      <div className="!text-left">
                        <div className="!font-medium !text-gray-900 dark:!text-white group-hover:!text-[#27427f] !transition-colors !leading-snug">
                          {property.title}
                        </div>
                        <div className="!text-[12px] !text-gray-500 !mt-0.5">
                          {property.propertyCode || `ID: ${property.id}`}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="!px-6 !py-4 !align-middle !text-center">
                      <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-[#27427f]/20 !text-[#6b93d6] !capitalize">
                        {property.propertyType}
                      </span>
                    </td>

                    {/* Listing Status */}
                    <td className="!px-6 !py-4 !align-middle !text-center">
                      <ListingStatusBadge status={property.status} />
                    </td>

                    {/* SEO Status */}
                    <td className="!px-6 !py-4 !align-middle !text-center">
                      {property.seoId ? (
                        <VerificationBadge
                          status={property.verificationStatus || 'pending'}
                        />
                      ) : (
                        <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-[12px] !font-medium !bg-gray-500/20 !text-gray-500">
                          Not Started
                        </span>
                      )}
                    </td>

                    {/* Publish Status */}
                    <td className="!px-6 !py-4 !align-middle !text-center">
                      <ApprovalBadge
                        status={property.approvalStatus ?? "draft"}
                      />
                    </td>

                    {/* Actions */}
                    <td className="!px-6 !py-4 !align-middle !text-center">
                      <Link
                        href={`/admin/properties/seo/${property.id}`}
                        className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !text-[13px] !font-medium !rounded-lg !bg-[#27427f]/20 !text-[#6b93d6] hover:!bg-[#27427f]/40 hover:!text-gray-900 dark:!text-white !transition-all"
                      >
                        <Edit size={14} />
                        Edit SEO
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && !error && totalItems > 0 && (
          <div className="!p-5 !border-t !border-gray-200 dark:!border-[#262730] !flex !items-center !justify-between">
            <span className="!text-[14px] !text-gray-500 dark:!text-gray-400">
              Showing <span className="!font-medium !text-gray-800 dark:!text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="!font-medium !text-gray-800 dark:!text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="!font-medium !text-gray-800 dark:!text-white">{totalItems}</span> properties
              {totalItems !== properties.length && (
                <> (filtered from {properties.length} total)</>
              )}
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
                disabled={currentPage * itemsPerPage >= totalItems}
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
