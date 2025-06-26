// Script: user1-pets-and-appointments.js
// Purpose: Show user1's pets, and delete all but 2 appointments (1 past, 1 future) for their pets

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'vetcare-pro';
const user1Email = 'user1@example.com';

async function main() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    // Find user1
    const user = await db.collection('users').findOne({ email: user1Email });
    if (!user) {
      console.log('❌ user1@example.com not found.');
      return;
    }
    // Find user1's pets
    const pets = await db.collection('pets').find({ $or: [ { customerId: user._id }, { userId: user._id } ] }).toArray();
    console.log(`\n🐾 Pets for user1@example.com:`);
    if (pets.length === 0) {
      console.log('No pets found.');
    } else {
      pets.forEach((pet, i) => {
        console.log(`${i+1}. ${pet.name} (${pet.species}) - _id: ${pet._id}`);
      });
    }
    // Find all appointments for user1's pets
    const petIds = pets.map(p => p._id);
    if (petIds.length === 0) {
      console.log('No appointments to clean up.');
      return;
    }
    const now = new Date();
    const allApts = await db.collection('appointments').find({ petId: { $in: petIds } }).toArray();
    // Separate past and future
    const past = allApts.filter(a => new Date(a.appointmentDate) < now);
    const future = allApts.filter(a => new Date(a.appointmentDate) >= now);
    // Keep 1 past, 1 future (if any)
    const keep = [];
    if (past.length > 0) keep.push(past[0]._id);
    if (future.length > 0) keep.push(future[0]._id);
    const toDelete = allApts.filter(a => !keep.includes(a._id)).map(a => a._id);
    if (toDelete.length > 0) {
      const result = await db.collection('appointments').deleteMany({ _id: { $in: toDelete } });
      console.log(`\n🗑️ Deleted ${result.deletedCount} appointments for user1's pets (kept 1 past, 1 future if available).`);
    } else {
      console.log('\nNo appointments needed to be deleted.');
    }
    // Print kept appointments
    const keptApts = await db.collection('appointments').find({ _id: { $in: keep } }).toArray();
    if (keptApts.length > 0) {
      console.log('\n✅ Kept appointments:');
      keptApts.forEach((a, i) => {
        console.log(`${i+1}. Date: ${a.appointmentDate}, Status: ${a.status}, Pet: ${a.petId}`);
      });
    } else {
      console.log('\nNo appointments remain for user1 pets.');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}
