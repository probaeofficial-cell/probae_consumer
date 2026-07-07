import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function AdminDashboard() {
  await connectToDatabase();

  const totalUsers = await User.countDocuments();
  const activeSubscriptions = await Subscription.find({ status: "active" }).lean();
  const subscriberCount = activeSubscriptions.length;
  
  const totalRevenue = activeSubscriptions.reduce((acc, sub: any) => acc + (sub.finalTotalPrice || 0), 0);
  
  const arpuMonthly = subscriberCount > 0 ? totalRevenue / subscriberCount : 0;
  const arpuWeekly = arpuMonthly / 4.33; // Approx weeks in a month
  const arpuDaily = arpuMonthly / 30; // Approx days in a month

  return (
    <DashboardContent 
      totalUsers={totalUsers}
      subscriberCount={subscriberCount}
      totalRevenue={totalRevenue}
      arpuMonthly={arpuMonthly}
      arpuWeekly={arpuWeekly}
      arpuDaily={arpuDaily}
    />
  );
}
