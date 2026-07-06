"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Salad as BowlIcon, Eye, Edit, GripVertical, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface Bowl {
  _id: string;
  name: string;
  baseCalories: number;
  basePrice: number;
  code?: string;
  imageId?: {
    url: string;
  };
}

interface TierSelection {
  type: string;
  bowls: Bowl[];
}

interface PlanTier {
  _id: string;
  name: string;
  category: string;
  duration: string;
  days: number;
  mealType: string;
  selections: TierSelection[];
  totalPrice: number;
  discountPrice: number;
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<PlanTier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  // Side-sheet state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PlanTier | null>(null);

  // Form state
  const [newTier, setNewTier] = useState({
    name: "",
    category: "Core",
    duration: "weekly",
    days: 5,
    mealType: "B",
    discountPrice: 0,
  });
  
  const [selections, setSelections] = useState<Record<string, Bowl[]>>({ "B": [] });

  // Bowls pagination state (inside side-sheet)
  const [bowls, setBowls] = useState<Bowl[]>([]);
  const [bowlsPage, setBowlsPage] = useState(1);
  const [bowlsTotalPages, setBowlsTotalPages] = useState(1);
  const [isFetchingBowls, setIsFetchingBowls] = useState(false);
  const [bowlsSearchQuery, setBowlsSearchQuery] = useState("");
  const [debouncedBowlsSearch, setDebouncedBowlsSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBowlsSearch(bowlsSearchQuery);
      setBowlsPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [bowlsSearchQuery]);

  const [pageAlert, setPageAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setPageAlert({ type, message });
    setTimeout(() => setPageAlert(null), 5000);
  };

