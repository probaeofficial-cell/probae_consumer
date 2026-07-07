"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed,
  Settings,
  Users,
  ShoppingCart,
  LogOut,
  Layers,
  Shield,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import LogoutModal from "./LogoutModal";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Bowls", href: "/admin/bowls", icon: UtensilsCrossed },
    { name: "Plan Tiers", href: "/admin/tiers", icon: Layers },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Team", href: "/admin/team", icon: Shield },
  ];

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Listen for the custom toggle event from AdminHeader
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-[#222222] text-gray-300 flex flex-col h-screen border-r border-[#333333] shrink-0 transition-all duration-300 
        fixed inset-y-0 left-0 z-50 md:relative
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20 w-64" : "w-64"}
      `}>
      
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3.5 top-7 z-50 bg-[#222222] text-gray-400 hover:text-white border border-[#444444] rounded-full p-1 transition-colors duration-200 focus:outline-none items-center justify-center shadow-lg"
      >
        {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
      </button>

      {/* Header */}
      <div className={`h-20 flex items-center border-b border-[#333333] shrink-0 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
        {isCollapsed ? (
          <Link href="/admin/dashboard" className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/PB_Probae - LogoMark.png" 
              alt="Probae Logo" 
              className="w-8 h-8 object-contain"
            />
          </Link>
        ) : (
          <Link href="/admin/dashboard" className="flex items-center h-12 w-40 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/PB_Probae - Wordmark.png" 
              alt="Probae Wordmark" 
              className="object-contain w-full h-full"
            />
          </Link>
        )}
      </div>

      {/* Menu Area */}
      <div className={`flex-1 overflow-y-auto py-6 space-y-1 scrollbar-hide ${isCollapsed ? "px-3" : "px-4"}`}>
        {!isCollapsed && (
          <div className="px-2 mb-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Menu</span>
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-xl transition-colors duration-200 ${isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3"} ${
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? "mr-0" : "mr-3"}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className={`p-4 space-y-4 shrink-0 border-t border-[#333333] ${isCollapsed ? "px-2" : "px-4"}`}>
        <Link 
          href="/admin/settings" 
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center rounded-xl transition-colors duration-200 ${isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3"} ${
            pathname.startsWith("/admin/settings") 
              ? "bg-primary text-white font-medium" 
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings className={`w-5 h-5 ${isCollapsed ? "mr-0" : "mr-3"}`} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        
        <div className={isCollapsed ? "px-0" : "px-2"}>
          {isCollapsed ? (
             <button 
                onClick={() => setIsLogoutModalOpen(true)}
                title="Logout"
                className="w-full flex items-center justify-center py-3 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
             >
               <LogOut className="w-5 h-5" />
             </button>
          ) : (
            <Button 
              onClick={() => setIsLogoutModalOpen(true)} 
              variant="secondary" 
              className="w-full flex items-center justify-center py-2.5 text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </aside>

    <LogoutModal 
      isOpen={isLogoutModalOpen} 
      onClose={() => setIsLogoutModalOpen(false)} 
      onConfirm={handleLogout} 
      isLoggingOut={isLoggingOut} 
    />
    </>
  );
}
