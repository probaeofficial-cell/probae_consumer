"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Salad as BowlIcon, Eye, Edit } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface PlanTier {
  _id: string;
  name: string;
  category: string;
  duration: string;
  days: number;
  mealCombinations: string[];
  allowedBowls: string[];
}

interface Bowl {
  _id: string;
  name: string;
  baseCalories: number;
  code?: string;
  imageId?: {
    url: string;
  };
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<PlanTier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  // Side-sheet state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);

  // Form state
  const [newTier, setNewTier] = useState({
    name: "",
    category: "Core",
    duration: "weekly",
    days: 5,
    mealCombinations: [] as string[],
  });
  const [selectedBowlIds, setSelectedBowlIds] = useState<string[]>([]);

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
      setBowlsPage(1); // Reset page on search
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

  const fetchBowls = useCallback(async (page: number, combinations?: string[]) => {
    setIsFetchingBowls(true);
    try {
      const limit = 10;
      
      // Extract unique meal types (B, L, D) from selected combinations (e.g., ["B,L", "D"])
      const combos = combinations || newTier.mealCombinations;
      let uniqueTypes = new Set<string>();
      combos.forEach(combo => {
        combo.split(",").forEach(type => uniqueTypes.add(type.trim()));
      });
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
  }, [newTier.mealCombinations, debouncedBowlsSearch]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchBowls(bowlsPage, newTier.mealCombinations);
    }
  }, [isDrawerOpen, bowlsPage, newTier.mealCombinations, fetchBowls]);

  const handleToggleMealCombo = (combo: string) => {
    setNewTier(prev => {
      const combos = prev.mealCombinations.includes(combo)
        ? prev.mealCombinations.filter(c => c !== combo)
        : [...prev.mealCombinations, combo];
      return { ...prev, mealCombinations: combos };
    });
  };

  const handleToggleBowl = (bowlId: string) => {
    setSelectedBowlIds(prev => {
      if (prev.includes(bowlId)) {
        return prev.filter(id => id !== bowlId);
      }
      return [...prev, bowlId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTier.mealCombinations.length === 0) {
      showAlert('error', "Please select at least one meal combination.");
      return;
    }
    if (selectedBowlIds.length === 0) {
      showAlert('error', "Please select at least one bowl for this tier.");
      return;
    }

    setIsCreating(true);
    try {
      const url = editingTierId ? `/api/admin/tiers/${editingTierId}` : "/api/admin/tiers";
      const method = editingTierId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTier,
          allowedBowls: selectedBowlIds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', `Plan Tier ${editingTierId ? "updated" : "created"} successfully!`);
        setIsDrawerOpen(false);
        setEditingTierId(null);
        setNewTier({ name: "", category: "Core", duration: "weekly", days: 5, mealCombinations: [] });
        setSelectedBowlIds([]);
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

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plan Tiers</h1>
        
        <Button variant="primary" className="whitespace-nowrap shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={() => {
          setEditingTierId(null);
          setNewTier({ name: "", category: "Core", duration: "weekly", days: 5, mealCombinations: [] });
          setSelectedBowlIds([]);
          setIsDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Tier
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-white text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 sticky top-0 z-10 backdrop-blur-md bg-white/80">
            <div className="col-span-3">Tier Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-1">Days</div>
            <div className="col-span-2">Meal Combos</div>
            <div className="col-span-2 text-right">Allowed Bowls</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingTiers ? (
              // Skeleton Loading
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
                    <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-600 capitalize shadow-sm">
                      {tier.duration}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm text-gray-500 font-medium">{tier.days} Days</div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {tier.mealCombinations.map((combo, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                          {combo}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-3">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">
                      {tier.allowedBowls.length} Bowls
                    </span>
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
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[70] ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{editingTierId ? "Edit Tier" : "Create New Tier"}</h2>
            <p className="text-xs text-gray-500 mt-1">{editingTierId ? "Update pricing blueprint details." : "Define pricing blueprints and allowed bowls."}</p>
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
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Name</label>
              <input required type="text" value={newTier.name} onChange={e => setNewTier({...newTier, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. Basic Weekly Plan" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select value={newTier.category} onChange={e => setNewTier({...newTier, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 appearance-none cursor-pointer">
                <option value="Core">Core</option>
                <option value="Pro">Pro</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <select value={newTier.duration} onChange={e => setNewTier({...newTier, duration: e.target.value})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 appearance-none cursor-pointer">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Days</label>
                <input required type="number" min="1" max="31" value={newTier.days} onChange={e => setNewTier({...newTier, days: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-900" placeholder="E.g. 5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Combinations</label>
              <div className="flex flex-wrap gap-2">
                {availableCombos.map(combo => {
                  const isSelected = newTier.mealCombinations.includes(combo);
                  return (
                    <button
                      key={combo}
                      type="button"
                      onClick={() => handleToggleMealCombo(combo)}
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

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">Allowed Bowls</label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{selectedBowlIds.length} Selected</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col flex-1 min-h-[400px]">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Search bowls by name or code..."
                    value={bowlsSearchQuery}
                    onChange={(e) => setBowlsSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-900"
                  />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {isFetchingBowls && bowls.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">Loading bowls...</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {bowls.map((bowl) => {
                          const isChecked = selectedBowlIds.includes(bowl._id);
                          return (
                            <label key={bowl._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  className="peer sr-only"
                                  checked={isChecked}
                                  onChange={() => handleToggleBowl(bowl._id)}
                                />
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white text-transparent group-hover:border-primary/50'}`}>
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center shrink-0">
                                {bowl.imageId?.url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={bowl.imageId.url} alt={bowl.name} className="w-full h-full object-cover" />
                                ) : (
                                  <BowlIcon className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{bowl.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {bowl.code && <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{bowl.code}</span>}
                                  <p className="text-xs text-gray-500">{bowl.baseCalories} kcal</p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
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
        <div className="p-6 md:px-8 border-t border-gray-100 shrink-0 bg-white flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => setIsDrawerOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 border-gray-200 shadow-sm">
            Cancel
          </Button>
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
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Meal Combinations</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTier.mealCombinations.map((combo: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                        {combo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Allowed Bowls</h4>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{selectedTier.allowedBowls.length} Bowls</span>
                </div>
                <div className="space-y-3">
                  {selectedTier.allowedBowls.map((bowl: any) => (
                    <div key={bowl._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                        {bowl.imageId?.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={bowl.imageId.url} alt={bowl.name} className="w-full h-full object-cover" />
                        ) : (
                          <BowlIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{bowl.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{bowl.baseCalories} kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                    mealCombinations: selectedTier.mealCombinations,
                  });
                  setSelectedBowlIds(selectedTier.allowedBowls.map((b: any) => b._id || b));
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
