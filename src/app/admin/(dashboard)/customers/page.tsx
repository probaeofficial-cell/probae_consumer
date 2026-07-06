"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X, User as UserIcon } from "lucide-react";
import Button from "@/components/ui/Button";

interface UserProfile {
  _id: string;
  name: string;
  phone?: string;
  ipAddress?: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
  sex?: string;
  address?: string;
  dietaryPreferences?: string[];
  chefInstructions?: string;
  onboardingStep: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
      });
      const res = await fetch(`/api/admin/users?${query}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.users);
        setTotalCount(data.totalCount);
        setTotalPages(Math.ceil(data.totalCount / limit) || 1);
        
        // Handle Deep Linking
        const params = new URLSearchParams(window.location.search);
        const urlUserId = params.get("userId");
        if (urlUserId) {
          const user = data.users.find((u: UserProfile) => u._id === urlUserId);
          if (user) setSelectedCustomer(user);
          // Remove query param without reloading to prevent re-triggering if user closes drawer
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
      {/* Top Action Bar */}
      <div className="p-6 md:p-8 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 bg-white z-10 relative">
        <div>
          <h2 className="text-xl font-bold font-headline text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all onboarded users and profiles.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, or IP..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-white text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 sticky top-0 z-10">
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Age / Weight</div>
            <div className="col-span-2">Goal</div>
            <div className="col-span-2">Date Joined</div>
            <div className="col-span-2 text-center">Onboarding Step</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">No customers found</p>
              </div>
            ) : (
              customers.map((user) => (
                <div 
                  key={user._id} 
                  className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50/50 items-center hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer relative"
                  onClick={() => setSelectedCustomer(user)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-left duration-200" />
                  
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.phone || user.ipAddress || "No contact info"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-semibold text-gray-900">{user.age} yrs</div>
                    <div className="text-xs text-gray-500">{user.weight} kg</div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 font-medium">
                    {user.goal}
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                      Step {user.onboardingStep || 1}
                    </span>
                  </div>
                  <div className="col-span-1 text-right flex justify-end">
                    <Button 
                      variant="inverted" 
                      className="px-4 py-2 text-xs h-auto opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedCustomer(user); }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white z-10 relative">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{customers.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> results
        </p>
        <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
          <button 
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Drawer Overlay */}
      <div 
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-30 transition-all duration-300 ${selectedCustomer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedCustomer(null)}
      />

      {/* Preview Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-[500px] bg-white border-l border-gray-100 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${selectedCustomer ? "translate-x-0" : "translate-x-full"}`}>
        {selectedCustomer && (
          <div className="flex flex-col h-full">
            <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-headline font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:px-8 space-y-8 bg-gray-50/30">
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedCustomer.name}</h3>
                <p className="text-sm text-gray-500">{selectedCustomer.phone || "No phone provided"}</p>
                {selectedCustomer.address && (
                  <p className="text-sm text-gray-500 mt-2">{selectedCustomer.address}</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Vitals & Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCustomer.age} yrs</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Weight</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCustomer.weight} kg</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Height</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCustomer.height} cm</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sex</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedCustomer.sex || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Preferences</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Primary Goal</p>
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-primary/20 bg-primary/5 text-primary">
                      {selectedCustomer.goal}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Activity Level</p>
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                      {selectedCustomer.activityLevel}
                    </span>
                  </div>
                  
                  {selectedCustomer.dietaryPreferences && selectedCustomer.dietaryPreferences.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.dietaryPreferences.map((pref, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-100">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCustomer.chefInstructions && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Chef Instructions</p>
                      <div className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 italic">
                        "{selectedCustomer.chefInstructions}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
