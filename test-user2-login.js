const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  console.log('🔐 Testing user2 login credentials...');
  
  const user2 = await db.collection('users').findOne({ email: 'user2@example.com' });
  if (!user2) {
    console.log('❌ User2 not found');
    await client.close();
    return;
  }
  
  console.log('👤 User2 found:', { _id: user2._id, email: user2.email });
  
  // Test password
  const isValidPassword = await bcrypt.compare('password123', user2.password);
  console.log('🔑 Password valid:', isValidPassword);
  
  // Check pets for this user
  console.log('\n🐾 Checking pets for user2...');
  const pets = await db.collection('pets').find({ ownerId: user2._id }).toArray();
  console.log(`📊 Found ${pets.length} pets:`);
  pets.forEach(pet => {
    console.log(`  - ${pet.name} (${pet.species})`);
  });
  
  await client.close();
})().catch(console.error);
