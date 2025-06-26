const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  const user2Id = '684be9bc062e86bae005a46b';
  console.log('🔍 Testing pets query for user2 ID:', user2Id);
  
  // Test the exact query that the pets API should be using
  const pets = await db.collection('pets').find({ 
    ownerId: new ObjectId(user2Id)
  }).toArray();
  
  console.log('🐾 Found pets:', pets.length);
  pets.forEach(pet => {
    console.log(`  - ${pet.name} (${pet.species}) - ownerId: ${pet.ownerId}`);
  });
  
  // Now check if user2 session would be different
  console.log('\n🔍 Checking if token.sub differs from actual user ID...');
  const user2 = await db.collection('users').findOne({ email: 'user2@example.com' });
  console.log('User2 DB ID:', user2._id.toString());
  console.log('Expected session ID should be:', user2._id.toString());
  
  await client.close();
})().catch(console.error);
