const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

async function checkExistingClinics() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== EXISTING CLINICS ===');
    
    const clinics = await db.collection('vetclinics').find({}).toArray();
    console.log(`Found ${clinics.length} clinics:`);
    
    clinics.forEach((clinic, i) => {
      console.log(`\n${i+1}. ${clinic.name}`);
      console.log(`   Address: ${clinic.address?.street || 'N/A'}, ${clinic.address?.city || 'N/A'}`);
      console.log(`   Phone: ${clinic.phone || 'N/A'}`);
      console.log(`   Services: ${clinic.services?.length || 0} services`);
      console.log(`   Active: ${clinic.isActive}`);
      console.log(`   Emergency 24h: ${clinic.isEmergency24h}`);
      
      if (clinic.hours) {
        console.log(`   Hours: ${clinic.hours.monday?.open || 'N/A'} - ${clinic.hours.monday?.close || 'N/A'}`);
      }
      
      if (clinic.pricing) {
        console.log(`   Consultation: $${clinic.pricing.consultation || 'N/A'}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkExistingClinics();
