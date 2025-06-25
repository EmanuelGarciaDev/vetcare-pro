import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUserVetConsistency() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all users with role 'Vet'
    const vetUsers = await db.collection('users').find({ role: 'Vet' }).toArray();
    console.log(`\n=== USERS WITH VET ROLE ===`);
    console.log(`Found ${vetUsers.length} users with 'Vet' role`);
    
    for (const user of vetUsers.slice(0, 3)) {
      console.log(`User: ${user.name} (${user.email}) - Role: ${user.role}`);
      
      // Check if this user has a corresponding veterinarian record
      const vetRecord = await db.collection('veterinarians').findOne({ userId: user._id });
      if (vetRecord) {
        console.log(`  ✅ Has veterinarian record: License ${vetRecord.licenseNumber}`);
      } else {
        console.log(`  ❌ No veterinarian record found`);
      }
    }
    
    // Get all veterinarians and check their user records
    const veterinarians = await db.collection('veterinarians').find({}).toArray();
    console.log(`\n=== VETERINARIANS ===`);
    console.log(`Found ${veterinarians.length} veterinarian records`);
    
    for (const vet of veterinarians) {
      const user = await db.collection('users').findOne({ _id: vet.userId });
      if (user) {
        console.log(`Vet: License ${vet.licenseNumber} -> User: ${user.name} (${user.role})`);
        if (user.role !== 'Vet') {
          console.log(`  ⚠️  Role mismatch: User has role '${user.role}' but should be 'Vet'`);
        }
      } else {
        console.log(`Vet: License ${vet.licenseNumber} -> ❌ No user record found`);
      }
    }
    
    // Check appointments with vet references
    const appointments = await db.collection('appointments').find({}).limit(5).toArray();
    console.log(`\n=== APPOINTMENT VET REFERENCES ===`);
    
    for (const apt of appointments) {
      console.log(`Appointment ${apt._id}:`);
      console.log(`  vetId: ${apt.vetId}`);
      console.log(`  veterinarianId: ${apt.veterinarianId}`);
      
      if (apt.vetId) {
        const vetRecord = await db.collection('veterinarians').findOne({ _id: new mongoose.Types.ObjectId(apt.vetId) });
        if (vetRecord) {
          console.log(`  ✅ Valid vet reference: License ${vetRecord.licenseNumber}`);
        } else {
          console.log(`  ❌ Vet record not found`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUserVetConsistency();
