// Script: fix-pet-owners.js
// Purpose: Assign each pet to a user (round-robin if needed) so all pets have a valid owner

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'vetcare-pro';

async function main() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    // Get all users with role Customer
    const users = await db.collection('users').find({ role: 'Customer' }).toArray();
    if (users.length === 0) {
      console.log('❌ No customer users found.');
      return;
    }
    // Get all pets
    const pets = await db.collection('pets').find({}).toArray();
    if (pets.length === 0) {
      console.log('No pets found.');
      return;
    }
    // Assign each pet to a user (round-robin)
    let updated = 0;
    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      const user = users[i % users.length];
      await db.collection('pets').updateOne(
        { _id: pet._id },
        { $set: { customerId: user._id } }
      );
      console.log(`Assigned pet '${pet.name}' (_id: ${pet._id}) to user '${user.email}' (_id: ${user._id})`);
      updated++;
    }
    console.log(`\n✅ Updated ${updated} pets with customerId.`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}
