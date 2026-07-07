"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Shield, User, Trash2, X, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  createdAt: string;
}

export default function TeamPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  useEffect(() => {
    fetchAdmins();
    fetchCurrentAdmin();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admins", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentAdmin = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (data.success) {
        setCurrentAdminEmail(data.profile.email);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");
    
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      
      setAdmins([data.admin, ...admins]);
      setIsCreateModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (error: any) {
      setCreateError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const res = await fetch(`/api/admin/team/${adminToDelete._id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");
      
      setAdmins(admins.filter(a => a._id !== adminToDelete._id));
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    } catch (error: any) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    (admin.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage admin users, their roles, and access to the dashboard.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 flex items-center shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search team members by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
        />
      </div>

      {/* Grid of Admins */}
      {filteredAdmins.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No team members found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or add a new admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={admin._id} 
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  {admin.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={admin.profileImageUrl} alt={admin.name || "Admin"} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{admin.name || "Admin User"}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{admin.role}</span>
                    </div>
                  </div>
                </div>
                
                {/* Prevent deleting oneself */}
                {admin.email !== currentAdminEmail && (
                  <button 
                    onClick={() => { setAdminToDelete(admin); setIsDeleteModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {admin.email === currentAdminEmail && (
                   <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                     YOU
                   </span>
                )}
              </div>
              
              <div className="mt-2 space-y-1.5 text-sm text-gray-500">
                <p className="flex items-center gap-2 truncate" title={admin.email}>
                  <span className="font-medium text-gray-700 w-12 shrink-0">Email:</span>
                  <span className="truncate">{admin.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-12 shrink-0">Added:</span>
                  <span>{new Date(admin.createdAt || Date.now()).toLocaleDateString()}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isCreating ? () => setIsCreateModalOpen(false) : undefined}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Add Team Member
                </h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateAdmin} className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name (Optional)</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="admin@probae.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporary Password</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Minimum 6 characters. They can change this later in Settings.</p>
                  </div>
                  
                  {createError && (
                    <Alert type="error" message={createError} />
                  )}
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating} className="mr-3">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isCreating}>
                    Create Admin
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && adminToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isDeleting ? () => setIsDeleteModalOpen(false) : undefined}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                  <Trash2 className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Team Member?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to remove <span className="font-semibold text-gray-700">{adminToDelete.email}</span>? This action cannot be undone.
                </p>
                
                {deleteError && (
                  <div className="mb-6">
                    <Alert type="error" message={deleteError} />
                  </div>
                )}
                
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleDeleteAdmin} 
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                  >
                    {isDeleting ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
