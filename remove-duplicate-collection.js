const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function removeDuplicateCollection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check both collections exist
    const vetClinicsCount = await db.collection('vet-clinics').countDocuments();
    const vetclinicsCount = await db.collection('vetclinics').countDocuments();
    
    console.log(`vet-clinics: ${vetClinicsCount} documents`);
    console.log(`vetclinics: ${vetclinicsCount} documents`);
    
    if (vetClinicsCount > 0 && vetclinicsCount > 0) {
      console.log('\n🗑️  Removing "vet-clinics" collection (keeping "vetclinics")...');
      await db.collection('vet-clinics').drop();
      console.log('✅ Successfully removed "vet-clinics" collection');
      
      // Also remove the empty API directory
      console.log('📁 Note: You should also remove the empty src/app/api/vet-clinics directory');
    } else {
      console.log('⚠️  One of the collections is empty or doesn\'t exist');
    }
    
    // Verify cleanup
    const collections = await db.listCollections().toArray();
    const remainingVetCollections = collections.filter(col => 
      col.name.toLowerCase().includes('clinic')
    );
    
    console.log('\n📋 Remaining vet clinic collections:');
    for (const col of remainingVetCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

removeDuplicateCollection();
