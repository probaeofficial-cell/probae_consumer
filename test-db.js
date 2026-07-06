const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });
async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const plans = await db.collection("plantiers").find({}).toArray();
  console.log(JSON.stringify(plans, null, 2));
  await client.close();
}
run();
