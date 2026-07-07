"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Shield, User, Camera } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileName(data.profile.name);
          setProfileEmail(data.profile.email);
          setProfileImageUrl(data.profile.profileImageUrl || "");
          if (data.profile.profileImageUrl) {
            localStorage.setItem("adminProfileImageUrl", data.profile.profileImageUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsProfileLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage(null);
    
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, profileImageUrl }),
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      
      localStorage.setItem("adminProfileImageUrl", profileImageUrl);
      // Dispatch an event to notify other components (like AdminHeader)
      window.dispatchEvent(new Event("adminProfileUpdated"));
      
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMessage({ type: "error", text: "Error saving profile. Please try again." });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setProfileImageUrl(data.url);
      } else {
        setProfileMessage({ type: "error", text: "Failed to upload image" });
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: "Error uploading image" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setPasswordMessage(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      setIsPasswordSaving(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      setIsPasswordSaving(false);
      return;
    }
    
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      
      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-4xl space-y-8"
    >
      <div>
        <h1 className="text-3xl font-headline font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              {/* Profile Image Section */}
              <div className="flex items-center gap-6">
                <div className="relative group w-20 h-20 shrink-0">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100 shadow-sm">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  
                  {isUploadingImage ? (
                    <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100 cursor-pointer text-gray-500 hover:text-primary transition-colors">
                      <Camera className="w-4 h-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mt-1">Recommended size 256x256px.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm focus:outline-none cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              {profileMessage && (
                <Alert type={profileMessage.type} message={profileMessage.text} />
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" disabled={isProfileSaving} className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {isProfileSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              {passwordMessage && (
                <Alert type={passwordMessage.type} message={passwordMessage.text} />
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" disabled={isPasswordSaving} className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {isPasswordSaving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
