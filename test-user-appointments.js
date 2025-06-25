import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testUserAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Find user by email
    const user = await db.collection('users').findOne({ email: 'user1@example.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Found user:', user.name, 'ID:', user._id);
    
    // Find appointments for this user
    const appointments = await db.collection('appointments').find({ customerId: user._id }).toArray();
    console.log(`\n📅 Found ${appointments.length} appointments for this user`);
    
    if (appointments.length > 0) {
      console.log('\n=== FIRST APPOINTMENT STRUCTURE ===');
      const firstApt = appointments[0];
      Object.keys(firstApt).forEach(key => {
        const value = firstApt[key];
        const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
        console.log(`  ${key}: ${type}`);
        if (Array.isArray(value) && value.length > 0) {
          console.log(`    First item: ${JSON.stringify(value[0])}`);
        }
      });
      
      // Check if appointments are populated with vet/pet data
      if (firstApt.vetId) {
        console.log('\n=== VET DATA IN APPOINTMENT ===');
        const vetData = await db.collection('veterinarians').findOne({ _id: firstApt.vetId });
        if (vetData) {
          console.log('Vet specializations:', vetData.specializations);
          console.log('Is specializations array?', Array.isArray(vetData.specializations));
        }
      }
      
      if (firstApt.petId) {
        console.log('\n=== PET DATA IN APPOINTMENT ===');
        const petData = await db.collection('pets').findOne({ _id: firstApt.petId });
        if (petData) {
          console.log('Pet allergies:', petData.allergies);
          console.log('Is allergies array?', Array.isArray(petData.allergies));
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUserAppointments();
