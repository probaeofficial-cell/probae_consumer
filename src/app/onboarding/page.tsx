"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Plus, Info, Sun, Moon, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customAllergy, setCustomAllergy] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    sex: "Male",
    age: "25",
    height: "180",
    weight: "75",
    activityLevel: "Lightly Active",
    goal: "Muscle Gain",
    dietaryPreferences: [] as string[],
    allergies: [] as string[],
    comments: "",
    planDuration: "WEEKLY",
    planFrequency: "5 DAYS",
    mealSlots: ["LUNCH"] as string[],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: "dietaryPreferences" | "allergies" | "mealSlots", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        // If "No Restrictions" is selected for dietary, clear others
        if (field === "dietaryPreferences") {
          if (value === "No Restrictions") return { ...prev, [field]: ["No Restrictions"] };
          // If a specific diet is selected, remove "No Restrictions"
          const filtered = current.filter(item => item !== "No Restrictions");
          return { ...prev, [field]: [...filtered, value] };
        }
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !formData.allergies.includes(customAllergy.trim())) {
      toggleArrayField("allergies", customAllergy.trim());
      setCustomAllergy("");
    }
  };

  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleContinueToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Final Onboarding Data:", formData);
    // In real app, make API call to create/update user profile, then redirect to menu
    // router.push("/menu"); 
  };

  const commonAllergies = ["Peanuts", "Dairy", "Shellfish", "Tree Nuts", "Eggs", "Soy", "Wheat"];
  const dietaryOptions = ["No Restrictions", "Vegan", "Keto", "Gluten-Free", "Paleo", "Low Carb"];

  const goals = [
    { 
      id: "Weight Loss", label: "Weight Loss", sub: "Deficit focused", 
      bg: "bg-[#6A0FAD]", 
      iconBg: "bg-[#8A3FD1]",
      shadow: "shadow-[#6A0FAD]/40",
      icon: (
        <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="8" r="2" fill="#6A0FAD" />
        </svg>
      )
    },
    { 
      id: "Muscle Gain", label: "Muscle Gain", sub: "Surplus & Protein", 
      bg: "bg-[#1B5E20]", 
      iconBg: "bg-[#4CAF50]",
      shadow: "shadow-[#4CAF50]/50",
      icon: (
        <svg className="w-4 h-4 text-[#1B5E20]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.5 4.5l-1-1c-.8-.8-2-.8-2.8 0l-1 1-2-2 1-1c.8-.8.8-2 0-2.8l-1-1c-.8-.8-2-.8-2.8 0L9 4.6 4.6 9c-.8.8-.8 2 0 2.8l1 1c.8.8 2 .8 2.8 0l1-1 2 2-1 1c-.8.8-.8 2 0 2.8l1 1c.8.8 2 .8 2.8 0l1-1c.8-.8.8-2 0-2.8l-1-1 2-2 1-1c.8-.8.8-2 0-2.8z" />
        </svg>
      )
    },
    { 
      id: "Maintenance", label: "Maintenance", sub: "Equilibrium", 
      bg: "bg-[#8D4004]", 
      iconBg: "bg-[#A65B1A]",
      shadow: "shadow-[#FF751F]/40",
      icon: (
        <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 3m0 0l-3 3m3-3h12m0 0l3 3m-3-3l3-3"/>
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-gray-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden">
      
      {/* Background Square Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px"
        }} 
      />

      <div className="w-full max-w-4xl relative z-10 transition-all duration-500 py-8">
        
        {/* Main Content Area (Removed Figma Card Border) */}
        <div className="w-full">
          
          <div className="px-4 md:px-12">
            
            {/* PERSISTENT HEADER AREA FOR INDICATORS */}
            <div className="flex justify-between items-center mb-10">
               <button 
                  onClick={() => setStep(step - 1)} 
                  className={`w-12 h-12 flex items-center justify-center bg-[#181818] rounded-full hover:bg-gray-800 transition-all duration-300 border border-gray-800/60 ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
               </button>
               
               <div className="flex items-center gap-3">
                 <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${step === 1 ? 'w-10 bg-primary' : 'w-2.5 bg-gray-600'}`} />
                 <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${step === 2 ? 'w-10 bg-tertiary' : 'w-2.5 bg-gray-600'}`} />
                 <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${step === 3 ? 'w-10 bg-secondary' : 'w-2.5 bg-gray-600'}`} />
               </div>

               <div className="w-12 h-12 flex items-center justify-end">
                 {/* Right spacer, except on step 1 where we have 'Skip for now' */}
                 <Link href="/menu" className={`text-sm font-bold text-gray-400 hover:text-white transition-all duration-300 whitespace-nowrap ${step === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                   Skip for now
                 </Link>
               </div>
            </div>

            {/* -------------------- STEP 1 -------------------- */}
            <div className={`transition-all duration-500 ${step === 1 ? 'block opacity-100' : 'hidden opacity-0 h-0'}`}>
              
              <div className="mb-10 max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight font-headline">
                  Build Your<br />Nutrition Profile
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  We need a few details to precisely calculate your metabolic baseline.
                </p>
              </div>

              <form onSubmit={handleContinueToStep2} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#222222] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Delivery Address
                      </label>
                      <textarea 
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Enter your full address"
                        rows={3}
                        className="w-full bg-[#222222] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner resize-none"
                      />
                    </div>
                    
                    {/* Biological Sex with smooth animated slider */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Biological Sex
                      </label>
                      <div className="relative flex p-1 bg-[#222222] rounded-xl border border-gray-800 shadow-inner">
                        <div 
                          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-transform duration-300 ease-out shadow-md"
                          style={{ transform: formData.sex === "Male" ? "translateX(0)" : "translateX(100%)" }}
                        />
                        <button
                          type="button"
                          onClick={() => updateField("sex", "Male")}
                          className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 ${formData.sex === "Male" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField("sex", "Female")}
                          className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 ${formData.sex === "Female" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                          Age
                        </label>
                        <input 
                          type="number" 
                          value={formData.age}
                          onChange={(e) => updateField("age", e.target.value)}
                          className="w-full bg-[#222222] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-all text-center shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 whitespace-nowrap">
                          Height <span className="text-gray-600 normal-case font-normal">(cm)</span>
                        </label>
                        <input 
                          type="number" 
                          value={formData.height}
                          onChange={(e) => updateField("height", e.target.value)}
                          className="w-full bg-[#222222] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-all text-center shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 whitespace-nowrap">
                          Weight <span className="text-gray-600 normal-case font-normal">(kg)</span>
                        </label>
                        <input 
                          type="number" 
                          value={formData.weight}
                          onChange={(e) => updateField("weight", e.target.value)}
                          className="w-full bg-[#222222] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-all text-center shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Activity Level
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Sedentary", "Lightly Active", "Active", "Very Active"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateField("activityLevel", level)}
                            className={`px-4 py-3.5 text-[11px] md:text-xs font-bold rounded-xl border transition-all ${
                              formData.activityLevel === level
                                ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                : "bg-[#222222] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800/50 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto md:px-12 bg-tertiary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-colors shadow-lg shadow-tertiary/20"
                  >
                    Continue to Goals
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>

              </form>
            </div>

            {/* -------------------- STEP 2 -------------------- */}
            <div className={`transition-all duration-500 ${step === 2 ? 'block opacity-100' : 'hidden opacity-0 h-0 overflow-hidden'}`}>
              
              <div className="mb-6 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 font-headline">
                  Select Your Goal
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Calibrate your nutritional baseline for optimal biological performance.
                </p>
              </div>

              <form onSubmit={handleContinueToStep3} className="space-y-6">
                
                {/* GOALS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((g) => {
                    const isSelected = formData.goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateField("goal", g.id)}
                        className={`relative p-6 rounded-[24px] text-left transition-all duration-300 overflow-hidden group ${g.bg} ${
                          isSelected 
                            ? `ring-2 ring-white/40 shadow-xl ${g.shadow} scale-[1.02]` 
                            : `hover:scale-[1.01] opacity-90 hover:opacity-100`
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-6 right-6 bg-white/20 rounded-full p-1 backdrop-blur-sm">
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-full ${g.iconBg} flex items-center justify-center mb-6`}>
                          {g.icon}
                        </div>
                        <h3 className={`text-xl font-bold mb-1 text-white`}>
                          {g.label}
                        </h3>
                        <p className={`text-xs font-mono tracking-wider text-white/70`}>
                          {g.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Preferences & Allergies */}
                  <div className="space-y-6">
                    
                    {/* Dietary Preferences */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">Dietary Preferences</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Optional</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {dietaryOptions.map(diet => {
                          const active = formData.dietaryPreferences.includes(diet);
                          return (
                            <button
                              key={diet}
                              type="button"
                              onClick={() => toggleArrayField("dietaryPreferences", diet)}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                active 
                                  ? "bg-secondary/20 text-secondary border-secondary" 
                                  : "bg-[#222] text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200"
                              }`}
                            >
                              {diet}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">Allergies</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Optional</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        {commonAllergies.map(allergy => {
                          const active = formData.allergies.includes(allergy);
                          return (
                            <button
                              key={allergy}
                              type="button"
                              onClick={() => toggleArrayField("allergies", allergy)}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                active 
                                  ? "bg-red-500/20 text-red-400 border-red-500/50" 
                                  : "bg-[#222] text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200"
                              }`}
                            >
                              {allergy}
                            </button>
                          );
                        })}
                        
                        {/* Render dynamically added custom allergies */}
                        {formData.allergies.filter(a => !commonAllergies.includes(a)).map(custom => (
                           <button
                             key={custom}
                             type="button"
                             onClick={() => toggleArrayField("allergies", custom)}
                             className="px-4 py-2 rounded-full text-xs font-bold transition-all border bg-red-500/20 text-red-400 border-red-500/50 flex items-center gap-1"
                           >
                             {custom} <span className="text-[10px] opacity-70">✕</span>
                           </button>
                        ))}
                      </div>

                      {/* Add custom allergy input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customAllergy}
                          onChange={e => setCustomAllergy(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                          placeholder="Other allergy..."
                          className="flex-1 bg-[#222] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
                        />
                        <button 
                          type="button"
                          onClick={addCustomAllergy}
                          disabled={!customAllergy.trim()}
                          className="px-4 py-2.5 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors flex items-center justify-center border border-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments/Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">Chef Instructions</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Optional</span>
                    </div>
                    <textarea 
                      value={formData.comments}
                      onChange={(e) => updateField("comments", e.target.value)}
                      placeholder="Any specific aversions, preferences, or notes for the culinary team? (e.g. 'No cilantro', 'Extra dressing on the side')"
                      className="w-full bg-[#222222] border border-gray-800 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all shadow-inner resize-none h-40 md:h-[235px]"
                    />
                    <div className="flex items-start gap-2 mt-3 text-gray-500">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        We review all notes carefully. However, for severe medical allergies, please contact support directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800/50 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto md:px-12 bg-tertiary text-white py-4.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-colors shadow-lg shadow-tertiary/20"
                  >
                    Complete Profile
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>

              </form>
            </div>

            {/* -------------------- STEP 3 -------------------- */}
            <div className={`transition-all duration-500 ${step === 3 ? 'block opacity-100' : 'hidden opacity-0 h-0 overflow-hidden'}`}>
              
              <div className="mb-6 max-w-xl text-center mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 font-headline">
                  Choose Your <span className="text-secondary">Plan</span>
                </h2>
                <p className="text-[#E6D0BA]/80 text-sm md:text-base font-serif italic">
                  Personalised to your calorie goal.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                
                {/* Plan Duration */}
                <div className="flex justify-center">
                  <div className="relative flex p-1 bg-[#151515] rounded-full border border-gray-800/60 max-w-[280px] w-full">
                     {/* Sliding Pill */}
                     <div 
                        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 ease-out"
                        style={{ transform: formData.planDuration === "WEEKLY" ? "translateX(0)" : "translateX(100%)" }}
                     />
                     <button type="button" onClick={() => updateField("planDuration", "WEEKLY")} className={`relative z-10 flex-1 py-3 text-xs font-bold tracking-widest rounded-full transition-colors duration-300 ${formData.planDuration === "WEEKLY" ? "text-white" : "text-gray-400 hover:text-white"}`}>WEEKLY</button>
                     <button type="button" onClick={() => updateField("planDuration", "MONTHLY")} className={`relative z-10 flex-1 py-3 text-xs font-bold tracking-widest rounded-full transition-colors duration-300 ${formData.planDuration === "MONTHLY" ? "text-white" : "text-gray-400 hover:text-white"}`}>MONTHLY</button>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#E6D0BA]/80 uppercase tracking-widest mb-4">Frequency</h3>
                  <div className="relative flex p-1 bg-[#151515] rounded-2xl border border-gray-800/60">
                    {/* Sliding Pill */}
                    <div 
                       className="absolute inset-y-1 left-1 w-[calc(33.333%-2.66px)] bg-secondary rounded-xl transition-transform duration-300 ease-out shadow-[0_0_15px_rgba(76,175,80,0.3)]"
                       style={{ 
                         transform: formData.planFrequency === "5 DAYS" ? "translateX(0)" : 
                                    formData.planFrequency === "6 DAYS" ? "translateX(100%)" : "translateX(200%)" 
                       }}
                    />
                    {["5 DAYS", "6 DAYS", "7 DAYS"].map(freq => (
                      <button key={freq} type="button" onClick={() => updateField("planFrequency", freq)} className={`relative z-10 flex-1 py-4 text-sm font-bold tracking-wider rounded-xl transition-colors duration-300 ${formData.planFrequency === freq ? "text-white" : "text-gray-400 hover:text-white"}`}>
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal Slots */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#E6D0BA]/80 uppercase tracking-widest mb-4">Meal Slots</h3>
                  <div className="bg-[#151515] rounded-2xl border border-gray-800/60 px-6 py-6 flex justify-between items-center relative">
                     {/* Connecting Line */}
                     <div className="absolute left-16 right-16 top-[56px] h-[1px] bg-gray-800/60 z-0" />
                     
                     {[
                       { id: "B-FAST", icon: <Sun className="w-6 h-6" />, fillClass: "bg-[#8B5CF6]/40", activeClass: "text-[#8B5CF6]", borderClass: "border-[#8B5CF6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]" },
                       { id: "LUNCH", icon: <Utensils className="w-6 h-6" />, fillClass: "bg-[#10B981]/40", activeClass: "text-[#10B981]", borderClass: "border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" },
                       { id: "DINNER", icon: <Moon className="w-6 h-6" />, fillClass: "bg-[#F97316]/40", activeClass: "text-[#F97316]", borderClass: "border-[#F97316]/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]" },
                     ].map(slot => {
                        const active = formData.mealSlots.includes(slot.id);
                        return (
                          <div key={slot.id} className="relative z-10 flex flex-col items-center gap-4">
                            <button 
                              type="button" 
                              onClick={() => toggleArrayField("mealSlots", slot.id)} 
                              className={`relative overflow-hidden w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-700/50 ${active ? slot.borderClass : "bg-[#1A1A1A] hover:bg-[#222]"}`}
                            >
                               {/* Bottom Fill Animation */}
                               <div 
                                  className={`absolute bottom-0 left-0 right-0 ${slot.fillClass} transition-all duration-500 ease-out z-0`}
                                  style={{ height: active ? '100%' : '0%' }}
                               />
                               <div className={`relative z-10 transition-colors duration-500 ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                  {slot.icon}
                               </div>
                            </button>
                            <span className={`text-[10px] font-bold tracking-widest transition-colors duration-500 ${active ? slot.activeClass : "text-[#E6D0BA]/80"}`}>{slot.id}</span>
                          </div>
                        )
                     })}
                  </div>
                </div>

                {/* Submit Circle Button */}
                <div className="flex justify-center pt-4">
                  <button type="submit" className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,117,31,0.5)]">
                    <Check className="w-8 h-8" strokeWidth={3} />
                  </button>
                </div>

              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
