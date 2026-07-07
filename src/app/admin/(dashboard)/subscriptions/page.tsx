"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X, Salad } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface CalculatedBowl {
  _id: string;
  name: string;
  assignedCalories: number;
  calculatedWeight: number;
  calculatedPrice: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  mealType?: string;
  inferredType?: string;
  ratio?: number;
  selectedDip?: string;
}

interface Subscription {
  _id: string;
  user: {
    name: string;
    phone: string;
    age: number;
    weight: number;
    goal: string;
    activityLevel: string;
    mealSlots: string[];
    mealRatios: Record<string, number>;
    purchasedCalories?: number;
    calorieProfile: {
      total: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
  plan: {
    name: string;
    duration: string;
    frequency: string;
  };
  selectedMealCombo: string;
  calculatedBowls: CalculatedBowl[];
  finalTotalPrice: number;
  status: string;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const limit = 10;

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/admin/subscriptions?${query}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
        setTotalCount(data.totalCount);
        setTotalPages(Math.ceil(data.totalCount / limit) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col w-full h-[calc(100vh-8rem)] rounded-2xl bg-white border border-gray-100 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      
      {/* Top Action Bar */}
      <div className="p-6 md:p-8 shrink-0 flex items-center justify-between border-b border-gray-100 bg-white z-10 relative">
        <div>
          <h2 className="text-xl font-bold font-headline text-gray-900">Subscriptions</h2>
          <p className="text-sm text-gray-500 mt-1">Manage active user plans and distributions.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-white text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 sticky top-0 z-10">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Plan Info</div>
            <div className="col-span-2">Meal Combo</div>
            <div className="col-span-2">Total Price</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
                <p className="text-lg font-medium text-gray-900 mb-1">No subscriptions found</p>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div 
                  key={sub._id} 
                  className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50/50 items-center hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer relative"
                  onClick={() => setSelectedSub(sub)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-left duration-200" />
                  
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{sub.user?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{sub.user?.phone || "No phone"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-semibold text-gray-900">{sub.plan?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">{sub.plan?.frequency || ""}</div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 font-medium">
                    {sub.selectedMealCombo}
                  </div>
                  <div className="col-span-2 text-sm text-gray-900 font-semibold">
                    ₹{sub.finalTotalPrice?.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-200 bg-green-50 text-green-600">
                      {sub.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-right flex justify-end">
                    <Button 
                      variant="inverted" 
                      className="px-4 py-2 text-xs h-auto opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); }}
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
          Showing <span className="font-semibold text-gray-900">{subscriptions.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> results
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
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-30 transition-all duration-300 ${selectedSub ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedSub(null)}
      />

      {/* Preview Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-[500px] bg-white border-l border-gray-100 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${selectedSub ? "translate-x-0" : "translate-x-full"}`}>
        {selectedSub && selectedSub.user && (
          <div className="flex flex-col h-full">
            <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-headline font-bold text-gray-900">Subscription Details</h2>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:px-8 space-y-8 bg-gray-50/30">
              
              {/* Vitals */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedSub.user.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSub.user.age} yrs</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Weight</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSub.user.weight} kg</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Goal</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedSub.user.goal}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Activity</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedSub.user.activityLevel}</p>
                  </div>
                </div>
              </div>

              {/* Calorie Profile */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Calorie Profile</h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {selectedSub.user.purchasedCalories ? "Purchased Calories" : "Daily Total"}
                  </p>
                  <p className="text-3xl font-bold text-primary mb-1">
                    {selectedSub.user.purchasedCalories || selectedSub.user.calorieProfile?.total || 0} <span className="text-base text-gray-500 font-medium">kcal</span>
                  </p>
                  {selectedSub.user.purchasedCalories && selectedSub.user.calorieProfile?.total && (
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Target Requirement: {selectedSub.user.calorieProfile.total} kcal
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm font-bold text-gray-900">{selectedSub.user.calorieProfile?.protein || 0}g</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Pro</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm font-bold text-gray-900">{selectedSub.user.calorieProfile?.carbs || 0}g</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Carb</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm font-bold text-gray-900">{selectedSub.user.calorieProfile?.fat || 0}g</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Fat</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm font-bold text-gray-900">{selectedSub.user.calorieProfile?.fiber || 0}g</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Fib</p>
                  </div>
                </div>
              </div>

              {/* Meal Ratios */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Custom Meal Split</h4>
                <div className="flex gap-2">
                  {selectedSub.user.mealSlots?.map(slot => {
                    const ratio = selectedSub.user.mealRatios?.[slot] ?? (100 / selectedSub.user.mealSlots.length);
                    const totalToDistribute = selectedSub.user.purchasedCalories || selectedSub.user.calorieProfile?.total || 0;
                    const slotCalories = Math.round(totalToDistribute * (ratio / 100));
                    return (
                      <div key={slot} className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-center">
                        <p className="text-xs font-bold text-gray-500 mb-1">{slot}</p>
                        <p className="text-lg font-bold text-primary">{ratio}%</p>
                        <p className="text-[11px] font-semibold text-gray-500">{slotCalories} kcal</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculated Bowls */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Bowls Breakdown (Per Day)</h4>
                <div className="space-y-6">
                  {(() => {
                    const bowls = selectedSub.calculatedBowls || [];
                    if (bowls.length === 0) {
                      return <p className="text-sm text-gray-500">No bowls calculated for this subscription.</p>;
                    }

                    let breakfasts = bowls.filter((b: any) => b.mealType === 'Breakfast' || b.mealType === 'B');
                    let lunches = bowls.filter((b: any) => b.mealType === 'Lunch' || b.mealType === 'L');
                    let dinners = bowls.filter((b: any) => b.mealType === 'Dinner' || b.mealType === 'D');
                    
                    // Legacy fallback
                    if (breakfasts.length === 0 && lunches.length === 0 && dinners.length === 0) {
                      const combo = selectedSub.user.mealSlots || (selectedSub.selectedMealCombo ? selectedSub.selectedMealCombo.split(" + ") : []);
                      if (combo.length > 0) {
                         const numDays = bowls.length / combo.length;
                         if (Number.isInteger(numDays)) {
                           let offset = 0;
                           if (combo.includes("B-FAST")) { breakfasts = bowls.slice(offset, offset + numDays); offset += numDays; }
                           if (combo.includes("LUNCH")) { lunches = bowls.slice(offset, offset + numDays); offset += numDays; }
                           if (combo.includes("DINNER")) { dinners = bowls.slice(offset, offset + numDays); offset += numDays; }
                         }
                      }
                    }

                    const daysCount = Math.max(breakfasts.length, lunches.length, dinners.length);
                    
                    if (daysCount === 0) {
                       // Absolute fallback if grouping fails
                       return (
                         <div className="space-y-3">
                           {bowls.map((bowl: any, idx: number) => (
                             <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                   <Salad className="w-5 h-5 text-gray-400" />
                                 </div>
                                 <div>
                                   <p className="font-bold text-gray-900 text-sm leading-tight">{bowl.name}</p>
                                   <div className="flex gap-2 mt-1 flex-wrap">
                                     <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                       {bowl.assignedCalories} kcal
                                     </span>
                                     <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                       {bowl.calculatedWeight}g
                                     </span>
                                     {bowl.selectedDip && (
                                       <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                         Dip: {bowl.selectedDip}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="text-sm font-bold text-primary">₹{bowl.calculatedPrice}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       );
                    }

                    const days = [];
                    for (let i = 0; i < daysCount; i++) {
                      const dayBowls = [];
                      if (breakfasts[i]) dayBowls.push({ ...breakfasts[i], inferredType: 'Breakfast' });
                      if (lunches[i]) dayBowls.push({ ...lunches[i], inferredType: 'Lunch' });
                      if (dinners[i]) dayBowls.push({ ...dinners[i], inferredType: 'Dinner' });
                      days.push(dayBowls);
                    }

                    return days.map((dayBowls, dayIdx) => (
                      <div key={dayIdx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Day {dayIdx + 1}</h5>
                        <div className="space-y-3">
                          {dayBowls.map((bowl, idx) => {
                            const mealLabel = bowl.mealType || bowl.inferredType;
                            return (
                              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Salad className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm leading-tight">{bowl.name}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                                        {mealLabel} {bowl.ratio ? `(${bowl.ratio}%)` : ''}
                                      </span>
                                      <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-1.5 py-0.5 rounded">
                                        {bowl.assignedCalories} kcal
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                                        {bowl.calculatedWeight}g
                                      </span>
                                      {bowl.selectedDip && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                          Dip: {bowl.selectedDip}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-primary">₹{bowl.calculatedPrice}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
