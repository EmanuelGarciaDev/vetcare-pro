const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  const user2Id = '684be9bc062e86bae005a46b';
  console.log('🔍 Testing pets API query for user2 ID:', user2Id);
  
  const pets = await db.collection('pets').find({ 
    $or: [
      { ownerId: user2Id },
      { customerId: user2Id }
    ]
  }).toArray();
  
  console.log('🐾 Found pets:', pets.length);
  pets.forEach(pet => {
    console.log('  -', pet.name, pet.species, 'owner fields:', {
      ownerId: pet.ownerId ? pet.ownerId.toString() : undefined,
      customerId: pet.customerId ? pet.customerId.toString() : undefined,
    });
  });
  
  await client.close();
})().catch(console.error);
