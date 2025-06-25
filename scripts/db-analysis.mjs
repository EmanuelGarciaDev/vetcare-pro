import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function analyzeCollections() {
  console.log('🔍 DATABASE ARCHITECTURE CLEANUP - ANALYSIS');
  console.log('============================================');
  
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    // Get database statistics
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 COLLECTION OVERVIEW:');
    console.log('=======================');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const stats = await db.collection(collectionName).stats();
      const count = await db.collection(collectionName).countDocuments();
      
      console.log(`📚 ${collectionName}:`);
      console.log(`   📄 Documents: ${count}`);
      console.log(`   💾 Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📋 Indexes: ${stats.nindexes}`);
      console.log('');
    }
    
    // Basic data integrity checks
    console.log('🔍 BASIC DATA INTEGRITY CHECKS:');
    console.log('===============================');
    
    // Check users collection
    if (collections.find(c => c.name === 'users')) {
      const usersCol = db.collection('users');
      const totalUsers = await usersCol.countDocuments();
      const customerUsers = await usersCol.countDocuments({ role: 'Customer' });
      const vetUsers = await usersCol.countDocuments({ role: 'Vet' });
      const adminUsers = await usersCol.countDocuments({ role: 'Admin' });
      
      console.log(`👥 Users breakdown:`);
      console.log(`   Total: ${totalUsers}`);
      console.log(`   Customers: ${customerUsers}`);
      console.log(`   Veterinarians: ${vetUsers}`);
      console.log(`   Administrators: ${adminUsers}`);
      console.log('');
    }
    
    // Check pets collection
    if (collections.find(c => c.name === 'pets')) {
      const petsCol = db.collection('pets');
      const totalPets = await petsCol.countDocuments();
      const species = await petsCol.distinct('species');
      
      console.log(`🐕 Pets overview:`);
      console.log(`   Total pets: ${totalPets}`);
      console.log(`   Species: ${species.join(', ')}`);
      console.log('');
    }
    
    // Check appointments collection
    if (collections.find(c => c.name === 'appointments')) {
      const appointmentsCol = db.collection('appointments');
      const totalAppointments = await appointmentsCol.countDocuments();
      const statuses = await appointmentsCol.distinct('status');
      const futureAppointments = await appointmentsCol.countDocuments({
        appointmentDate: { $gte: new Date() }
      });
      
      console.log(`📅 Appointments overview:`);
      console.log(`   Total appointments: ${totalAppointments}`);
      console.log(`   Future appointments: ${futureAppointments}`);
      console.log(`   Statuses: ${statuses.join(', ')}`);
      console.log('');
    }
    
    // Check veterinarians collection
    if (collections.find(c => c.name === 'veterinarians')) {
      const vetsCol = db.collection('veterinarians');
      const totalVets = await vetsCol.countDocuments();
      const availableVets = await vetsCol.countDocuments({ isAvailable: true });
      
      console.log(`👨‍⚕️ Veterinarians overview:`);
      console.log(`   Total veterinarians: ${totalVets}`);
      console.log(`   Available veterinarians: ${availableVets}`);
      console.log('');
    }
    
    console.log('✅ DATABASE ANALYSIS COMPLETE');
    console.log('Ready for detailed cleanup operations...');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

// Run the analysis
analyzeCollections();
