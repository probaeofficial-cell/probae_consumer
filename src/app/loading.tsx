import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center relative z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#15803D] animate-spin" strokeWidth={3} />
        </div>
        <p className="text-gray-500 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Fresh Bowls...</p>
      </div>
    </div>
  );
}
