"use client";

import React from "react";
import { motion } from "framer-motion";

const MiniBowlLoader = ({ className = "w-5 h-5 mr-2" }) => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`${className} overflow-visible inline-block`}
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <motion.path 
      d="M12 4v4" 
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], y: [0, -2, -4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
    <motion.path 
      d="M8 6v3" 
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], y: [0, -2, -4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
    />
    <motion.path 
      d="M16 6v3" 
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], y: [0, -2, -4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
    />
    <path d="M2 13h20" />
    <path d="M4 13c0 5.5 3.6 10 8 10s8-4.5 8-10" fill="currentColor" fillOpacity="0.1" />
  </motion.svg>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "inverted" | "outlined";
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed border";
  
  const variants = {
    primary: "bg-primary text-white border-transparent hover:bg-white hover:text-primary hover:border-primary focus:ring-primary",
    secondary: "bg-[#2A2A2A] text-white border-transparent hover:bg-[#1A1A1A] focus:ring-[#2A2A2A]",
    inverted: "bg-white text-primary border-transparent hover:bg-gray-100 focus:ring-white",
    outlined: "bg-transparent text-white border-gray-600 hover:border-gray-400 focus:ring-gray-600",
  };

  const sizes = "py-3 px-6 text-sm";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <MiniBowlLoader className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
