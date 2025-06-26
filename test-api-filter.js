const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function simulateApiFilter() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Simulating Appointments API Filter ===');
    
    // Get maria.garcia (user2 equivalent)
    const user = await db.collection('users').findOne({ email: 'maria.garcia@email.com' });
    if (!user) {
      console.log('❌ Maria Garcia not found');
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user._id})`);
    
    // Get user's pets (this is what our API does first)
    const userPets = await db.collection('pets').find({ 
      ownerId: new ObjectId(user._id) 
    }).toArray();
    console.log(`✅ User owns ${userPets.length} pets:`);
    userPets.forEach(pet => {
      console.log(`   - ${pet.name} (ID: ${pet._id})`);
    });
    
    const userPetIds = userPets.map(pet => pet._id.toString());
    
    // OLD WAY (what was causing the issue)
    const oldFilter = { customerId: user._id.toString() };
    const oldAppointments = await db.collection('appointments').find(oldFilter).toArray();
    console.log(`\n❌ OLD API: ${oldAppointments.length} appointments (includes pets not owned by user)`);
    
    // NEW WAY (our fix)
    const newFilter = { 
      customerId: user._id.toString(),
      $or: [
        { petId: { $in: userPetIds } },
        { petId: null }
      ]
    };
    const newAppointments = await db.collection('appointments').find(newFilter).toArray();
    console.log(`✅ NEW API: ${newAppointments.length} appointments (only user's pets or no pet)`);
    
    console.log('\n🔍 Comparison:');
    console.log(`Old filter would show: ${oldAppointments.length} appointments`);
    console.log(`New filter shows: ${newAppointments.length} appointments`);
    console.log(`Filtered out: ${oldAppointments.length - newAppointments.length} inappropriate appointments`);
    
    if (oldAppointments.length > newAppointments.length) {
      console.log('\n✅ FIX VERIFIED: The new API correctly filters out appointments for pets not owned by the user!');
    } else {
      console.log('\n⚠️  No difference found - either no problematic appointments exist or they need to be created for testing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

simulateApiFilter();
