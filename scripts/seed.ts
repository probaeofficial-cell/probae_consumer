import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';

if (typeof global.crypto !== 'object') {
  (global as any).crypto = {
    getRandomValues: (buffer: any) => crypto.randomFillSync(buffer)
  };
}

import PlanTier from '../src/models/PlanTier';
import Bowl from '../src/models/Bowl';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const combinations = [
  { type: 'Breakfast Only', slots: ['B'] },
  { type: 'Lunch Only', slots: ['L'] },
  { type: 'Dinner Only', slots: ['D'] },
  { type: 'Breakfast + Lunch', slots: ['B', 'L'] },
  { type: 'Breakfast + Dinner', slots: ['B', 'D'] },
  { type: 'Lunch + Dinner', slots: ['L', 'D'] },
  { type: 'Breakfast + Lunch + Dinner', slots: ['B', 'L', 'D'] },
];

const durations = ['WEEKLY', 'MONTHLY'];
const frequencies = [5, 6, 7];
const categories = ['Core', 'Pro'];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected!');

    console.log('Removing existing plans...');
    await PlanTier.deleteMany({});
    
    console.log('Creating standard bowls...');
    const bBowl = await Bowl.create({
      name: 'Seed Breakfast Bowl',
      code: `SEED-B-${Date.now()}`,
      baseCalories: 500,
      basePrice: 10,
      baseWeight: 300,
      category: 'Core',
      macros: { protein: 30, carbs: 40, fat: 15, fiber: 10 },
      micros: ['Iron', 'Calcium'],
      ingredients: ['Oats', 'Milk', 'Berries'],
      mealTypes: ['B'],
      isActive: true,
    });

    const lBowl = await Bowl.create({
      name: 'Seed Lunch Bowl',
      code: `SEED-L-${Date.now()}`,
      baseCalories: 600,
      basePrice: 15,
      baseWeight: 400,
      category: 'Core',
      macros: { protein: 40, carbs: 50, fat: 20, fiber: 15 },
      micros: ['Vitamin C'],
      ingredients: ['Chicken', 'Rice', 'Broccoli'],
      mealTypes: ['L'],
      isActive: true,
    });

    const dBowl = await Bowl.create({
      name: 'Seed Dinner Bowl',
      code: `SEED-D-${Date.now()}`,
      baseCalories: 550,
      basePrice: 14,
      baseWeight: 350,
      category: 'Core',
      macros: { protein: 35, carbs: 40, fat: 20, fiber: 12 },
      micros: ['Magnesium'],
      ingredients: ['Salmon', 'Quinoa', 'Asparagus'],
      mealTypes: ['D'],
      isActive: true,
    });

    const bowlMap: Record<string, mongoose.Types.ObjectId> = {
      'B': bBowl._id as mongoose.Types.ObjectId,
      'L': lBowl._id as mongoose.Types.ObjectId,
      'D': dBowl._id as mongoose.Types.ObjectId,
    };

    console.log('Generating Plan Tiers...');
    const plansToInsert = [];

    for (const duration of durations) {
      for (const days of frequencies) {
        for (const cat of categories) {
          for (const combo of combinations) {
            
            const selections = combo.slots.map(slot => ({
              type: slot,
              bowls: [bowlMap[slot]]
            }));

            // Calculate dummy price
            const basePrice = combo.slots.length * days * (cat === 'Core' ? 15 : 20);
            const multiplier = duration === 'MONTHLY' ? 4 : 1;
            const totalPrice = basePrice * multiplier;
            const discountPrice = Math.round(totalPrice * 0.9); // 10% discount

            plansToInsert.push({
              name: `${cat} ${duration} ${days} Days - ${combo.type}`,
              category: cat,
              duration,
              days,
              mealType: combo.type,
              selections,
              totalPrice,
              discountPrice
            });
          }
        }
      }
    }

    await PlanTier.insertMany(plansToInsert);
    console.log(`Successfully seeded ${plansToInsert.length} plans!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
