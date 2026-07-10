"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, X, Salad as BowlIcon } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface Bowl {
  _id: string;
  name: string;
  code: string;
  category: string;
  baseCalories: number;
  rawMaterialCost: number;
  fixedCost: number;
  basePrice: number;
  baseWeight: number;
  imageId: {
    _id: string;
    url: string;
    fileName: string;
  };
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micros: string[];
  ingredients: string[];
  dips: string[];
  mealTypes: string[];
  isActive?: boolean;
}

export default function BowlsPage() {
  const [bowls, setBowls] = useState<Bowl[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [selectedBowl, setSelectedBowl] = useState<Bowl | null>(null);
  const [editingBowlId, setEditingBowlId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [pageAlert, setPageAlert] = useState<{type: 'success'|'error'|'info', message: string} | null>(null);
  
  const showAlert = (type: 'success'|'error'|'info', message: string) => {
    setPageAlert({ type, message });
    setTimeout(() => setPageAlert(null), 5000);
  };

  const [newBowl, setNewBowl] = useState({
    name: "", code: "", category: "Core", baseCalories: 0, rawMaterialCost: 0, fixedCost: 0, baseWeight: 0,
    macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 }, micros: "", ingredients: "", dips: "", mealTypes: ["B", "L", "D"], imageId: "", isActive: true
  });

  const limit = 10;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch bowls
  const fetchBowls = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        category: categoryFilter,
      });
      const res = await fetch(`/api/admin/bowls?${query}`);
      const data = await res.json();
      if (data.success) {
        setBowls(data.bowls);
        setTotalCount(data.totalCount);
        setTotalPages(Math.ceil(data.totalCount / limit) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch bowls", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryFilter]);

  useEffect(() => {
    fetchBowls();
  }, [fetchBowls]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { compressImage } = await import("@/lib/imageUtils");
      const compressedFile = await compressImage(file, 1000, 0.8);
      
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setNewBowl({ ...newBowl, imageId: data.imageId });
        showAlert('success', 'Image uploaded successfully!');
      } else {
        showAlert('error', 'Failed to upload image');
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error uploading image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent, body: { micros: string[]; ingredients: string[]; dips: string[]; name: string; code: string; category: string; baseCalories: number; rawMaterialCost: number; fixedCost: number; baseWeight: number; macros: { protein: number; carbs: number; fat: number; fiber: number; }; mealTypes: string[]; imageId: string; isActive: boolean; }) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const url = editingBowlId ? `/api/admin/bowls/${editingBowlId}` : "/api/admin/bowls";
      const method = editingBowlId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBowl,
          baseCalories: Number(newBowl.baseCalories),
          rawMaterialCost: Number(newBowl.rawMaterialCost),
          fixedCost: Number(newBowl.fixedCost),
          baseWeight: Number(newBowl.baseWeight),
          macros: {
            protein: Number(newBowl.macros.protein),
            carbs: Number(newBowl.macros.carbs),
            fat: Number(newBowl.macros.fat),
            fiber: Number(newBowl.macros.fiber),
          },
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setEditingBowlId(null);
        setNewBowl({
          name: "", code: "", category: "Core", baseCalories: 0, rawMaterialCost: 0, fixedCost: 0, baseWeight: 0,
          macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 }, micros: "", ingredients: "", dips: "", mealTypes: ["B", "L", "D"], imageId: "", isActive: true
        });
        fetchBowls();
        if (editingBowlId && selectedBowl && selectedBowl._id === editingBowlId) {
            // refresh selected bowl to reflect changes in preview drawer
            const updated = await fetch(`/api/admin/bowls/${editingBowlId}`).then(r => r.json());
            if (updated.success) setSelectedBowl(updated.bowl);
        }
        showAlert('success', `Bowl ${editingBowlId ? "updated" : "created"} successfully!`);
      } else {
        showAlert('error', `Failed to ${editingBowlId ? "update" : "create"} bowl`);
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      
      {/* Toast Alert */}
      {pageAlert && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <Alert 
            type={pageAlert.type} 
            message={pageAlert.message} 
            onClose={() => setPageAlert(null)} 
            className="shadow-xl min-w-[300px]"
          />
        </div>
      )}

      {/* Top Action Bar */}
      <div className="p-6 md:p-8 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 bg-white z-10 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search bowls..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-full md:w-48 px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1em top 50%', backgroundSize: '.65em auto' }}
          >
            <option value="All">All Categories</option>
            <option value="Core">Core</option>
            <option value="Pro">Pro</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
        <Button variant="primary" className="whitespace-nowrap shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => {
          setEditingBowlId(null);
          setNewBowl({
            name: "", code: "", category: "Core", baseCalories: 0, rawMaterialCost: 0, fixedCost: 0, baseWeight: 0,
            macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 }, micros: "", ingredients: "", dips: "", mealTypes: ["B", "L", "D"], imageId: "", isActive: true
          });
          setIsCreateModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Bowl
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-white text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 sticky top-0 z-10 backdrop-blur-md bg-white/80">
            <div className="col-span-2">Image</div>
            <div className="col-span-3">Name & Code</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Base Calories</div>
            <div className="col-span-2">Total Price</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              // Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-gray-50 items-center animate-pulse">
                  <div className="col-span-2"><div className="w-14 h-14 bg-gray-100 rounded-xl"></div></div>
                  <div className="col-span-3"><div className="h-4 bg-gray-100 rounded w-3/4"></div></div>
                  <div className="col-span-2"><div className="h-6 bg-gray-100 rounded-full w-20"></div></div>
                  <div className="col-span-2"><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                  <div className="col-span-2"><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                  <div className="col-span-1 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto"></div></div>
                </div>
              ))
            ) : bowls.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">No bowls found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              bowls.map((bowl) => (
                <div 
                  key={bowl._id} 
                  className={`grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50/50 items-center hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer relative ${bowl.isActive === false ? 'opacity-50 grayscale bg-gray-50/30' : ''}`} 
                  onClick={() => setSelectedBowl(bowl)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-left duration-200" />
                  
                  <div className="col-span-2">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                      {bowl.imageId?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={bowl.imageId.url} alt={bowl.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <BowlIcon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {bowl.name}
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{bowl.code}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm">
                        {Array.isArray(bowl.category) ? bowl.category[0] : bowl.category}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500 font-medium">{bowl.baseCalories} <span className="text-gray-400 font-normal">kcal</span></div>
                  <div className="col-span-2 text-sm text-gray-900 font-semibold">₹{bowl.basePrice.toFixed(2)}</div>
                  <div className="col-span-1 text-right flex justify-end">
                    <Button 
                      variant="inverted" 
                      className="px-4 py-2 text-xs h-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 !bg-white !text-primary !border-gray-200 hover:!border-primary shadow-sm hover:shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBowl(bowl);
                      }}
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
          Showing <span className="font-semibold text-gray-900">{bowls.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> results
        </p>
        <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
          <button 
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === page 
                    ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Drawer Overlay */}
      <div 
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-30 transition-all duration-300 ${selectedBowl ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedBowl(null)}
      />

      {/* Preview Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l border-gray-100 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${selectedBowl ? "translate-x-0" : "translate-x-full"}`}>
        {selectedBowl && (
          <div className="flex flex-col h-full">
            <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-headline font-bold text-gray-900">Bowl Details</h2>
              <button 
                onClick={() => setSelectedBowl(null)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:px-8 space-y-8">
              {/* Image Hero */}
              <div className="aspect-video w-full relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner flex items-center justify-center">
                {selectedBowl.imageId?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={selectedBowl.imageId.url} 
                    alt={selectedBowl.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <BowlIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm font-medium text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Title & Basics */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">{selectedBowl.name}</h3>
                      <span className="shrink-0 mt-1.5 px-2 py-1 bg-gray-100 text-gray-500 font-mono text-xs rounded-lg border border-gray-200">{selectedBowl.code}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-primary/20 bg-primary/5 text-primary">
                        {Array.isArray(selectedBowl.category) ? selectedBowl.category[0] : selectedBowl.category}
                      </span>
                      {selectedBowl.mealTypes?.map(type => (
                        <span key={type} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-orange-200 bg-orange-50 text-orange-600">
                          {type === "B" ? "Breakfast" : type === "L" ? "Lunch" : "Dinner"}
                        </span>
                      ))}
                    </div>
                    {selectedBowl.isActive === false ? (
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-red-200 bg-red-50 text-red-600 inline-block mb-4">
                        Hidden
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-green-200 bg-green-50 text-green-600 inline-block mb-4">
                        Visible
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold text-primary tracking-tight">₹{selectedBowl.basePrice.toFixed(2)}</p>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">Total Price</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-2">
                      Raw: ₹{selectedBowl.rawMaterialCost?.toFixed(2) || '0.00'} | Fixed: ₹{selectedBowl.fixedCost?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Calories</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedBowl.baseCalories} <span className="text-base text-gray-500 font-medium">kcal</span></p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedBowl.baseWeight}<span className="text-base text-gray-500 font-medium">g</span></p>
                  </div>
                </div>
              </div>

              {/* Macros Block */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Base Macros</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <p className="text-xl font-bold text-gray-900 mb-0.5">{selectedBowl.macros?.protein}g</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Protein</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <p className="text-xl font-bold text-gray-900 mb-0.5">{selectedBowl.macros?.carbs}g</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Carbs</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <p className="text-xl font-bold text-gray-900 mb-0.5">{selectedBowl.macros?.fat}g</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fat</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <p className="text-xl font-bold text-gray-900 mb-0.5">{selectedBowl.macros?.fiber}g</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fiber</p>
                  </div>
                </div>
              </div>

              {/* Micros Tags */}
              {selectedBowl.micros && selectedBowl.micros.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Micronutrients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBowl.micros.map((micro, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-700">
                        {micro}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients Tags */}
              {selectedBowl.ingredients && selectedBowl.ingredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBowl.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBowl.dips && selectedBowl.dips.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Dips</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBowl.dips.map((dip, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 font-medium">
                        {dip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:px-8 border-t border-gray-100 shrink-0 bg-white">
              <Button variant="primary" className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => {
                setEditingBowlId(selectedBowl._id);
                setNewBowl({
                  name: selectedBowl.name,
                  code: selectedBowl.code || "",
                  category: Array.isArray(selectedBowl.category) ? selectedBowl.category[0] : selectedBowl.category,
                  baseCalories: selectedBowl.baseCalories,
                  rawMaterialCost: selectedBowl.rawMaterialCost || 0,
                  fixedCost: selectedBowl.fixedCost || 0,
                  baseWeight: selectedBowl.baseWeight,
                  macros: selectedBowl.macros,
                  micros: selectedBowl.micros ? selectedBowl.micros.join(", ") : "",
                  ingredients: selectedBowl.ingredients ? selectedBowl.ingredients.join(", ") : "",
                  dips: selectedBowl.dips ? selectedBowl.dips.join(", ") : "",
                  mealTypes: selectedBowl.mealTypes || [],
                  imageId: typeof selectedBowl.imageId === 'string' ? selectedBowl.imageId : selectedBowl.imageId?._id || "",
                  isActive: selectedBowl.isActive ?? true,
                });
                setIsCreateModalOpen(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Bowl Profile
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{editingBowlId ? "Edit Bowl Profile" : "Create New Bowl"}</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <form id="create-bowl-form" onSubmit={(e) => {
                e.preventDefault();
                const body = {
                  ...newBowl,
                  micros: newBowl.micros ? newBowl.micros.split(",").map(m => m.trim()).filter(Boolean) : [],
                  ingredients: newBowl.ingredients ? newBowl.ingredients.split(",").map(m => m.trim()).filter(Boolean) : [],
                  dips: newBowl.dips ? newBowl.dips.split(",").map(d => d.trim()).filter(Boolean) : []
                };
                handleModalSubmit(e, body);
              }} className="space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Visible on User Site</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allow users to see and order this bowl</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={newBowl.isActive} onChange={(e) => setNewBowl({...newBowl, isActive: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input required type="text" value={newBowl.name} onChange={e => setNewBowl({...newBowl, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. Spicy Tuna" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
                    <input required type="text" value={newBowl.code} onChange={e => setNewBowl({...newBowl, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 uppercase font-mono" placeholder="E.g. STB-01" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select value={newBowl.category} onChange={e => setNewBowl({...newBowl, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 appearance-none cursor-pointer">
                      <option value="Core">Core</option>
                      <option value="Pro">Pro</option>
                      <option value="Performance">Performance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bowl Image {isUploadingImage && <span className="text-primary text-xs ml-2 animate-pulse">Uploading...</span>}</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                      </div>
                      {newBowl.imageId && (
                        <div className="px-3 py-3 bg-gray-100 rounded-xl border border-gray-200 text-xs font-mono text-gray-500 truncate w-24 flex items-center justify-center shrink-0" title={newBowl.imageId}>
                          {newBowl.imageId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Raw Material Cost (₹)</label>
                      <input required type="number" step="0.01" value={newBowl.rawMaterialCost} onChange={e => setNewBowl({...newBowl, rawMaterialCost: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fixed Cost (₹)</label>
                      <input required type="number" step="0.01" value={newBowl.fixedCost} onChange={e => setNewBowl({...newBowl, fixedCost: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Price (Calculated)</label>
                    <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold">₹{(Number(newBowl.rawMaterialCost || 0) + Number(newBowl.fixedCost || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Calories <span className="font-normal text-gray-400 ml-1">(kcal)</span></label>
                    <input required type="number" value={newBowl.baseCalories} onChange={e => setNewBowl({...newBowl, baseCalories: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Weight <span className="font-normal text-gray-400 ml-1">(g)</span></label>
                    <input required type="number" value={newBowl.baseWeight} onChange={e => setNewBowl({...newBowl, baseWeight: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="0" />
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mt-8 mb-6 uppercase tracking-wider">Macros Profile</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Protein (g)</label>
                    <input required type="number" value={newBowl.macros.protein} onChange={e => setNewBowl({...newBowl, macros: {...newBowl.macros, protein: Number(e.target.value)}})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 text-center text-lg font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Carbs (g)</label>
                    <input required type="number" value={newBowl.macros.carbs} onChange={e => setNewBowl({...newBowl, macros: {...newBowl.macros, carbs: Number(e.target.value)}})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 text-center text-lg font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fat (g)</label>
                    <input required type="number" value={newBowl.macros.fat} onChange={e => setNewBowl({...newBowl, macros: {...newBowl.macros, fat: Number(e.target.value)}})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 text-center text-lg font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fiber (g)</label>
                    <input required type="number" value={newBowl.macros.fiber} onChange={e => setNewBowl({...newBowl, macros: {...newBowl.macros, fiber: Number(e.target.value)}})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 text-center text-lg font-semibold" />
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wider">Meal Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "B", label: "Breakfast" },
                      { id: "L", label: "Lunch" },
                      { id: "D", label: "Dinner" }
                    ].map((meal) => {
                      const isSelected = newBowl.mealTypes.includes(meal.id);
                      return (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => {
                            setNewBowl(prev => ({
                              ...prev,
                              mealTypes: isSelected 
                                ? prev.mealTypes.filter(t => t !== meal.id) 
                                : [...prev.mealTypes, meal.id]
                            }));
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                        >
                          {meal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wider">Micronutrients</h4>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Micros List <span className="font-normal text-gray-400 ml-1">(comma separated)</span></label>
                  <textarea rows={2} value={newBowl.micros} onChange={e => setNewBowl({...newBowl, micros: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 resize-y" placeholder="E.g. Vitamin C, Iron, Calcium" />
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wider">Ingredients & Dips</h4>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (comma separated)</label>
                  <textarea rows={3} value={newBowl.ingredients} onChange={e => setNewBowl({...newBowl, ingredients: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 resize-y" placeholder="E.g. Brown Rice, Salmon, Edamame" />
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dips (comma separated)</label>
                    <input type="text" value={newBowl.dips} onChange={e => setNewBowl({...newBowl, dips: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. Garlic Mayo, Mint Chutney" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 md:px-8 border-t border-gray-100 shrink-0 bg-white flex justify-end gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <Button variant="primary" type="submit" form="create-bowl-form" disabled={isCreating || isUploadingImage} className="px-8 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                {isCreating ? "Saving..." : (editingBowlId ? "Save Changes" : "Create Bowl")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
