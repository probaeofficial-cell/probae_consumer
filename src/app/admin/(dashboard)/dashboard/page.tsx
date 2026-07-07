import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { Users, TrendingUp, DollarSign, Calendar, Activity } from "lucide-react";

export default async function AdminDashboard() {
  await connectToDatabase();

  const totalUsers = await User.countDocuments();
  const activeSubscriptions = await Subscription.find({ status: "active" }).lean();
  const subscriberCount = activeSubscriptions.length;
  
  const totalRevenue = activeSubscriptions.reduce((acc, sub: any) => acc + (sub.finalTotalPrice || 0), 0);
  
  const arpuMonthly = subscriberCount > 0 ? totalRevenue / subscriberCount : 0;
  const arpuWeekly = arpuMonthly / 4.33; // Approx weeks in a month
  const arpuDaily = arpuMonthly / 30; // Approx days in a month

  const stats = [
    {
      name: "Total Customers",
      value: totalUsers.toString(),
      icon: Users,
      trend: "+12%",
      trendUp: true,
      description: "Total registered accounts",
    },
    {
      name: "Active Subscribers",
      value: subscriberCount.toString(),
      icon: Activity,
      trend: "+5%",
      trendUp: true,
      description: "Currently active meal plans",
    },
    {
      name: "Total Expected Revenue",
      value: `₹${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      trend: "+18%",
      trendUp: true,
      description: "Monthly recurring revenue",
    },
    {
      name: "ARPU (Monthly)",
      value: `₹${arpuMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "Avg. monthly revenue per user",
    },
    {
      name: "ARPU (Weekly)",
      value: `₹${arpuWeekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      description: "Avg. weekly revenue per user",
    },
    {
      name: "ARPU (Daily)",
      value: `₹${arpuDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      description: "Avg. daily revenue per user",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Real-time metrics and performance indicators for Probae.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {stat.trend}
                </div>
              )}
            </div>
            
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-3">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
