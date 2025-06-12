const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function fixVetNames() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('vetcare-pro');
    const collection = db.collection('veterinarians');
    
    // Get all veterinarians
    const vets = await collection.find({}).toArray();
    
    for (const vet of vets) {
      // Remove "Dr. " prefix if it exists
      const cleanName = vet.userId.name.replace(/^Dr\.\s*/, '');
      
      await collection.updateOne(
        { _id: vet._id },
        { $set: { 'userId.name': cleanName } }
      );
      
      console.log(`Updated: ${vet.userId.name} -> ${cleanName}`);
    }
    
    console.log('✅ All names updated successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixVetNames();
