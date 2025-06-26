const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  const user2Id = '684be9bc062e86bae005a46b';
  console.log('🔍 Testing pets API query for user2 ID:', user2Id);
  
  // First, let's check what Pepino looks like
  const pepino = await db.collection('pets').findOne({ name: 'Pepino' });
  console.log('🐱 Pepino data:');
  console.log('  ownerId type:', typeof pepino.ownerId, 'value:', pepino.ownerId);
  console.log('  customerId type:', typeof pepino.customerId, 'value:', pepino.customerId);
  console.log('  user2Id type:', typeof user2Id, 'value:', user2Id);
  
  // Try different query approaches
  console.log('\n🔍 Query 1: String comparison');
  const pets1 = await db.collection('pets').find({ 
    $or: [
      { ownerId: user2Id },
      { customerId: user2Id }
    ]
  }).toArray();
  console.log('  Found:', pets1.length);
  
  console.log('\n🔍 Query 2: ObjectId comparison');
  const pets2 = await db.collection('pets').find({ 
    $or: [
      { ownerId: new ObjectId(user2Id) },
      { customerId: new ObjectId(user2Id) }
    ]
  }).toArray();
  console.log('  Found:', pets2.length);
  pets2.forEach(pet => {
    console.log('    -', pet.name, pet.species);
  });
  
  await client.close();
})().catch(console.error);
