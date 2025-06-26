const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function findUsersWithAppointments() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Finding Users with Appointments ===');
    
    // Get all appointments and group by customerId
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`Total appointments: ${appointments.length}`);
    
    const customerIds = [...new Set(appointments.map(apt => apt.customerId))];
    console.log(`\nCustomers with appointments: ${customerIds.length}`);
    
    for (const customerId of customerIds) {
      const user = await db.collection('users').findOne({ _id: new ObjectId(customerId) });
      const userAppointments = appointments.filter(apt => apt.customerId === customerId);
      
      console.log(`\n👤 ${user?.name || 'Unknown'} (${user?.email || 'Unknown'}):`);
      console.log(`   Customer ID: ${customerId}`);
      console.log(`   Appointments: ${userAppointments.length}`);
      
      // Check pets for each appointment
      for (const apt of userAppointments.slice(0, 3)) { // Show first 3
        const pet = await db.collection('pets').findOne({ _id: new ObjectId(apt.petId) });
        console.log(`   - Pet: ${pet?.name || 'Unknown'} (${apt.petId}) - Type: ${apt.type}`);
      }
      if (userAppointments.length > 3) {
        console.log(`   ... and ${userAppointments.length - 3} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

findUsersWithAppointments();
