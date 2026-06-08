import Link from "next/link";
import { 
  Building2, 
  Users, 
  MapPin, 
  FileText, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  Clock,
  Eye,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Properties", value: "124", increase: "+12%", icon: Building2, color: "text-blue-600!", bg: "bg-blue-50!" },
    { label: "Active Leads", value: "48", increase: "+5%", icon: Users, color: "text-emerald-600!", bg: "bg-emerald-50!" },
    { label: "Localities", value: "12", increase: "0%", icon: MapPin, color: "text-violet-600!", bg: "bg-violet-50!" },
    { label: "Published Blogs", value: "32", increase: "+8%", icon: FileText, color: "text-amber-600!", bg: "bg-amber-50!" },
  ];

  const quickActions = [
    { label: "Add New Property", desc: "List a new residential or commercial property", icon: PlusCircle, href: "/admin/properties/new" },
    { label: "Manage Leads", desc: "Review and respond to recent customer inquiries", icon: Users, href: "/admin/leads" },
    { label: "Write Blog Post", desc: "Publish a new article for SEO and engagement", icon: FileText, href: "/admin/blogs/new" },
    { label: "Review Analytics", desc: "Check website traffic and user engagement", icon: Activity, href: "/admin/analytics" },
  ];

  const recentActivities = [
    { title: "New Lead Received", desc: "John Doe inquired about Villa in Thondamuthur", time: "10 mins ago", icon: Users, status: "pending" },
    { title: "Property Updated", desc: "Price updated for 'Luxury Apartment in RS Puram'", time: "2 hours ago", icon: Building2, status: "completed" },
    { title: "Blog Published", desc: "'Top 10 Investment Opportunities in Coimbatore'", time: "Yesterday", icon: FileText, status: "completed" },
    { title: "New Locality Added", desc: "Saravanampatti added to active localities", time: "2 days ago", icon: MapPin, status: "completed" },
  ];

  return (
    <div className="w-full! max-w-7xl! mx-auto! space-y-8!">
      {/* Stats Grid */}
      <div className="grid! grid-cols-1! sm:grid-cols-2! lg:grid-cols-4! gap-6!">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white! rounded-3xl! p-6! border! border-gray-100! shadow-sm! hover:shadow-md! transition-shadow! group!">
            <div className="flex! justify-between! items-start! mb-4!">
              <div className={`p-3! rounded-2xl! ${stat.bg} ${stat.color} transition-transform! group-hover:scale-110!`}>
                <stat.icon size={24} strokeWidth={1.5} />
              </div>
              <span className="flex! items-center! gap-1! text-xs! font-medium! text-emerald-600! bg-emerald-50! px-2.5! py-1! rounded-full!">
                <TrendingUp size={12} />
                {stat.increase}
              </span>
            </div>
            <div>
              <p className="text-4xl! font-semibold! text-gray-900! mb-1! tracking-tight!">{stat.value}</p>
              <h3 className="text-sm! font-medium! text-gray-500!">{stat.label}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid! grid-cols-1! lg:grid-cols-3! gap-8!">
        {/* Quick Actions */}
        <div className="lg:col-span-2! space-y-6!">
          <div className="flex! items-center! justify-between!">
            <h3 className="text-xl! font-semibold! text-gray-900!">Quick Actions</h3>
          </div>
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-4!">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href} className="flex! items-start! gap-4! p-5! bg-white! rounded-3xl! border! border-gray-100! shadow-sm! hover:shadow-md! hover:border-gray-200! transition-all! group!">
                <div className="p-3! rounded-2xl! bg-gray-50! text-gray-600! group-hover:bg-gray-900! group-hover:text-white! transition-colors!">
                  <action.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1!">
                  <h4 className="text-base! font-medium! text-gray-900! mb-1! group-hover:text-gray-900!">{action.label}</h4>
                  <p className="text-sm! text-gray-500! font-light! leading-relaxed!">{action.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300! group-hover:text-gray-900! transition-colors! self-center!" />
              </Link>
            ))}
          </div>

          {/* System Status Placeholder */}
          <div className="bg-gradient-to-br! from-gray-900! to-gray-800! rounded-3xl! p-8! shadow-lg! text-white! relative! overflow-hidden!">
            <div className="absolute! top-0! right-0! p-8! opacity-10!">
              <Activity size={120} />
            </div>
            <div className="relative! z-10!">
              <h3 className="text-xl! font-semibold! mb-2!">System Health Optimal</h3>
              <p className="text-gray-400! font-light! mb-6! max-w-md!">All services are running smoothly. Your property listings are currently syncing across all marketing channels without any issues.</p>
              <button className="px-5! py-2! bg-white/10! hover:bg-white/20! backdrop-blur-sm! rounded-full! text-sm! font-medium! transition-colors!">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white! rounded-3xl! border! border-gray-100! shadow-sm! p-6! flex! flex-col!">
          <div className="flex! items-center! justify-between! mb-6!">
            <h3 className="text-xl! font-semibold! text-gray-900!">Recent Activity</h3>
            <button className="text-sm! font-medium! text-gray-500! hover:text-gray-900! transition-colors!">View All</button>
          </div>
          
          <div className="flex-1! space-y-6!">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex! gap-4! relative!">
                {i !== recentActivities.length - 1 && (
                  <div className="absolute! left-5! top-10! bottom-[-24px]! w-[2px]! bg-gray-100!" />
                )}
                <div className={`relative! z-10! flex-shrink-0! w-10! h-10! rounded-full! flex! items-center! justify-center! border-4! border-white! ${activity.status === 'pending' ? 'bg-amber-100! text-amber-600!' : 'bg-gray-100! text-gray-600!'}`}>
                  <activity.icon size={16} strokeWidth={2} />
                </div>
                <div className="flex-1! pt-1!">
                  <div className="flex! justify-between! items-start! mb-1!">
                    <h4 className="text-sm! font-medium! text-gray-900!">{activity.title}</h4>
                    <span className="flex! items-center! gap-1! text-xs! text-gray-400! font-light!">
                      <Clock size={12} />
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm! text-gray-500! font-light! leading-relaxed!">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-6! w-full! py-3! text-sm! font-medium! text-gray-700! bg-gray-50! hover:bg-gray-100! rounded-2xl! transition-colors!">
            Load More Activity
          </button>
        </div>
      </div>
    </div>
  );
}