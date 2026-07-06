"use client";

import React from "react";
import { Home, Utensils, BarChart2, User } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)] max-w-md mx-auto w-full md:hidden">
      <div className="flex flex-col items-center gap-1 cursor-pointer group">
        <div className="bg-primary/10 p-2 rounded-xl text-primary transition-colors">
          <Home className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-primary">Home</span>
      </div>
      
      <div className="flex flex-col items-center gap-1 cursor-pointer group opacity-40 hover:opacity-100 transition-opacity">
        <div className="p-2 text-gray-500 group-hover:text-gray-900 transition-colors">
          <Utensils className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900">Plans</span>
      </div>

      <div className="flex flex-col items-center gap-1 cursor-pointer group opacity-40 hover:opacity-100 transition-opacity">
        <div className="p-2 text-gray-500 group-hover:text-gray-900 transition-colors">
          <BarChart2 className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900">Track</span>
      </div>

      <div className="flex flex-col items-center gap-1 cursor-pointer group opacity-40 hover:opacity-100 transition-opacity">
        <div className="p-2 text-gray-500 group-hover:text-gray-900 transition-colors">
          <User className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900">Profile</span>
      </div>
    </div>
  );
}
