import crypto from "crypto";
if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}
import mongoose from "mongoose";

const uri = "mongodb://localhost:27017/probae_consumer";

const data = [
  { name: "Teriyaki Salmon Bowl", code: "TSB-01", category: "Pro", mealTypes: ["L", "D"], basePrice: 16.99, baseCalories: 610, baseWeight: 420, macros: { protein: 35, carbs: 48, fat: 24, fiber: 5 }, micros: ["Omega-3", "Vitamin D", "Potassium"], isActive: true },
  { name: "Veggie Delight Bowl", code: "VDB-01", category: "Core", mealTypes: ["B", "L"], basePrice: 10.99, baseCalories: 360, baseWeight: 370, macros: { protein: 14, carbs: 52, fat: 10, fiber: 11 }, micros: ["Vitamin C", "Folate", "Magnesium"], isActive: true },
  { name: "Korean Beef Bowl", code: "KBB-01", category: "Pro", mealTypes: ["L", "D"], basePrice: 15.49, baseCalories: 590, baseWeight: 410, macros: { protein: 34, carbs: 46, fat: 21, fiber: 5 }, micros: ["Iron", "Zinc", "Vitamin B12"], isActive: true },
  { name: "BBQ Chicken Bowl", code: "BCB-01", category: "Core", mealTypes: ["L", "D"], basePrice: 13.49, baseCalories: 540, baseWeight: 390, macros: { protein: 36, carbs: 44, fat: 17, fiber: 4 }, micros: ["Selenium", "Niacin", "Phosphorus"], isActive: true },
  { name: "Mediterranean Bowl", code: "MDB-01", category: "Core", mealTypes: ["B", "L"], basePrice: 12.49, baseCalories: 450, baseWeight: 380, macros: { protein: 20, carbs: 42, fat: 18, fiber: 9 }, micros: ["Vitamin E", "Calcium", "Iron"], isActive: true },
  { name: "Shrimp Garlic Bowl", code: "SGB-01", category: "Pro", mealTypes: ["D"], basePrice: 15.99, baseCalories: 430, baseWeight: 360, macros: { protein: 31, carbs: 36, fat: 12, fiber: 4 }, micros: ["Iodine", "Selenium", "Vitamin B12"], isActive: true },
  { name: "Tofu Power Bowl", code: "TPB-01", category: "Core", mealTypes: ["B", "L", "D"], basePrice: 11.99, baseCalories: 390, baseWeight: 370, macros: { protein: 19, carbs: 38, fat: 16, fiber: 8 }, micros: ["Calcium", "Iron", "Magnesium"], isActive: true },
  { name: "Chicken Caesar Bowl", code: "CCB-01", category: "Core", mealTypes: ["L"], basePrice: 13.99, baseCalories: 510, baseWeight: 390, macros: { protein: 35, carbs: 29, fat: 22, fiber: 4 }, micros: ["Vitamin A", "Calcium", "Potassium"], isActive: true },
  { name: "Mexican Fiesta Bowl", code: "MFB-01", category: "Pro", mealTypes: ["L", "D"], basePrice: 14.49, baseCalories: 570, baseWeight: 420, macros: { protein: 28, carbs: 54, fat: 19, fiber: 10 }, micros: ["Vitamin C", "Folate", "Potassium"], isActive: true },
  { name: "Thai Peanut Bowl", code: "TPB-02", category: "Pro", mealTypes: ["B", "L"], basePrice: 13.99, baseCalories: 560, baseWeight: 400, macros: { protein: 24, carbs: 50, fat: 22, fiber: 8 }, micros: ["Magnesium", "Vitamin E", "Copper"], isActive: true },
  { name: "Cajun Chicken Bowl", code: "CJB-01", category: "Core", mealTypes: ["D"], basePrice: 13.49, baseCalories: 500, baseWeight: 390, macros: { protein: 37, carbs: 35, fat: 16, fiber: 5 }, micros: ["Vitamin B6", "Iron", "Zinc"], isActive: true },
  { name: "Garlic Butter Steak Bowl", code: "GBS-01", category: "Pro", mealTypes: ["D"], basePrice: 17.99, baseCalories: 650, baseWeight: 430, macros: { protein: 40, carbs: 38, fat: 30, fiber: 4 }, micros: ["Iron", "Zinc", "Vitamin B12"], isActive: true },
  { name: "Falafel Bowl", code: "FAB-01", category: "Core", mealTypes: ["L"], basePrice: 11.49, baseCalories: 470, baseWeight: 390, macros: { protein: 18, carbs: 48, fat: 18, fiber: 11 }, micros: ["Folate", "Iron", "Magnesium"], isActive: true },
  { name: "Pesto Chicken Bowl", code: "PCB-01", category: "Core", mealTypes: ["L", "D"], basePrice: 14.99, baseCalories: 540, baseWeight: 400, macros: { protein: 36, carbs: 34, fat: 22, fiber: 5 }, micros: ["Vitamin K", "Calcium", "Potassium"], isActive: true },
  { name: "Sweet Chili Tofu Bowl", code: "SCT-01", category: "Core", mealTypes: ["B", "L"], basePrice: 12.49, baseCalories: 420, baseWeight: 380, macros: { protein: 20, carbs: 46, fat: 14, fiber: 8 }, micros: ["Calcium", "Vitamin C", "Iron"], isActive: true },
  { name: "Lemon Herb Fish Bowl", code: "LHF-01", category: "Pro", mealTypes: ["L", "D"], basePrice: 15.49, baseCalories: 460, baseWeight: 390, macros: { protein: 33, carbs: 35, fat: 15, fiber: 5 }, micros: ["Vitamin D", "Selenium", "Iodine"], isActive: true },
  { name: "Buffalo Chicken Bowl", code: "BFC-01", category: "Pro", mealTypes: ["L", "D"], basePrice: 14.49, baseCalories: 550, baseWeight: 410, macros: { protein: 39, carbs: 37, fat: 20, fiber: 5 }, micros: ["Niacin", "Vitamin B6", "Phosphorus"], isActive: true },
  { name: "Avocado Quinoa Bowl", code: "AQB-01", category: "Core", mealTypes: ["B", "L"], basePrice: 13.49, baseCalories: 490, baseWeight: 390, macros: { protein: 17, carbs: 45, fat: 22, fiber: 10 }, micros: ["Potassium", "Vitamin E", "Folate"], isActive: true }
];

const BowlSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  baseCalories: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  baseWeight: { type: Number, required: true },
  category: { type: String, required: true, enum: ["Core", "Pro"] },
  mealTypes: [{ type: String, required: true }],
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  micros: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
});

const Bowl = mongoose.models.Bowl || mongoose.model("Bowl", BowlSchema);

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    
    for (const bowl of data) {
      // Find existing by name, update or create to ensure categories/mealTypes are applied
      const existing = await Bowl.findOne({ name: bowl.name });
      if (existing) {
        Object.assign(existing, bowl);
        await existing.save();
        console.log(`Updated: ${bowl.name}`);
      } else {
        await Bowl.create(bowl);
        console.log(`Created: ${bowl.name}`);
      }
    }
    
    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
