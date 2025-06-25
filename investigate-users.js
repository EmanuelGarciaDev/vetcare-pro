const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function investigateUserCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    console.log('\n🔍 INVESTIGATING USER/VETERINARIAN COLLECTIONS...\n');
    
    // 1. Check Users collection
    console.log('👥 USERS COLLECTION:');
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    const usersByRole = {};
    users.forEach(user => {
      const role = user.role || 'no-role';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });
    
    console.log('Roles breakdown:');
    Object.keys(usersByRole).forEach(role => {
      console.log(`  - ${role}: ${usersByRole[role]}`);
    });
    
    // Show sample users with different roles
    console.log('\nSample users by role:');
    const vetUsers = users.filter(u => u.role === 'vet' || u.role === 'veterinarian' || u.role === 'Veterinarian');
    const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'Admin');
    const customerUsers = users.filter(u => u.role === 'customer' || u.role === 'Customer' || !u.role);
    
    console.log(`\n🩺 VET-ROLE USERS (${vetUsers.length}):`);
    vetUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: "${user.role}"`);
    });
    
    console.log(`\n👨‍⚕️ ADMIN USERS (${adminUsers.length}):`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: "${user.role}"`);
    });
    
    console.log(`\n🐕 CUSTOMER USERS (${customerUsers.length}):`);
    customerUsers.slice(0, 3).forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: "${user.role || 'undefined'}"`);
    });
    
    // 2. Check Veterinarians collection
    console.log('\n👨‍⚕️ VETERINARIANS COLLECTION:');
    const veterinarians = await db.collection('veterinarians').find({}).toArray();
    console.log(`Total veterinarians: ${veterinarians.length}`);
    
    console.log('\nVeterinarians details:');
    veterinarians.forEach(vet => {
      console.log(`  - License: ${vet.licenseNumber}`);
      console.log(`    User: ${vet.userId?.name || 'N/A'} (${vet.userId?.email || 'N/A'})`);
      console.log(`    Specializations: ${vet.specializations?.join(', ') || 'None'}`);
      console.log(`    Fee: $${vet.consultationFee || 0}`);
      console.log('');
    });
    
    // 3. Check for orphaned data
    console.log('🔗 CHECKING DATA RELATIONSHIPS:');
    
    // Check if vet users have corresponding veterinarian records
    const vetUserIds = vetUsers.map(u => u._id.toString());
    const vetRecordUserIds = veterinarians.map(v => v.userId?._id?.toString() || v.userId?.toString()).filter(Boolean);
    
    console.log('\nVet users without veterinarian records:');
    const orphanedVetUsers = vetUserIds.filter(id => !vetRecordUserIds.includes(id));
    orphanedVetUsers.forEach(id => {
      const user = users.find(u => u._id.toString() === id);
      console.log(`  - ${user.name} (${user.email})`);
    });
    
    console.log('\nVeterinarian records without valid user references:');
    const orphanedVetRecords = veterinarians.filter(v => {
      const userId = v.userId?._id?.toString() || v.userId?.toString();
      return !userId || !users.find(u => u._id.toString() === userId);
    });
    orphanedVetRecords.forEach(vet => {
      console.log(`  - License: ${vet.licenseNumber} (User ID: ${vet.userId})`);
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`- Users with role issues: ${vetUsers.length} vets in users collection`);
    console.log(`- Veterinarian records: ${veterinarians.length}`);
    console.log(`- Orphaned vet users: ${orphanedVetUsers.length}`);
    console.log(`- Orphaned vet records: ${orphanedVetRecords.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

investigateUserCollections();
