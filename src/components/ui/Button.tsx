"use client";

import React from "react";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
