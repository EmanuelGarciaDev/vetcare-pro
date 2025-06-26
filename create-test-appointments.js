const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function createTestAppointments() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Creating Test Appointments ===');
    
    // Find John Smith
    const johnSmith = await db.collection('users').findOne({ email: 'john.smith@email.com' });
    if (!johnSmith) {
      console.log('❌ John Smith not found');
      return;
    }
    
    // Find his pets
    const johnsPets = await db.collection('pets').find({ ownerId: new ObjectId(johnSmith._id) }).toArray();
    console.log(`✅ Found ${johnsPets.length} pets for John Smith`);
    
    // Find a vet
    const vet = await db.collection('veterinarians').findOne({ isAvailable: true });
    if (!vet) {
      console.log('❌ No available vet found');
      return;
    }
    console.log(`✅ Found vet: ${vet._id}`);
    
    // Create appointment for John's pet
    if (johnsPets.length > 0) {
      const appointment1 = {
        customerId: johnSmith._id.toString(),
        vetId: new ObjectId(vet._id),
        petId: johnsPets[0]._id.toString(),
        appointmentDate: new Date('2024-12-30T10:00:00'),
        startTime: '10:00',
        endTime: '11:00',
        type: 'Consultation',
        reason: 'Regular checkup',
        notes: 'Test appointment',
        status: 'Scheduled',
        totalAmount: vet.consultationFee,
        paymentStatus: 'Pending'
      };
      
      const result1 = await db.collection('appointments').insertOne(appointment1);
      console.log(`✅ Created appointment for ${johnsPets[0].name}: ${result1.insertedId}`);
    }
    
    // Create appointment for a pet that John DOESN'T own (simulate the bug)
    const otherPet = await db.collection('pets').findOne({ 
      ownerId: { $ne: new ObjectId(johnSmith._id) } 
    });
    
    if (otherPet) {
      const appointment2 = {
        customerId: johnSmith._id.toString(),
        vetId: new ObjectId(vet._id),
        petId: otherPet._id.toString(),
        appointmentDate: new Date('2024-12-31T14:00:00'),
        startTime: '14:00',
        endTime: '15:00',
        type: 'Emergency',
        reason: 'Test appointment for wrong pet',
        notes: 'This should be filtered out by our fix',
        status: 'Scheduled',
        totalAmount: vet.consultationFee,
        paymentStatus: 'Pending'
      };
      
      const result2 = await db.collection('appointments').insertOne(appointment2);
      console.log(`✅ Created appointment for ${otherPet.name} (NOT John's pet): ${result2.insertedId}`);
      console.log(`   This appointment should be filtered out by our API fix`);
    }
    
    console.log('\n🎯 Test appointments created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestAppointments();
