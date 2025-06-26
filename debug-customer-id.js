// Check the exact format of customerId in the database
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCustomerIdFormat() {
  console.log('🔍 Debug: Customer ID Format Issue\n');
  
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('vetcare-pro');

    const userId = '684be9bc062e86bae005a46b'; // user2@example.com

    // 1. Check raw appointment data
    console.log('1️⃣ Raw appointment data:');
    const appointments = await db.collection('appointments').find({}).limit(3).toArray();
    appointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. customerId: "${apt.customerId}" (type: ${typeof apt.customerId})`);
      console.log(`      Equals userId: ${apt.customerId === userId}`);
      console.log(`      toString(): "${apt.customerId.toString()}"`);
    });

    // 2. Check if customerId is stored as ObjectId
    console.log('\n2️⃣ Trying ObjectId query:');
    try {
      const objectIdQuery = await db.collection('appointments').find({ customerId: new ObjectId(userId) }).toArray();
      console.log(`   ObjectId query result: ${objectIdQuery.length} appointments`);
    } catch (error) {
      console.log(`   ObjectId query failed: ${error.message}`);
    }

    // 3. Check string query
    console.log('\n3️⃣ String query:');
    const stringQuery = await db.collection('appointments').find({ customerId: userId }).toArray();
    console.log(`   String query result: ${stringQuery.length} appointments`);

    // 4. Check pets collection format
    console.log('\n4️⃣ Pets collection format:');
    const pets = await db.collection('pets').find({}).limit(3).toArray();
    pets.forEach((pet, index) => {
      console.log(`   ${index + 1}. ownerId: "${pet.ownerId}" (type: ${typeof pet.ownerId})`);
      console.log(`      Equals userId: ${pet.ownerId === userId}`);
      console.log(`      toString(): "${pet.ownerId.toString()}"`);
    });

    // 5. Try ObjectId query for pets
    console.log('\n5️⃣ Pets ObjectId query:');
    try {
      const petsObjectId = await db.collection('pets').find({ ownerId: new ObjectId(userId) }).toArray();
      console.log(`   ObjectId pets query: ${petsObjectId.length} pets`);
    } catch (error) {
      console.log(`   ObjectId pets query failed: ${error.message}`);
    }

    // 6. Find appointments that actually belong to user2@example.com
    console.log('\n6️⃣ All appointments with customerId containing "46b":');
    const regex = new RegExp('46b', 'i');
    const regexResults = await db.collection('appointments').find({ customerId: regex }).toArray();
    console.log(`   Found ${regexResults.length} appointments:`);
    regexResults.forEach((apt, index) => {
      console.log(`   ${index + 1}. customerId: "${apt.customerId}"`);
      console.log(`      Pet: ${apt.petId}, Date: ${apt.appointmentDate}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkCustomerIdFormat().catch(console.error);
