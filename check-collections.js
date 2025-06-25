import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n=== ALL COLLECTIONS ===');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check for duplicate vet collections
    const vetCollections = collections.filter(col => 
      col.name.toLowerCase().includes('vet') || 
      col.name.toLowerCase().includes('clinic')
    );
    
    console.log('\n=== VET/CLINIC COLLECTIONS ===');
    for (const col of vetCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(col.name).findOne();
        console.log(`  Sample doc keys: ${Object.keys(sample || {}).join(', ')}`);
      }
    }
    
    // Check users vs veterinarians
    const usersCount = await db.collection('users').countDocuments();
    const veterinariansCount = await db.collection('veterinarians').countDocuments();
    
    console.log('\n=== USER COLLECTIONS ===');
    console.log(`users: ${usersCount} documents`);
    console.log(`veterinarians: ${veterinariansCount} documents`);
    
    // Check for role mismatches
    const veterinarianRoleUsers = await db.collection('users').countDocuments({ role: 'veterinarian' });
    const userRoleVets = await db.collection('veterinarians').countDocuments({ role: 'user' });
    
    console.log('\n=== ROLE MISMATCHES ===');
    console.log(`Users with veterinarian role: ${veterinarianRoleUsers}`);
    console.log(`Veterinarians with user role: ${userRoleVets}`);
    
    // Check appointments reference consistency
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`\n=== APPOINTMENTS ===`);
    console.log(`Total appointments: ${appointments.length}`);
    
    if (appointments.length > 0) {
      const vetIdFields = appointments.map(apt => ({
        id: apt._id,
        veterinarianId: apt.veterinarianId,
        vetId: apt.vetId
      }));
      
      console.log('Vet ID fields in appointments:');
      vetIdFields.slice(0, 3).forEach(apt => {
        console.log(`  ${apt.id}: veterinarianId=${apt.veterinarianId}, vetId=${apt.vetId}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkCollections();
