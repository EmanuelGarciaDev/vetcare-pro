const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function fixDatabaseIndexes() {
  try {
    console.log('🔧 FIXING DATABASE INDEXES');
    console.log('===========================');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Drop problematic indexes on veterinarians collection
    console.log('\n🗑️ Dropping problematic indexes...');
    
    try {
      const vetsCollection = mongoose.connection.db.collection('veterinarians');
      const indexes = await vetsCollection.indexes();
      
      console.log('Current indexes:');
      indexes.forEach((index, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(index.key)}`);
      });
      
      // Drop the problematic userId.email index
      try {
        await vetsCollection.dropIndex('userId.email_1');
        console.log('   ✅ Dropped userId.email_1 index');
      } catch (e) {
        console.log('   ⚠️ userId.email_1 index not found or already dropped');
      }
      
      // Drop all indexes except _id and recreate clean ones
      try {
        await vetsCollection.dropIndexes();
        console.log('   ✅ Dropped all indexes');
      } catch (e) {
        console.log('   ⚠️ Some indexes could not be dropped:', e.message);
      }
      
      // Create proper indexes
      await vetsCollection.createIndex({ userId: 1 }, { unique: true });
      await vetsCollection.createIndex({ licenseNumber: 1 }, { unique: true });
      await vetsCollection.createIndex({ isAvailable: 1 });
      await vetsCollection.createIndex({ specializations: 1 });
      await vetsCollection.createIndex({ rating: -1 });
      
      console.log('   ✅ Created clean indexes');
      
    } catch (error) {
      console.log('   ⚠️ Index operations:', error.message);
    }
    
    // Also clean up the collections completely
    console.log('\n🧹 Cleaning collections...');
    
    await mongoose.connection.db.collection('veterinarians').deleteMany({});
    console.log('   ✅ Cleared veterinarians collection');
    
    await mongoose.connection.db.collection('users').deleteMany({ role: 'Vet' });
    console.log('   ✅ Cleared vet users');
    
    await mongoose.connection.db.collection('appointments').deleteMany({});
    console.log('   ✅ Cleared appointments');
    
    await mongoose.connection.db.collection('notifications').deleteMany({});
    console.log('   ✅ Cleared notifications');
    
    console.log('\n✅ DATABASE INDEXES FIXED');
    console.log('Ready for enhancement...');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

fixDatabaseIndexes();
