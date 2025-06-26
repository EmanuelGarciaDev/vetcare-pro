const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function debugVeterinarians() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== Debugging Veterinarians ===');
    
    const vets = await db.collection('veterinarians').find({}).toArray();
    console.log(`Found ${vets.length} veterinarians:`);
    
    vets.forEach((vet, index) => {
      console.log(`\n${index + 1}. Veterinarian:`);
      console.log(`   _id: ${vet._id} (type: ${typeof vet._id})`);
      console.log(`   isAvailable: ${vet.isAvailable}`);
      console.log(`   consultationFee: ${vet.consultationFee}`);
      console.log(`   userId: ${vet.userId} (type: ${typeof vet.userId})`);
      
      if (vet.userId) {
        // Check if the user exists
        console.log(`   Checking user...`);
      }
    });
    
    // Also check if any vets have undefined _id
    const invalidVets = vets.filter(vet => !vet._id);
    if (invalidVets.length > 0) {
      console.log(`\n❌ Found ${invalidVets.length} veterinarians with undefined _id`);
    }
    
    // Check available vets specifically
    const availableVets = vets.filter(vet => vet.isAvailable);
    console.log(`\n✅ Available veterinarians: ${availableVets.length}`);
    availableVets.forEach((vet, index) => {
      console.log(`   ${index + 1}. ID: ${vet._id}, Fee: ${vet.consultationFee}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugVeterinarians();
