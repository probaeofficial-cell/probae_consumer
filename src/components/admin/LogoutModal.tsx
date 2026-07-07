"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoggingOut ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border-4 border-red-100">
                  <LogOut className="w-6 h-6" />
                </div>
                {!isLoggingOut && (
                  <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to leave?</h3>
              <p className="text-sm text-gray-500 mb-8">
                Are you sure you want to log out of your admin account? You will need to sign in again to access the dashboard.
              </p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="secondary" 
                  onClick={onClose} 
                  disabled={isLoggingOut}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onConfirm} 
                  disabled={isLoggingOut}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Logging out...
                    </div>
                  ) : (
                    "Yes, Log Out"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
