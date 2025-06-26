const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://emanueldariodev:g4IVdYDjZ2xy24UI@clusteremadev.elt3l0r.mongodb.net/vetcare-pro';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vetcare-pro');
  
  const user2 = await db.collection('users').findOne({ email: 'user2@example.com' });
  console.log('👤 User2 data:');
  console.log('  ID:', user2._id.toString());
  console.log('  Email:', user2.email);
  console.log('  Has password:', !!user2.password);
  console.log('  Password hash:', user2.password ? user2.password.substring(0, 20) + '...' : 'None');
  
  await client.close();
})().catch(console.error);
