import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugDashboardData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get sample data that the dashboard would fetch
    console.log('\n=== SAMPLE PET DATA ===');
    const samplePet = await db.collection('pets').findOne();
    if (samplePet) {
      console.log('Pet structure:');
      Object.keys(samplePet).forEach(key => {
        const value = samplePet[key];
        const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
        console.log(`  ${key}: ${type} - ${Array.isArray(value) ? JSON.stringify(value) : value}`);
      });
    }
    
    console.log('\n=== SAMPLE APPOINTMENT DATA ===');
    const sampleAppointment = await db.collection('appointments').findOne();
    if (sampleAppointment) {
      console.log('Appointment structure:');
      Object.keys(sampleAppointment).forEach(key => {
        const value = sampleAppointment[key];
        const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
        console.log(`  ${key}: ${type} - ${Array.isArray(value) ? JSON.stringify(value) : value}`);
      });
    }
    
    console.log('\n=== SAMPLE VETERINARIAN DATA ===');
    const sampleVet = await db.collection('veterinarians').findOne();
    if (sampleVet) {
      console.log('Veterinarian structure:');
      Object.keys(sampleVet).forEach(key => {
        const value = sampleVet[key];
        const type = Array.isArray(value) ? `Array[${value.length}]` : typeof value;
        console.log(`  ${key}: ${type} - ${Array.isArray(value) ? JSON.stringify(value) : value}`);
      });
    }
    
    // Check for any unexpected array fields
    console.log('\n=== CHECKING FOR PROBLEMATIC ARRAYS ===');
    
    const pets = await db.collection('pets').find({}).limit(3).toArray();
    pets.forEach((pet, index) => {
      Object.keys(pet).forEach(key => {
        if (Array.isArray(pet[key]) && key !== 'allergies') {
          console.log(`⚠️  Pet ${index}: ${key} is unexpectedly an array:`, pet[key]);
        }
      });
    });
    
    const appointments = await db.collection('appointments').find({}).limit(3).toArray();
    appointments.forEach((apt, index) => {
      Object.keys(apt).forEach(key => {
        if (Array.isArray(apt[key])) {
          console.log(`⚠️  Appointment ${index}: ${key} is unexpectedly an array:`, apt[key]);
        }
      });
    });
    
    const vets = await db.collection('veterinarians').find({}).limit(3).toArray();
    vets.forEach((vet, index) => {
      Object.keys(vet).forEach(key => {
        if (Array.isArray(vet[key]) && key !== 'specializations' && key !== 'qualifications') {
          console.log(`⚠️  Veterinarian ${index}: ${key} is unexpectedly an array:`, vet[key]);
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugDashboardData();
