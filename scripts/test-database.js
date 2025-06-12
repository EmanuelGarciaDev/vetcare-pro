const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function testDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('vetcare-pro');
    
    // Test veterinarians collection
    const vets = await db.collection('veterinarians').find({}).toArray();
    console.log(`\n📊 Found ${vets.length} veterinarians:`);
    
    for (const vet of vets) {
      console.log(`- ${vet.userId.name}`);
      console.log(`  Specializations: ${vet.specializations.join(', ')}`);
      console.log(`  Experience: ${vet.experience} years`);
      console.log(`  Rating: ${vet.rating}/5`);
      console.log(`  Consultation Fee: $${vet.consultationFee}`);
      console.log(`  Available: ${vet.isAvailable ? 'Yes' : 'No'}`);
      console.log('');
    }
    
    // Test appointments collection
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`📅 Found ${appointments.length} appointments`);
    
    // Test users collection
    const users = await db.collection('users').find({}).toArray();
    console.log(`👥 Found ${users.length} users`);
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await client.close();
  }
}

testDatabase();
