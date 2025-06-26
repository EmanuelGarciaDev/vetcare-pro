const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  console.log('👥 All users in database:');
  const users = await db.collection('users').find({}).toArray();
  users.forEach(user => {
    console.log('  -', user.email, '(ID:', user._id.toString() + ')');
  });
  
  console.log('\n🐾 All pets in database:');
  const pets = await db.collection('pets').find({}).toArray();
  pets.forEach(pet => {
    console.log('  -', pet.name, pet.species, 'owner fields:', {
      ownerId: pet.ownerId,
      customerId: pet.customerId,
      userId: pet.userId
    });
  });
  
  await client.close();
})().catch(console.error);
