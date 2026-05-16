export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Properties", value: "124", color: "text-blue-600" },
          { label: "Active Leads", value: "48", color: "text-green-600" },
          { label: "Localities", value: "12", color: "text-purple-600" },
          { label: "Published Blogs", value: "32", color: "text-orange-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.label}</h3>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
        <p className="text-gray-500 text-sm">No recent activity to display.</p>
      </div>
    </div>
  );
}