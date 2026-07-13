"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sun, Utensils, Moon } from "lucide-react";

interface BowlCardProps {
  bowl: any;
  index: number;
}

export default function BowlCard({ bowl, index }: BowlCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Formatting index for footer (e.g. 01, 02)
  const formattedIndex = String(index + 1).padStart(2, "0");

  // Determine colors based on mealTypes
  const isBreakfast = bowl.mealTypes?.includes('B');
  const isLunch = bowl.mealTypes?.includes('L');
  
  let topColor = "bg-primary";
  let textColor = "text-primary";
  let borderColor = "border-primary";
  let phaseLabel = "DINNER";
  let Icon = Moon;
  
  if (isBreakfast) {
    topColor = "bg-tertiary";
    textColor = "text-tertiary";
    borderColor = "border-tertiary";
    phaseLabel = "BREAKFAST";
    Icon = Sun;
  } else if (isLunch) {
    topColor = "bg-secondary";
    textColor = "text-secondary";
    borderColor = "border-secondary";
    phaseLabel = "LUNCH";
    Icon = Utensils;
  }

  return (
    <div 
      className="w-[300px] min-w-[300px] h-[450px] perspective-1000 cursor-pointer snap-center md:hover:-translate-y-2 md:hover:shadow-2xl md:transition-all duration-300 rounded-3xl" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-700 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT FACE (New Image Design) */}
        <div className={`absolute inset-0 backface-hidden bg-[#3F3F46] rounded-[24px] flex flex-col shadow-xl overflow-hidden border border-gray-800 transition-opacity duration-300 ${isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          
          {/* Top Banner */}
          <div className={`w-full h-20 ${topColor} flex justify-between items-center px-6 shrink-0 relative`}>
            <span className="text-gray-900 text-sm font-bold tracking-[0.15em] uppercase">
              {phaseLabel}
            </span>
            <Icon className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
          </div>

          {/* Image Area */}
          <div className="relative w-full flex-1 -mt-1">
            <Image 
              src={bowl.imageId?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"} 
              alt={bowl.name}
              fill
              className="object-cover"
            />
            {/* Gradient Overlay mapping image to dark footer */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3F3F46] via-[#3F3F46]/50 to-transparent top-1/2"></div>
          </div>

          {/* Footer Area */}
          <div className="w-full h-24 bg-[#3F3F46] flex justify-between items-center px-6 shrink-0 relative">
            <span className="text-white text-xs md:text-sm font-medium tracking-wide uppercase line-clamp-2 leading-tight mr-4">
              {bowl.name}
            </span>
            <div className={`w-10 h-10 rounded-full border-2 ${borderColor} flex items-center justify-center shrink-0`}>
              <span className={`font-serif italic ${textColor} font-bold text-lg`}>i</span>
            </div>
          </div>
        </div>

        {/* BACK FACE (Light Theme - Details) */}
        <div className={`absolute inset-0 backface-hidden bg-white rounded-[24px] p-6 shadow-xl flex flex-col rotate-y-180 border border-gray-100 overflow-hidden transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          
          <h4 className="font-bold text-gray-900 text-xl mb-4 text-center border-b border-gray-100 pb-3 shrink-0">{bowl.name}</h4>
          
          {/* Macros */}
          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            <div className="bg-[#10B981]/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] text-[#15803D] font-bold uppercase tracking-widest mb-2">Protein</span>
              <span className="font-bold text-gray-900 text-2xl">{Math.round(bowl.macros?.protein || 0)}g</span>
            </div>
            <div className="bg-[#10B981]/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] text-[#15803D] font-bold uppercase tracking-widest mb-2">Carbs</span>
              <span className="font-bold text-gray-900 text-2xl">{Math.round(bowl.macros?.carbs || 0)}g</span>
            </div>
            <div className="bg-[#10B981]/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] text-[#15803D] font-bold uppercase tracking-widest mb-2">Fats</span>
              <span className="font-bold text-gray-900 text-2xl">{Math.round(bowl.macros?.fat || 0)}g</span>
            </div>
            <div className="bg-[#10B981]/10 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] text-[#15803D] font-bold uppercase tracking-widest mb-2">Fiber</span>
              <span className="font-bold text-gray-900 text-2xl">{Math.round(bowl.macros?.fiber || 0)}g</span>
            </div>
          </div>

          {/* Calories Large Display */}
          <div className="mt-4 mb-3 flex flex-col items-center justify-center bg-gray-50 rounded-2xl py-3 border border-gray-100 shrink-0">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Calories</span>
            <span className="font-black text-gray-900 text-3xl">{Math.round(bowl.baseCalories || 0)} <span className="text-base text-gray-400 font-medium">kcal</span></span>
          </div>

          {/* Price Footer */}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-500 font-medium">Est. Total</span>
            <span className="font-bold text-[#F97316] text-xl md:text-2xl">₹{(bowl.basePrice || 0).toFixed(2)}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
