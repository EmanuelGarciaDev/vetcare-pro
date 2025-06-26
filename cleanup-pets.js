// Script: cleanup-pets.js
// Purpose: Remove or fix pets in the database that are missing _id or required fields

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'vetcare-pro';
const requiredFields = ['name', 'species', 'gender', 'age'];

async function cleanupPets() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const pets = await db.collection('pets').find({}).toArray();
    let removed = 0;
    let fixed = 0;
    for (const pet of pets) {
      // Remove if missing _id or _id is not a valid ObjectId
      if (!pet._id || !ObjectId.isValid(pet._id)) {
        await db.collection('pets').deleteOne({ _id: pet._id });
        console.log(`❌ Removed pet with invalid or missing _id:`, pet);
        removed++;
        continue;
      }
      // Remove if missing any required field
      let missing = requiredFields.filter(f => !pet[f]);
      if (missing.length > 0) {
        await db.collection('pets').deleteOne({ _id: pet._id });
        console.log(`❌ Removed pet missing fields (${missing.join(', ')}):`, pet);
        removed++;
        continue;
      }
      // Optionally: Fix fields if possible (e.g., set default age if missing)
      // ...
    }
    console.log(`\n✅ Cleanup complete. Removed: ${removed}, Fixed: ${fixed}`);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  cleanupPets();
}
