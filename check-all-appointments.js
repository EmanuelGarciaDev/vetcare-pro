const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function checkAllAppointments() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== All Appointments in Database ===');
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`Found ${appointments.length} appointments total:`);
    
    for (const apt of appointments) {
      console.log(`\nAppointment ID: ${apt._id}`);
      console.log(`  Customer ID: ${apt.customerId}`);
      console.log(`  Pet ID: ${apt.petId}`);
      console.log(`  Date: ${apt.appointmentDate}`);
      console.log(`  Type: ${apt.type}`);
      console.log(`  Status: ${apt.status}`);
      
      // Get pet info
      if (apt.petId) {
        const pet = await db.collection('pets').findOne({ _id: new ObjectId(apt.petId) });
        console.log(`  Pet Name: ${pet?.name || 'Not found'}`);
        console.log(`  Pet Owner: ${pet?.ownerId || 'Not found'}`);
      }
      
      // Get customer info
      const customer = await db.collection('users').findOne({ _id: new ObjectId(apt.customerId) });
      console.log(`  Customer: ${customer?.name || 'Not found'} (${customer?.email || 'No email'})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAllAppointments();
