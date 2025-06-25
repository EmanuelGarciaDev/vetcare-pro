const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanupDuplicateCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📋 All Collections:');
    collections.forEach(col => {
      console.log('- ' + col.name);
    });
    
    // Check for vet clinic collections
    const vetClinicCollections = collections.filter(col => 
      col.name.toLowerCase().includes('clinic')
    );
    
    console.log('\n🏥 Vet Clinic Collections Found:');
    for (const col of vetClinicCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(col.name).findOne();
        console.log(`  Sample document keys: ${Object.keys(sample || {}).join(', ')}`);
      }
    }
    
    // Check which one to keep based on data
    if (vetClinicCollections.length > 1) {
      console.log('\n⚠️  Multiple vet clinic collections found!');
      console.log('Please review the data above to decide which collection to keep.');
      
      // Check if one is empty
      const emptyCollections = [];
      const populatedCollections = [];
      
      for (const col of vetClinicCollections) {
        const count = await db.collection(col.name).countDocuments();
        if (count === 0) {
          emptyCollections.push(col.name);
        } else {
          populatedCollections.push({ name: col.name, count });
        }
      }
      
      if (emptyCollections.length > 0) {
        console.log('\n🗑️  Empty collections that can be dropped:');
        for (const colName of emptyCollections) {
          console.log(`- ${colName}`);
          await db.collection(colName).drop();
          console.log(`  ✅ Dropped ${colName}`);
        }
      }
      
      if (populatedCollections.length > 1) {
        console.log('\n📊 Populated collections (manual review needed):');
        populatedCollections.forEach(col => {
          console.log(`- ${col.name}: ${col.count} documents`);
        });
      }
    }
    
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

cleanupDuplicateCollections();
