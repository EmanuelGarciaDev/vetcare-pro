const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function quickTest() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB Atlas connection successful!');
    
    const db = client.db('vetcare-pro');
    const vetCount = await db.collection('veterinarians').countDocuments();
    console.log(`Found ${vetCount} veterinarians in database`);
    
    await client.close();
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

quickTest();
