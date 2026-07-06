"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-gray-100 shrink-0">
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 w-96 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search your today" 
          className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-600"
        />
      </div>

      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        <button className="flex items-center space-x-2 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors focus:outline-none">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700 font-medium">Notifications</span>
          <span className="bg-[#222222] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1 font-bold">
            2
          </span>
        </button>
        
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity focus:outline-none"
        >
          <User className="w-5 h-5" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-4 border-b border-gray-50">
              <span className="text-base font-semibold text-gray-900">Admin</span>
            </div>
            
            <div className="py-2">
              <Link 
                href="/admin/profile" 
                className="flex items-center px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4 mr-3 text-gray-500" />
                View Profile
              </Link>
              
              <Link 
                href="/admin/settings/password" 
                className="flex items-center px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Key className="w-4 h-4 mr-3 text-gray-500" />
                Change Password
              </Link>
            </div>
            
            <div className="border-t border-gray-50 py-2">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
