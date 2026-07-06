const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://probaeadmin:Pj1D3sM9n1x2u4hB@probae.t62i8.mongodb.net/?retryWrites=true&w=majority&appName=probae";
async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const plans = await db.collection("plantiers").find({}).toArray();
  console.log(JSON.stringify(plans, null, 2));
  await client.close();
}
run();
