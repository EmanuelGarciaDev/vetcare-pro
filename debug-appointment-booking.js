/**
 * Debug Script: Check Appointment Data Structure
 * This script helps debug the appointment booking issues
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function debugAppointments() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('vetcare-pro');
    
    // Check appointments collection
    console.log('\n📅 APPOINTMENTS COLLECTION:');
    const appointments = await db.collection('appointments').find({}).limit(3).toArray();
    console.log(`Found ${appointments.length} appointments (showing first 3):`);
    appointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. Appointment ID: ${apt._id}`);
      console.log(`   - Status: ${apt.status}`);
      console.log(`   - Type: ${apt.type || 'NOT SET'}`);
      console.log(`   - Date: ${apt.appointmentDate}`);
      console.log(`   - Start Time: ${apt.startTime || 'NOT SET'}`);
      console.log(`   - End Time: ${apt.endTime || 'NOT SET'}`);
      console.log(`   - Customer ID: ${apt.customerId || apt.userId || 'NOT SET'}`);
      console.log(`   - Vet ID: ${apt.vetId}`);
      console.log(`   - Pet ID: ${apt.petId || 'NOT SET'}`);
      console.log(`   - Reason: ${apt.reason}`);
    });
    
    // Check veterinarians collection
    console.log('\n👨‍⚕️ VETERINARIANS COLLECTION:');
    const vets = await db.collection('veterinarians').find({}).limit(2).toArray();
    console.log(`Found ${vets.length} veterinarians (showing first 2):`);
    vets.forEach((vet, index) => {
      console.log(`\n${index + 1}. Vet ID: ${vet._id}`);
      console.log(`   - Available: ${vet.isAvailable}`);
      console.log(`   - License: ${vet.licenseNumber}`);
      console.log(`   - Fee: $${vet.consultationFee}`);
      console.log(`   - User ID: ${vet.userId}`);
    });
    
    // Check pets collection
    console.log('\n🐾 PETS COLLECTION:');
    const pets = await db.collection('pets').find({}).limit(2).toArray();
    console.log(`Found ${pets.length} pets (showing first 2):`);
    pets.forEach((pet, index) => {
      console.log(`\n${index + 1}. Pet ID: ${pet._id}`);
      console.log(`   - Name: ${pet.name}`);
      console.log(`   - Species: ${pet.species}`);
      console.log(`   - Owner ID: ${pet.customerId || pet.userId || 'NOT SET'}`);
    });
    
    // Check users collection
    console.log('\n👥 USERS COLLECTION:');
    const users = await db.collection('users').find({}).limit(2).toArray();
    console.log(`Found ${users.length} users (showing first 2):`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user._id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Provide sample data for testing
function provideSampleIds() {
  console.log('\n🎯 SAMPLE TEST DATA:');
  console.log('Use these IDs for testing appointment booking:');
  console.log(`
// Sample appointment booking request:
{
  "vetId": "USE_REAL_VET_ID_FROM_ABOVE",
  "petId": "USE_REAL_PET_ID_FROM_ABOVE", 
  "appointmentDate": "2025-06-26",
  "startTime": "10:00",
  "endTime": "11:00",
  "type": "Consultation",
  "reason": "Regular checkup"
}
  `);
}

async function main() {
  console.log('🔍 APPOINTMENT BOOKING DEBUG TOOL');
  console.log('=' .repeat(50));
  
  await debugAppointments();
  provideSampleIds();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Debug complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugAppointments };
