// Debug script to check appointments for user2@example.com
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function debugUserAppointments() {
  console.log('🔍 Debug: User Appointments Issue\n');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('vetcare-pro');

    const userId = '684be9bc062e86bae005a46b'; // user2@example.com

    // 1. Check all appointments in the collection
    console.log('1️⃣ All appointments in database:');
    const allAppointments = await db.collection('appointments').find({}).limit(10).toArray();
    console.log(`   Found ${allAppointments.length} total appointments:`);
    allAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. Customer: ${apt.customerId}, Pet: ${apt.petId}, Date: ${apt.appointmentDate}`);
      console.log(`      Clinic: ${apt.clinicId}, Type: ${apt.type}, Status: ${apt.status}`);
    });

    // 2. Check appointments for this specific user
    console.log('\n2️⃣ Appointments for user 684be9bc062e86bae005a46b:');
    const userAppointments = await db.collection('appointments').find({ customerId: userId }).toArray();
    console.log(`   Found ${userAppointments.length} appointments for this user:`);
    userAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. Pet: ${apt.petId}, Date: ${apt.appointmentDate}, Time: ${apt.startTime}`);
      console.log(`      Clinic: ${apt.clinicId}, Type: ${apt.type}, Reason: ${apt.reason}`);
    });

    // 3. Check user's pets
    console.log('\n3️⃣ User pets:');
    const userPets = await db.collection('pets').find({ ownerId: userId }).toArray();
    console.log(`   Found ${userPets.length} pets for this user:`);
    userPets.forEach((pet, index) => {
      console.log(`   ${index + 1}. ${pet.name} (${pet.species}) - ID: ${pet._id}`);
    });

    // 4. Check if appointments match user's pets
    console.log('\n4️⃣ Checking pet ID matches:');
    const userPetIds = userPets.map(pet => pet._id);
    console.log('   User pet IDs:', userPetIds);
    
    userAppointments.forEach((apt, index) => {
      const petMatch = userPetIds.some(petId => petId.toString() === apt.petId.toString());
      console.log(`   Appointment ${index + 1}: Pet ID ${apt.petId} - Match: ${petMatch}`);
    });

    // 5. Test the exact filter from the API
    console.log('\n5️⃣ Testing API filter logic:');
    const filter = {
      customerId: userId,
      $or: [
        { petId: { $in: userPetIds } },
        { petId: null }
      ]
    };
    console.log('   Filter:', JSON.stringify(filter, null, 2));
    
    const filteredAppointments = await db.collection('appointments').find(filter).toArray();
    console.log(`   Result: ${filteredAppointments.length} appointments found with API filter`);

    // 6. Check recent appointments (last hour)
    console.log('\n6️⃣ Recent appointments (last hour):');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAppointments = await db.collection('appointments')
      .find({ 
        customerId: userId,
        createdAt: { $gte: oneHourAgo }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`   Found ${recentAppointments.length} recent appointments:`);
    recentAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. Created: ${apt.createdAt}, Pet: ${apt.petId}`);
      console.log(`      Date: ${apt.appointmentDate}, Time: ${apt.startTime}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

debugUserAppointments().catch(console.error);
