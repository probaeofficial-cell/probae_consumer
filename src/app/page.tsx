import React from "react";
import Header from "@/components/user/Header";
import BottomNav from "@/components/user/BottomNav";
import BowlCard from "@/components/user/BowlCard";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Utensils, Salad } from "lucide-react";
import Bowl from "@/models/Bowl";
import "@/models/Image";
import connectToDatabase from "@/lib/db";
import FadeInUp from "@/components/animations/FadeInUp";
import OptimizingSection from "@/components/animations/OptimizingSection";

// This is a Server Component
export default async function LandingPage() {
  await connectToDatabase();
  
  // Fetch active bowls and populate image
  const bowls = await Bowl.find({ isActive: true }).populate("imageId").lean();
  
  // Serialize ObjectId to string for client component and limit to 10 bowls
  const serializedBowls = bowls.slice(0, 10).map((bowl: any) => ({
    _id: bowl._id.toString(),
    name: bowl.name,
    baseCalories: bowl.baseCalories,
    basePrice: bowl.basePrice,
    macros: bowl.macros,
    category: bowl.category,
    mealTypes: bowl.mealTypes,
    micros: bowl.micros,
    ingredients: bowl.ingredients,
    imageId: bowl.imageId ? { url: bowl.imageId.url } : undefined,
  }));

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative pb-24 md:pb-0">
      {/* Edge-to-edge container */}
      <div className="w-full mx-auto min-h-screen relative overflow-x-hidden flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
          
          {/* 1. HERO SECTION */}
          <section className="relative flex flex-col md:flex-row-reverse items-center justify-center pt-32 pb-12 px-6 md:px-12 md:pt-40 md:pb-24 gap-12 md:gap-20">
            
            {/* Circular Bowl Image with Slanted Banner (Right on Desktop) */}
            <FadeInUp delay={0.2} duration={1} className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] flex items-center justify-center mb-8 md:mb-0 shrink-0">
              {/* Slanted Green Banner */}
              <div className="absolute top-1/2 left-1/2 w-[150%] md:w-[200%] h-12 md:h-16 bg-[#15803D] -translate-x-1/2 -translate-y-1/2 -rotate-12 flex items-center overflow-hidden z-0">
                <div className="flex gap-4 text-white font-bold tracking-[0.2em] whitespace-nowrap opacity-90 text-sm md:text-lg animate-marquee">
                  <span>PROPER • LIVE</span>
                  <span>PROPER • LIVE</span>
                  <span>PROPER • LIVE</span>
                  <span>PROPER • LIVE</span>
                  <span>PROPER • LIVE</span>
                  <span>PROPER • LIVE</span>
                </div>
              </div>
              
              {/* Circle Image */}
              <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-[6px] border-[#F8F9FA] z-10 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"
                  alt="Delicious Bowl"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </FadeInUp>

            {/* Hero Text & CTA (Left on Desktop) */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:flex-1 max-w-xl">
              <FadeInUp delay={0.1} className="mb-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.15] md:leading-[1.1] tracking-tight">
                  Eat for your <span className="text-[#15803D]">body</span>.<br/>
                  Not the <span className="relative inline-block">
                    crowd
                    <span className="absolute top-1/2 left-[-5%] w-[110%] h-[3px] md:h-[5px] bg-[#F97316] -translate-y-1/2 rotate-2"></span>
                  </span>.
                </h1>
              </FadeInUp>

              {/* CTA Button with dashed offset border */}
              <FadeInUp delay={0.3} className="relative mb-14 group z-20">
                <div className="absolute inset-0 border-2 border-dashed border-[#F97316] rounded-xl translate-x-1.5 translate-y-1.5 pointer-events-none transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <Link href="/onboarding" className="relative bg-[#F97316] text-white px-8 py-4 md:px-10 md:py-5 rounded-xl font-bold text-lg md:text-xl flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-transform">
                  Order from Probae
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </Link>
              </FadeInUp>

              {/* Stats Row */}
              <FadeInUp delay={0.4} className="w-full flex justify-between items-center px-2 py-4 md:py-6 border-t border-gray-200/60 md:gap-8 md:justify-start">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[#8B5CF6] font-bold text-lg md:text-2xl">500+</span>
                  <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight mt-1">Bowls<br/>Crafted</span>
                </div>
                <div className="h-8 md:h-12 w-px bg-gray-200/60"></div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[#10B981] font-bold text-lg md:text-2xl">3</span>
                  <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight mt-1">Daily<br/>Meals</span>
                </div>
                <div className="h-8 md:h-12 w-px bg-gray-200/60"></div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[#F97316] font-bold text-lg md:text-2xl">100%</span>
                  <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight mt-1">Balanced<br/>Macros</span>
                </div>
              </FadeInUp>
            </div>
          </section>

          {/* 2. MENU SECTION (Original Flip Cards) */}
          <section className="bg-white rounded-[40px] pt-12 md:pt-20 pb-24 md:pb-32 px-0 md:px-12 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col relative z-20">
            <FadeInUp className="px-8 md:px-0 text-center mb-10 md:mb-16 flex flex-col items-center max-w-3xl mx-auto">
              <div className="text-[#15803D] mb-4">
                <Utensils className="w-8 h-8 md:w-10 md:h-10 mx-auto" strokeWidth={2.5} />
              </div>
              <p className="text-gray-500 text-sm md:text-lg leading-relaxed mb-6 md:mb-8 px-2 md:px-0">
                Enjoy vibrant, nutrient-rich salads that burst with flavor, promoting vitality and freshness. These delicious meals are perfect for enhancing your overall well-being and keeping you energized throughout the day.
              </p>
              <Link href="/menu" className="bg-[#F97316] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 md:text-lg hover:-translate-y-0.5 transition-transform">
                Browse The Menu
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
              </Link>
            </FadeInUp>

            {/* Horizontal Scroll on All Devices */}
            <div className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory px-8 md:px-12 pt-4 pb-12">
              <div className={`flex gap-6 md:gap-10 ${serializedBowls.length === 0 ? "w-full justify-center" : "w-max"}`}>
                {serializedBowls.map((bowl, index) => (
                  <FadeInUp key={bowl._id} delay={index * 0.1} yOffset={20}>
                    <BowlCard bowl={bowl as any} index={index} />
                  </FadeInUp>
                ))}
                
                {/* Fallback if no bowls in DB */}
                {serializedBowls.length === 0 && (
                  <div className="w-[300px] h-[450px] bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center p-8 shadow-sm shrink-0">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100/50">
                      <Salad className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Fresh Bowls Brewing!</h3>
                    <p className="text-sm text-gray-500">We're currently preparing our menu. Check back soon for our latest curated selections.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. OPTIMIZING SECTION */}
          <OptimizingSection />

        </main>
        <BottomNav />
      </div>
    </div>
  );
}
