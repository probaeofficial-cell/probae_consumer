"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const captions = [
  "Loading health...",
  "Calculating macros...",
  "Preparing your bowls...",
  "Optimizing nutrition...",
  "Tossing the greens...",
  "Gathering the ingredients...",
  "Simmering the stats...",
  "Fetching fresh data..."
];

export default function AdminLoader() {
  // Initialize with the first caption to avoid SSR hydration mismatches
  const [caption, setCaption] = useState(captions[0]);

  useEffect(() => {
    // Cycle to a new caption every 2 seconds while loading
    const intervalId = setInterval(() => {
      setCaption((prevCaption) => {
        const nextIndex = (captions.indexOf(prevCaption) + 1) % captions.length;
        return captions[nextIndex];
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      
      {/* Bowl Skeleton container */}
      <div className="relative flex flex-col items-center">
        {/* Animated Steam lines */}
        <div className="flex space-x-3 mb-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-6 bg-gray-200 rounded-full"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3] 
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Bowl Body */}
        <motion.div 
          className="w-32 h-16 bg-gray-200 rounded-b-full rounded-t-lg relative overflow-hidden"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glossy shimmer sweep passing through the bowl */}
          <motion.div 
            className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Fake text skeleton lines */}
      <div className="flex flex-col items-center space-y-3">
        <motion.div 
           className="h-4 w-48 bg-gray-200 rounded-full relative overflow-hidden"
           animate={{ opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
           <motion.div 
             className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
             animate={{ x: ["-100%", "200%"] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           />
        </motion.div>
        
        <motion.div 
           className="h-3 w-32 bg-gray-100 rounded-full relative overflow-hidden"
           animate={{ opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
           <motion.div 
             className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
             animate={{ x: ["-100%", "200%"] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           />
        </motion.div>
      </div>

      {/* The randomly selected caption */}
      <p className="text-black font-semibold tracking-wide animate-pulse mt-6">
        {caption}
      </p>
    </div>
  );
}
