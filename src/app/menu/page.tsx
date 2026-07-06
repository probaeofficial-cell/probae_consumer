import React from "react";
import Header from "@/components/user/Header";
import BottomNav from "@/components/user/BottomNav";
import MenuSection from "@/components/user/MenuSection";
import Bowl from "@/models/Bowl";
import "@/models/Image";
import connectToDatabase from "@/lib/db";

export default async function MenuPage() {
  await connectToDatabase();
  
  // Fetch active bowls
  const bowls = await Bowl.find({ isActive: true }).populate("imageId").lean();
  
  // Serialize ObjectId to string for client component
  const serializedBowls = bowls.map((bowl: any) => ({
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
          {/* We only render the MenuSection on this page */}
          <MenuSection bowls={serializedBowls} />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
