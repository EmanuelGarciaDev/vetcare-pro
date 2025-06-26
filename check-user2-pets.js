const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcarepro');
  
  console.log('🔍 Looking for user2...');
  const user2 = await db.collection('users').findOne({ email: 'user2@example.com' });
  console.log('👤 User2:', user2 ? { _id: user2._id, email: user2.email } : 'Not found');
  
  if (user2) {
    console.log('🐾 Looking for pets for user2...');
    const pets = await db.collection('pets').find({
      $or: [
        { ownerId: user2._id.toString() },
        { customerId: user2._id.toString() },
        { userId: user2._id.toString() }
      ]
    }).toArray();
    console.log('🐾 Pets for user2:', pets.length);
    pets.forEach(pet => {
      console.log('  -', pet.name, pet.species, 'owner fields:', {
        ownerId: pet.ownerId,
        customerId: pet.customerId,
        userId: pet.userId
      });
    });
  }
  
  await client.close();
})().catch(console.error);
