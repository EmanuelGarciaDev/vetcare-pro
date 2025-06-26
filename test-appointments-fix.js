const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function testAppointmentsFix() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Testing Appointments Fix ===');
    
    // Get john.smith user (a customer)
    const user = await db.collection('users').findOne({ email: 'john.smith@email.com' });
    if (!user) {
      console.log('❌ John Smith not found');
      return;
    }
    console.log(`✅ Found user: ${user._id} (${user.name})`);
    
    // Get user's pets
    const userPets = await db.collection('pets').find({ 
      ownerId: new ObjectId(user._id) 
    }).toArray();
    console.log(`✅ User owns ${userPets.length} pets:`);
    userPets.forEach(pet => {
      console.log(`   - ${pet.name} (ID: ${pet._id})`);
    });
    
    const userPetIds = userPets.map(pet => pet._id.toString());
    
    // Get all appointments for user (old way - just by customerId)
    const allUserAppointments = await db.collection('appointments').find({
      customerId: user._id.toString()
    }).toArray();
    console.log(`\n📋 Total appointments with customerId=${user._id}: ${allUserAppointments.length}`);
    
    // Show which pets these appointments are for
    console.log('Appointments by pet:');
    for (const apt of allUserAppointments) {
      const pet = await db.collection('pets').findOne({ _id: new ObjectId(apt.petId) });
      const petOwner = pet ? pet.ownerId.toString() : 'N/A';
      const isUsersPet = userPetIds.includes(apt.petId);
      console.log(`   - Pet: ${pet?.name || 'Unknown'} (ID: ${apt.petId}) - Owner: ${petOwner} - User's pet: ${isUsersPet}`);
    }
    
    // Test the new filtering logic
    const filteredAppointments = await db.collection('appointments').find({
      customerId: user._id.toString(),
      $or: [
        { petId: { $in: userPetIds } },
        { petId: null }
      ]
    }).toArray();
    
    console.log(`\n✅ Filtered appointments (only user's pets): ${filteredAppointments.length}`);
    console.log('Filtered appointments by pet:');
    for (const apt of filteredAppointments) {
      const pet = await db.collection('pets').findOne({ _id: new ObjectId(apt.petId) });
      console.log(`   - Pet: ${pet?.name || 'No pet'} (ID: ${apt.petId || 'null'})`);
    }
    
    console.log('\n🎯 Fix verification:');
    console.log(`Before: ${allUserAppointments.length} appointments`);
    console.log(`After: ${filteredAppointments.length} appointments`);
    console.log(`Filtered out: ${allUserAppointments.length - filteredAppointments.length} appointments for pets not owned by user`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testAppointmentsFix();
