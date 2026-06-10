"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { 
  FileText, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const url = new URL(`${API_BASE_URL}/admin/blogs`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const arr = json.data?.items || json.items || json.data || json || [];
        setBlogs(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs();
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-[12px]! font-medium! bg-emerald-50! text-emerald-600!"><CheckCircle size={12} /> Published</span>;
    }
    return <span className="inline-flex! items-center! gap-1! px-2.5! py-1! rounded-full! text-[12px]! font-medium! bg-gray-50! text-gray-600!"><XCircle size={12} /> Draft</span>;
  };

  return (
    <div className="w-full! space-y-6!">
      <div className="flex! flex-col! sm:flex-row! sm:items-center! justify-between! gap-4!">
        <h2 className="text-[22px]! font-semibold! text-gray-800! tracking-tight!">Blog Management</h2>
        <Link href="/admin/blogs/new" className="inline-flex! items-center! gap-2! bg-blue-600! hover:bg-blue-700! text-white! shadow-sm! hover:shadow-blue-500/20! px-5! py-2.5! rounded-xl! font-medium! transition-all! shadow-sm!">
          <FileText size={18} />
          Write Post
        </Link>
      </div>
      
      <div className="bg-white! rounded-2xl! border! border-gray-100! shadow-[0_4px_20px_rgba(0,0,0,0.03)]! overflow-hidden!">
        {/* Toolbar */}
        <div className="p-5! border-b! border-gray-100! flex! flex-col! sm:flex-row! gap-4! items-center! justify-between!">
          <div className="flex! items-center! gap-3! w-full! sm:w-auto!">
            <button className="p-2.5! text-gray-500! hover:bg-gray-50! rounded-xl! border! border-gray-100! shadow-sm! transition-colors!">
              <Filter size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative! w-full! sm:w-80!">
            <div className="absolute! inset-y-0! left-0! flex! items-center! pl-3! pointer-events-none!">
              <Search size={18} className="text-gray-400!" />
            </div>
            <input 
              type="text" 
              className="bg-[#fbfbfc]! border! border-gray-100! text-gray-800! text-[14px]! rounded-xl! focus:ring-2! focus:ring-blue-500/20! focus:border-blue-500! shadow-sm! block! w-full! pl-10! p-2.5! outline-none! transition-all!" 
              placeholder="Search blogs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto!">
          <table className="w-full! text-[14px]! text-left! text-gray-500!">
            <thead className="text-[12px]! text-gray-400! uppercase! bg-gray-50/50!">
              <tr>
                <th scope="col" className="px-6! py-4! font-medium!">Title</th>
                <th scope="col" className="px-6! py-4! font-medium!">Category / Author</th>
                <th scope="col" className="px-6! py-4! font-medium!">Created At</th>
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
                      Loading blogs...
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6! py-12! text-center! text-gray-500!">
                    No blogs found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="bg-white! hover:bg-[#fbfbfc]! transition-colors! group!">
                    <td className="px-6! py-4!">
                      <div className="flex! items-center! gap-3!">
                        <div className="w-10! h-10! rounded-lg! bg-gray-100! flex! items-center! justify-center! text-gray-400! flex-shrink-0!">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-medium! text-gray-800! group-hover:text-blue-600! transition-colors!">{blog.title}</div>
                          <div className="text-[12px]! text-gray-400! mt-0.5! truncate! ">{blog.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-800! capitalize!">{blog.category || 'General'}</div>
                      <div className="text-[12px]! text-gray-400! mt-0.5!">{blog.author || 'Admin'}</div>
                    </td>
                    <td className="px-6! py-4!">
                      <div className="text-gray-800!">{new Date(blog.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6! py-4!">
                      {getStatusBadge(blog.status)}
                    </td>
                    <td className="px-6! py-4! text-right!">
                      <div className="flex! items-center! justify-end! gap-2!">
                        <button className="p-2! text-gray-400! hover:text-blue-600! hover:bg-blue-50! rounded-lg! transition-colors!" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="p-2! text-gray-400! hover:text-emerald-600! hover:bg-emerald-50! rounded-lg! transition-colors!" title="Edit Blog">
                          <Edit size={16} />
                        </button>
                        <button className="p-2! text-gray-400! hover:text-rose-600! hover:bg-rose-50! rounded-lg! transition-colors!" title="Delete Blog">
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
        {!loading && blogs.length > 0 && (
          <div className="p-5! border-t! border-gray-100! flex! items-center! justify-between!">
            <span className="text-[14px]! text-gray-500!">Showing <span className="font-medium! text-gray-800!">{blogs.length}</span> blogs</span>
            <div className="flex! gap-2!">
              <button className="px-4! py-2! text-[14px]! font-medium! text-gray-500! bg-white! border! border-gray-200! rounded-lg! hover:bg-gray-50! hover:text-gray-800! transition-colors!">Previous</button>
              <button className="px-4! py-2! text-[14px]! font-medium! text-gray-500! bg-white! border! border-gray-200! rounded-lg! hover:bg-gray-50! hover:text-gray-800! transition-colors!">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}