"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function OptimizingSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Track scroll progress as the section enters the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  // Scale from 0.8 to 1 and fade in as it scrolls into view
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  // Add a slight vertical parallax effect for extra smoothness
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <section 
      ref={containerRef} 
      className="bg-transparent flex flex-col items-center justify-center py-24 md:py-48 px-6 relative z-10 overflow-hidden"
    >
      <motion.div 
        style={{ scale, opacity, y }}
        className="flex flex-col items-center justify-center text-center origin-bottom w-full"
      >
        <h2 className="text-5xl md:text-[8vw] font-black text-[#8B5CF6] leading-[0.9] tracking-tighter uppercase font-headline">
          STOP DIETING.
        </h2>
        <h2 className="text-5xl md:text-[8vw] font-black text-[#10B981] leading-[0.9] tracking-tighter uppercase font-headline">
          START OPTIMIZING.
        </h2>
        <Link href="/onboarding" className="mt-12 bg-gray-900 text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-lg md:text-xl flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-xl">
          Explore The Menu
        </Link>
      </motion.div>
    </section>
  );
}
