import React from "react";
import { Search, Menu } from "lucide-react";
import Image from "next/image";
import FadeInUp from "@/components/animations/FadeInUp";

export default function Header() {
  return (
    <FadeInUp 
      yOffset={-40} 
      duration={1} 
      trigger="mount"
      className="fixed top-4 md:top-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:right-auto z-50 flex justify-center"
    >
      <header className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 w-full md:min-w-[800px] bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
        {/* Mobile Hamburger */}
        <button className="p-2 -ml-1 text-gray-900 md:hidden">
          <Menu className="w-5 h-5" strokeWidth={2.5} />
        </button>
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Image src="/images/PB_Probae - LogoMark.png" alt="Probae Logo" width={24} height={24} className="object-contain md:w-7 md:h-7" />
          <Image src="/images/PB_Probae - Wordmark.png" alt="Probae" width={70} height={20} className="object-contain md:w-20 md:h-6" />
        </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-10">
        <span className="font-semibold text-primary cursor-pointer border-b-2 border-primary pb-1">Home</span>
        <span className="font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Plans</span>
        <span className="font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Track</span>
        <span className="font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Profile</span>
      </nav>

      {/* Search Icon */}
      <button className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
        <Search className="w-6 h-6 md:w-5 md:h-5" strokeWidth={2.5} />
      </button>
      </header>
    </FadeInUp>
  );
}
