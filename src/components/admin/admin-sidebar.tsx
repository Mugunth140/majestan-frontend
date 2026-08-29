"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Home, 
  MapPin, 
  Map, 
  Image as ImageIcon, 
  FileText, 
  Globe,
  ChevronDown,
  Users,
  Search
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

const navItems: (NavItem | NavGroup)[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Properties",
    defaultOpen: true,
    items: [
      { title: "All Properties", href: "/admin/properties", icon: Home },
      { title: "Property SEO", href: "/admin/properties/seo", icon: Search },
    ]
  },
  {
    title: "Locations",
    defaultOpen: true,
    items: [
      { title: "Cities", href: "/admin/cities", icon: MapPin },
      { title: "Sublocations", href: "/admin/sublocations", icon: Map },
    ]
  },
  {
    title: "Content & SEO",
    defaultOpen: false,
    items: [
      { title: "Media Library", href: "/admin/media", icon: ImageIcon },
      { title: "Blog Posts", href: "/admin/blogs", icon: FileText },
      { title: "Leads", href: "/admin/leads", icon: Users },
      { title: "SEO Settings", href: "/admin/seo", icon: Globe },
    ]
  }
];

function NavGroupItem({ group, pathname }: { group: NavGroup, pathname: string }) {
  const isActive = group.items.some(item => {
      if (item.href === '/admin/properties') {
        return pathname === item.href || (pathname.startsWith('/admin/properties/') && !pathname.startsWith('/admin/properties/new') && !pathname.startsWith('/admin/properties/seo'));
      }
    return pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
  });
  
  const [isOpen, setIsOpen] = useState(group.defaultOpen || isActive);

  return (
    <li className="!mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`!flex !w-full !items-center !justify-between !rounded-xl !px-4 !py-2.5 !transition-colors ${
          isActive && !isOpen ? '!bg-blue-50/50 !text-blue-700' : '!hover:bg-gray-50 !hover:text-gray-600'
        }`}
      >
        <span className="!text-base !font-medium !tracking-wide !text-gray-500 dark:!text-gray-400">{group.title}</span>
        <ChevronDown size={14} className={`!text-gray-400 !transition-transform !duration-200 ${isOpen ? '!rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="!overflow-hidden !space-y-1 !mt-1"
          >
            {group.items.map((item) => {
              let isItemActive = false;
              if (item.href === '/admin/properties') {
                isItemActive = pathname === item.href || (pathname.startsWith('/admin/properties/') && !pathname.startsWith('/admin/properties/new') && !pathname.startsWith('/admin/properties/seo'));
              } else {
                isItemActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
              }

              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`!flex !items-center !gap-3 !rounded-xl !px-4 !py-2.5 !text-[14px] !font-medium !transition-all ${
                      isItemActive 
                        ? '!bg-blue-50 !text-blue-700 !font-semibold' 
                        : '!text-gray-500 dark:!text-gray-400 !hover:bg-gray-50 !hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={isItemActive ? '!text-blue-600' : '!text-gray-400'} />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="!flex !w-70 !flex-col !bg-white dark:!bg-[#171821] !border-r !border-gray-100 dark:!border-[#262730] shadow-[4px_0_24px_rgba(0,0,0,0.02)!] !z-10">
      <div className="!flex !items-center !justify-center !border-b !border-gray-100 dark:!border-[#262730]/50 !py-6 !h-19">
        <Image src="/assets/images/logo/logo.png" alt="Majestan Logo" width={200} height={50} className="!object-contain" priority />
      </div>
      
      <nav className="!flex-1 !overflow-y-auto !py-6 !px-4 !custom-scrollbar">
        <ul className="!space-y-1">
          {navItems.map((item, index) => {
            if ("items" in item) {
              return <NavGroupItem key={index} group={item} pathname={pathname || ''} />;
            } else {
              const isItemActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href} className="!mb-4">
                  <Link 
                    href={item.href} 
                    className={`!flex !items-center !gap-3 !rounded-xl !px-4 !py-2.5 !text-base !font-semibold !transition-all ${
                      isItemActive 
                        ? '!bg-blue-50 !text-blue-700' 
                        : '!text-gray-600 !hover:bg-gray-50 !hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={isItemActive ? '!text-blue-600' : '!text-gray-400'} />
                    {item.title}
                  </Link>
                </li>
              );
            }
          })}
        </ul>
      </nav>
    </aside>
  );
}
