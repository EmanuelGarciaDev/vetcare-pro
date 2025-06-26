const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  console.log('🔧 Fixing pets data structure...');
  
  // Get all pets
  const pets = await db.collection('pets').find({}).toArray();
  console.log(`📊 Found ${pets.length} pets to process`);
  
  for (const pet of pets) {
    const updates = {};
    let needsUpdate = false;
    
    // Ensure ownerId is set (prioritize ownerId, then customerId, then userId)
    if (!pet.ownerId) {
      if (pet.customerId) {
        updates.ownerId = pet.customerId;
        needsUpdate = true;
        console.log(`🔄 Setting ownerId from customerId for pet: ${pet.name}`);
      } else if (pet.userId) {
        updates.ownerId = pet.userId;
        needsUpdate = true;
        console.log(`🔄 Setting ownerId from userId for pet: ${pet.name}`);
      }
    }
    
    // Remove deprecated fields
    const fieldsToRemove = {};
    if (pet.customerId) {
      fieldsToRemove.customerId = "";
      needsUpdate = true;
      console.log(`🗑️ Removing customerId from pet: ${pet.name}`);
    }
    if (pet.userId) {
      fieldsToRemove.userId = "";
      needsUpdate = true;
      console.log(`🗑️ Removing userId from pet: ${pet.name}`);
    }
    
    // Apply updates
    if (needsUpdate) {
      const updateDoc = {};
      if (Object.keys(updates).length > 0) {
        updateDoc.$set = updates;
      }
      if (Object.keys(fieldsToRemove).length > 0) {
        updateDoc.$unset = fieldsToRemove;
      }
      
      await db.collection('pets').updateOne(
        { _id: pet._id },
        updateDoc
      );
      console.log(`✅ Updated pet: ${pet.name}`);
    }
  }
  
  // Show final state
  console.log('\n📋 Final pets structure:');
  const updatedPets = await db.collection('pets').find({}).toArray();
  updatedPets.forEach(pet => {
    console.log(`  - ${pet.name} (${pet.species}): ownerId=${pet.ownerId}`);
  });
  
  await client.close();
  console.log('✅ Pets structure cleanup complete!');
})().catch(console.error);
