const mongoose = require('mongoose');
const { Schema } = mongoose;

const uri = "mongodb://localhost:27017/probae"; // Assume default local mongo

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Get the models from db directly
  const db = mongoose.connection.db;
  const subscriptions = db.collection('subscriptions');
  const users = db.collection('users');

  const sub = await subscriptions.findOne({});
  console.log("Found subscription:", sub);

  if (sub && sub.calculatedBowls) {
    console.log("Bowls:");
    sub.calculatedBowls.forEach(b => {
      console.log(b.originalBowlId, typeof b.originalBowlId, b.name, b.selectedDip);
    });
  }

  mongoose.disconnect();
}
run();
