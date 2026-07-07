"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Calendar, Activity } from "lucide-react";

interface DashboardContentProps {
  totalUsers: number;
  subscriberCount: number;
  totalRevenue: number;
  arpuMonthly: number;
  arpuWeekly: number;
  arpuDaily: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function DashboardContent(props: DashboardContentProps) {
  const stats = [
    {
      name: "Total Customers",
      value: props.totalUsers.toString(),
      icon: Users,
      trend: "+12%",
      trendUp: true,
      description: "Total registered accounts",
    },
    {
      name: "Active Subscribers",
      value: props.subscriberCount.toString(),
      icon: Activity,
      trend: "+5%",
      trendUp: true,
      description: "Currently active meal plans",
    },
    {
      name: "Total Expected Revenue",
      value: `₹${props.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      trend: "+18%",
      trendUp: true,
      description: "Monthly recurring revenue",
    },
    {
      name: "ARPU (Monthly)",
      value: `₹${props.arpuMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "Avg. monthly revenue per user",
    },
    {
      name: "ARPU (Weekly)",
      value: `₹${props.arpuWeekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      description: "Avg. weekly revenue per user",
    },
    {
      name: "ARPU (Daily)",
      value: `₹${props.arpuDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      description: "Avg. daily revenue per user",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-headline font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Real-time metrics and performance indicators for Probae.
        </p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all duration-300"
          >
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
