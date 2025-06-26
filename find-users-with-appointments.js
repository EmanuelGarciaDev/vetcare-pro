const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function findUsersWithAppointments() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Users with Appointments ===');
    
    // Get all appointments and group by customerId
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`Total appointments: ${appointments.length}`);
    
    const customerIds = [...new Set(appointments.map(apt => apt.customerId))];
    console.log(`Unique customer IDs: ${customerIds.length}`);
    
    for (const customerId of customerIds) {
      const user = await db.collection('users').findOne({ _id: new ObjectId(customerId) });
      const userAppointments = appointments.filter(apt => apt.customerId === customerId);
      
      console.log(`\n👤 Customer: ${user?.name || 'Unknown'} (${user?.email || 'No email'})`);
      console.log(`   ID: ${customerId}`);
      console.log(`   Appointments: ${userAppointments.length}`);
      
      // Show first few appointments with pet info
      for (let i = 0; i < Math.min(3, userAppointments.length); i++) {
        const apt = userAppointments[i];
        let petInfo = 'No pet';
        if (apt.petId) {
          const pet = await db.collection('pets').findOne({ _id: new ObjectId(apt.petId) });
          if (pet) {
            petInfo = `${pet.name} (Owner: ${pet.ownerId})`;
          } else {
            petInfo = `Pet ID ${apt.petId} (NOT FOUND)`;
          }
        }
        console.log(`     - ${apt.type || 'Unknown type'} for ${petInfo}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

findUsersWithAppointments();
