import Link from "next/link";
import { LayoutDashboard, Home, MapPin, Image as ImageIcon, FileText, Settings, List } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | Majestan Realty",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md h-full flex flex-col">
        <div className="p-6 text-center border-b">
          <h2 className="text-2xl font-bold text-blue-600">Majestan Admin</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/properties" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <Home size={20} /> Properties
              </Link>
            </li>
            <li>
              <Link href="/admin/amenities" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <List size={20} /> Amenities
              </Link>
            </li>
            <li>
              <Link href="/admin/localities" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <MapPin size={20} /> Localities
              </Link>
            </li>
            <li>
              <Link href="/admin/media" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <ImageIcon size={20} /> Media (R2)
              </Link>
            </li>
            <li>
              <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <FileText size={20} /> Blogs
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 transition">
             Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Control Panel</h1>
          <div className="flex items-center gap-4">
            {/* User profile dropdown placeholder */}
            <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
