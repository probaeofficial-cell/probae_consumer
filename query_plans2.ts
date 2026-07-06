import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const PlanTier = mongoose.connection.collection("plantiers");
  const plans = await PlanTier.find({}).toArray();
  console.log(JSON.stringify(plans, null, 2));
  mongoose.disconnect();
}
run().catch(console.error);
