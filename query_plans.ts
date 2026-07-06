import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const PlanTier = mongoose.connection.collection("plantiers");
  const plans = await PlanTier.find({}).toArray();
  console.log(JSON.stringify(plans, null, 2));
  mongoose.disconnect();
}
run().catch(console.error);
