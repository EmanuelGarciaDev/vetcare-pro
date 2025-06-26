// Script: find-customer-user.js
// Purpose: Print a customer user (email & password if available) from the database

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'vetcare-pro';

async function findCustomerUser() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('users').findOne({ role: 'Customer' });
    if (!user) {
      console.log('❌ No customer user found.');
      return;
    }
    console.log('✅ Customer user found:');
    console.log(`Email:    ${user.email}`);
    if (user.password) {
      console.log(`Password: ${user.password}`);
    } else {
      console.log('Password: (not stored in plaintext, try using a test password or reset via the app)');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  findCustomerUser();
}