  const fetchTiers = useCallback(async () => {
    setIsLoadingTiers(true);
    try {
      const res = await fetch("/api/admin/tiers");
      const data = await res.json();
      if (data.success) {
        setTiers(data.tiers);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    } finally {
      setIsLoadingTiers(false);
    }
  }, []);

  const fetchBowls = useCallback(async (page: number, currentMealType?: string) => {
    setIsFetchingBowls(true);
    try {
      const limit = 10;
      
      const combos = currentMealType || newTier.mealType;
      const uniqueTypes = new Set<string>(combos.split(",").map(t => t.trim()));
      const typesStr = Array.from(uniqueTypes).join(",");
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        isActive: 'true'
      });
      if (typesStr) {
        queryParams.set("mealTypes", typesStr);
      }

      if (debouncedBowlsSearch) {
        queryParams.set("search", debouncedBowlsSearch);
      }

      const res = await fetch(`/api/admin/bowls?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBowls(data.bowls);
        setBowlsTotalPages(Math.ceil(data.totalCount / limit) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch bowls:", error);
    } finally {
      setIsFetchingBowls(false);
    }
  }, [newTier.mealType, debouncedBowlsSearch]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchBowls(bowlsPage, newTier.mealType);
    }
  }, [isDrawerOpen, bowlsPage, newTier.mealType, fetchBowls]);

  const handleMealTypeChange = (typeStr: string) => {
    setNewTier(prev => ({ ...prev, mealType: typeStr }));
    const types = typeStr.split(",").map(t => t.trim());
    setSelections(prev => {
      const next: Record<string, Bowl[]> = {};
      types.forEach(t => {
        next[t] = prev[t] || [];
      });
      return next;
    });
  };

  const handleDaysChange = (days: number) => {
    setNewTier(prev => ({ ...prev, days }));
    // Trim excess bowls if days are reduced
    setSelections(prev => {
      const next: Record<string, Bowl[]> = {};
      Object.keys(prev).forEach(type => {
        next[type] = prev[type].slice(0, days);
      });
      return next;
    });
  };

  const handleAddBowl = (type: string, bowl: Bowl) => {
    setSelections(prev => {
      const current = prev[type] || [];
      if (current.length >= newTier.days) {
        showAlert('info', `Maximum of ${newTier.days} bowls allowed for this section.`);
        return prev;
      }
      return { ...prev, [type]: [...current, bowl] };
    });
  };

  const handleRemoveBowl = (type: string, index: number) => {
    setSelections(prev => {
      const current = [...(prev[type] || [])];
      current.splice(index, 1);
      return { ...prev, [type]: current };
    });
  };

  const handleReorder = (type: string, sourceIdx: number, destIdx: number) => {
    setSelections(prev => {
      const current = [...(prev[type] || [])];
      const [movedItem] = current.splice(sourceIdx, 1);
      current.splice(destIdx, 0, movedItem);
      return { ...prev, [type]: current };
    });
  };

  const calculateTotal = () => {
    let sum = 0;
    Object.values(selections).forEach(bucket => {
      bucket.forEach(bowl => {
        sum += bowl.basePrice || 0;
      });
    });
    return Number(sum.toFixed(2));
  };

  const totalPrice = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate strict day counts
    for (const [type, bucket] of Object.entries(selections)) {
      if (bucket.length !== newTier.days) {
        const typeName = type === 'B' ? 'Breakfast' : type === 'L' ? 'Lunch' : 'Dinner';
        showAlert('error', `Please select exactly ${newTier.days} bowls for ${typeName}.`);
        return;
      }
    }

    setIsCreating(true);
    try {
      const url = editingTierId ? `/api/admin/tiers/${editingTierId}` : "/api/admin/tiers";
      const method = editingTierId ? "PATCH" : "POST";
      
      const payloadSelections = Object.entries(selections).map(([type, bowls]) => ({
        type,
        bowls: bowls.map(b => b._id)
      }));

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTier,
          selections: payloadSelections,
          totalPrice,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', `Plan Tier ${editingTierId ? "updated" : "created"} successfully!`);
        setIsDrawerOpen(false);
        setEditingTierId(null);
        setNewTier({ name: "", category: "Core", duration: "weekly", days: 5, mealType: "B", discountPrice: 0 });
        setSelections({ "B": [] });
        fetchTiers();
        
        // Refresh selected tier if it was edited
        if (editingTierId && selectedTier && selectedTier._id === editingTierId) {
            const updated = await fetch(`/api/admin/tiers/${editingTierId}`).then(r => r.json());
            if (updated.success) setSelectedTier(updated.tier);
        }
      } else {
        showAlert('error', data.error || `Failed to ${editingTierId ? "update" : "create"} Plan Tier.`);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', "An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  const availableCombos = ["B", "L", "D", "B,L", "L,D", "B,D", "B,L,D"];

  const getTypeName = (t: string) => t === 'B' ? 'Breakfast' : t === 'L' ? 'Lunch' : 'Dinner';

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
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

      <div className="p-6 md:p-8 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 bg-white z-10 relative">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plan Tiers</h1>
        
        <Button variant="primary" className="whitespace-nowrap shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => {
          setEditingTierId(null);
          setNewTier({ name: "", category: "Core", duration: "weekly", days: 5, mealType: "B", discountPrice: 0 });
          setSelections({ "B": [] });
          setIsDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Tier
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-white text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 sticky top-0 z-10 backdrop-blur-md bg-white/80">
            <div className="col-span-3">Tier Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Duration / Days</div>
            <div className="col-span-1">Meal Type</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingTiers ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-gray-50 items-center animate-pulse">
                  <div className="col-span-3"><div className="h-4 bg-gray-100 rounded w-3/4"></div></div>
                  <div className="col-span-2"><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                  <div className="col-span-2"><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                  <div className="col-span-1"><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                  <div className="col-span-2"><div className="h-4 bg-gray-100 rounded w-3/4"></div></div>
                  <div className="col-span-2 flex justify-end"><div className="h-6 bg-gray-100 rounded-full w-12"></div></div>
                </div>
              ))
            ) : tiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
                <p className="text-lg font-medium text-gray-900 mb-1">No Plan Tiers found</p>
                <p className="text-sm">Click the button above to create your first pricing blueprint.</p>
              </div>
            ) : (
              tiers.map((tier) => (
                <div 
                  key={tier._id} 
                  className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50/50 items-center hover:bg-gray-50/50 transition-colors" 
                >
                  <div className="col-span-3 font-semibold text-gray-900">{tier.name}</div>
                  <div className="col-span-2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm">
                      {tier.category}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-600 capitalize shadow-sm mr-2">
                      {tier.duration}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{tier.days} Days</span>
                  </div>
                  <div className="col-span-1">
                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                      {tier.mealType}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    {tier.discountPrice > 0 ? (
                      <>
                        <span className="text-sm font-bold text-green-600">${tier.discountPrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-400 line-through">${tier.totalPrice?.toFixed(2) || '0.00'}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">${tier.totalPrice?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-3">
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/admin/tiers/${tier._id}`);
                        const data = await res.json();
                        if (data.success) {
                          setSelectedTier(data.tier);
                          setIsPreviewOpen(true);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Creation Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] transition-all duration-300 ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Creation Side-Sheet (Drawer) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[70] ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{editingTierId ? "Edit Tier" : "Create Curated Tier"}</h2>
            <p className="text-xs text-gray-500 mt-1">Design an exact meal prep schedule for the user.</p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:px-8">
          <form id="create-tier-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Name</label>
                <input required type="text" value={newTier.name} onChange={e => setNewTier({...newTier, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. Ultimate Core 5-Day" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select value={newTier.category} onChange={e => setNewTier({...newTier, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 appearance-none cursor-pointer">
                  <option value="Core">Core</option>
                  <option value="Pro">Pro</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <select value={newTier.duration} onChange={e => setNewTier({...newTier, duration: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 appearance-none cursor-pointer">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Days</label>
                <input required type="number" min="1" max="31" value={newTier.days} onChange={e => handleDaysChange(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. 5" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Price ($)</label>
                <input type="number" step="0.01" min="0" value={newTier.discountPrice || ''} onChange={e => setNewTier({...newTier, discountPrice: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type Config</label>
              <div className="flex flex-wrap gap-2">
                {availableCombos.map(combo => {
                  const isSelected = newTier.mealType === combo;
                  return (
                    <button
                      key={combo}
                      type="button"
                      onClick={() => handleMealTypeChange(combo)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isSelected 
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                      }`}
                    >
                      {combo}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Calculated Total</p>
                  <p className="text-2xl font-black text-gray-900">${totalPrice.toFixed(2)}</p>
                </div>
                {newTier.discountPrice > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-green-600 uppercase tracking-wider font-bold mb-1">Final Price</p>
                    <p className="text-2xl font-black text-green-600">${newTier.discountPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Selection Buckets */}
              <div className="space-y-6">
                {Object.entries(selections).map(([type, bucketBowls]) => (
                  <div key={type} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">{getTypeName(type)} Schedule</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${bucketBowls.length === newTier.days ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {bucketBowls.length} / {newTier.days} Selected
                      </span>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {bucketBowls.map((item, idx) => (
                        <div 
                          key={`${item._id}-${idx}`}
                          draggable 
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", idx.toString());
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceIdx = Number(e.dataTransfer.getData("text/plain"));
                            handleReorder(type, sourceIdx, idx);
                          }}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5 text-gray-300" />
                          <div className="w-12 text-center shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Day</span>
                            <span className="font-bold text-gray-900">{idx + 1}</span>
                          </div>
                          
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {item.imageId?.url ? (
                              <img src={item.imageId.url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <BowlIcon className="w-5 h-5 text-gray-300 m-auto mt-2.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">${item.basePrice?.toFixed(2) || '0.00'}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveBowl(type, idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {bucketBowls.length < newTier.days && (
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-400 bg-gray-50/50">
                          Add {newTier.days - bucketBowls.length} more bowl{newTier.days - bucketBowls.length > 1 ? 's' : ''} from the catalog below
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bowl Catalog */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col flex-1 min-h-[400px]">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 text-sm">Bowl Catalog</h3>
                </div>
                <div className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search bowls by name..."
                    value={bowlsSearchQuery}
                    onChange={(e) => setBowlsSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-900"
                  />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden h-[300px]">
                  <div className="flex-1 overflow-y-auto">
                    {isFetchingBowls && bowls.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">Loading bowls...</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {bowls.map((bowl) => (
                          <div key={bowl._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center shrink-0">
                                {bowl.imageId?.url ? (
                                  <img src={bowl.imageId.url} alt={bowl.name} className="w-full h-full object-cover" />
                                ) : (
                                  <BowlIcon className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{bowl.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-primary font-bold">${bowl.basePrice?.toFixed(2) || '0.00'}</p>
                                  <p className="text-xs text-gray-500">{bowl.baseCalories} kcal</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 shrink-0 mt-2 sm:mt-0">
                              {Object.keys(selections).map(type => {
                                const isAdded = selections[type]?.some(b => b._id === bowl._id);
                                return isAdded ? (
                                  <span
                                    key={type}
                                    className="px-2.5 py-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded flex items-center gap-1 uppercase tracking-wider"
                                  >
                                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Added to {getTypeName(type)}
                                  </span>
                                ) : (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleAddBowl(type, bowl)}
                                    className="px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                  >
                                    + {getTypeName(type)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Internal Drawer Pagination */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <span className="text-xs text-gray-500 font-medium">Page {bowlsPage} of {bowlsTotalPages}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary"
                        type="button"
                        onClick={() => setBowlsPage(p => Math.max(1, p - 1))}
                        disabled={bowlsPage === 1 || isFetchingBowls}
                        className="px-3 py-1.5 text-xs h-auto !bg-white border-gray-200 hover:bg-gray-50 !text-gray-700 hover:!text-gray-900"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Prev
                      </Button>
                      <Button 
                        variant="secondary"
                        type="button"
                        onClick={() => setBowlsPage(p => Math.min(bowlsTotalPages, p + 1))}
                        disabled={bowlsPage === bowlsTotalPages || isFetchingBowls}
                        className="px-3 py-1.5 text-xs h-auto !bg-white border-gray-200 hover:bg-gray-50 !text-gray-700 hover:!text-gray-900"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
        <div className="p-6 md:px-8 border-t border-gray-100 shrink-0 bg-white flex justify-end gap-3 z-10">
          <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <Button variant="primary" type="submit" form="create-tier-form" disabled={isCreating} className="px-8 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
            {isCreating ? "Saving..." : editingTierId ? "Update Tier" : "Create Tier"}
          </Button>
        </div>
      </div>

      {/* Preview Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] transition-all duration-300 ${isPreviewOpen && !isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsPreviewOpen(false)}
      />

      {/* Preview Side-Sheet */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[65] ${isPreviewOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        {selectedTier ? (
          <>
            <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Tier Details</h2>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:px-8 bg-gray-50/50">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTier.name}</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">
                    {selectedTier.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-gray-900 capitalize font-medium">{selectedTier.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Days</p>
                    <p className="text-gray-900 font-medium">{selectedTier.days} Days</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Meal Type</p>
                    <p className="text-gray-900 font-medium">{selectedTier.mealType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Price</p>
                    <p className="text-gray-900 font-medium">${selectedTier.totalPrice?.toFixed(2) || '0.00'}</p>
                    {selectedTier.discountPrice > 0 && (
                      <p className="text-xs text-green-600 font-bold">Discount: ${selectedTier.discountPrice.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>

              {(selectedTier.selections || []).map((sel, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                    <h4 className="font-bold text-gray-900">{getTypeName(sel.type)} Schedule</h4>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{sel.bowls.length} Days</span>
                  </div>
                  <div className="space-y-3">
                    {sel.bowls.map((bowl: any, bIdx: number) => (
                      <div key={bIdx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="w-10 text-center shrink-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Day</span>
                            <span className="font-bold text-gray-900 text-sm">{bIdx + 1}</span>
                        </div>
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center shrink-0">
                          {bowl.imageId?.url ? (
                            <img src={bowl.imageId.url} alt={bowl.name} className="w-full h-full object-cover" />
                          ) : (
                            <BowlIcon className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{bowl.name}</p>
                          <p className="text-xs text-gray-500 font-medium">${bowl.basePrice?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 md:px-8 border-t border-gray-100 shrink-0 bg-white flex justify-end">
              <Button 
                variant="primary" 
                className="w-full justify-center shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                onClick={() => {
                  setEditingTierId(selectedTier._id);
                  setNewTier({
                    name: selectedTier.name,
                    category: selectedTier.category || "Core",
                    duration: selectedTier.duration,
                    days: selectedTier.days,
                    mealType: selectedTier.mealType,
                    discountPrice: selectedTier.discountPrice || 0,
                  });
                  // Reconstruct selections state
                  const newSelections: Record<string, Bowl[]> = {};
                  (selectedTier.selections || []).forEach(sel => {
                    newSelections[sel.type] = sel.bowls;
                  });
                  setSelections(newSelections);
                  setIsDrawerOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Tier
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Loading details...</div>
        )}
      </div>

    </div>
  );
}
