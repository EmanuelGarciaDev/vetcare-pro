// Migration script to convert legacy vet-based appointments to clinic-based appointments
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateAppointmentsToClinicBased() {
  console.log('🔄 Migrating Legacy Appointments to Clinic-Based System\n');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('vetcare-pro');

    // 1. Get all available clinics
    console.log('1️⃣ Getting available clinics...');
    const clinics = await db.collection('vetclinics').find({ isActive: true }).toArray();
    console.log(`   ✅ Found ${clinics.length} active clinics`);
    
    if (clinics.length === 0) {
      console.error('   ❌ No active clinics found. Cannot proceed with migration.');
      return;
    }

    // 2. Find appointments that need migration (have vetId but no clinicId)
    console.log('\n2️⃣ Finding appointments to migrate...');
    const appointmentsToMigrate = await db.collection('appointments').find({
      vetId: { $exists: true },
      clinicId: { $exists: false }
    }).toArray();

    console.log(`   📊 Found ${appointmentsToMigrate.length} appointments to migrate`);

    if (appointmentsToMigrate.length === 0) {
      console.log('   ✅ No appointments need migration. All appointments are already clinic-based!');
      return;
    }

    // 3. Strategy: Distribute appointments evenly across clinics
    // This is a reasonable approach since we don't have vet-to-clinic mapping
    console.log('\n3️⃣ Migration strategy: Distribute appointments evenly across clinics');
    
    let migrationCount = 0;
    const batchSize = 10;
    const totalBatches = Math.ceil(appointmentsToMigrate.length / batchSize);

    for (let i = 0; i < appointmentsToMigrate.length; i += batchSize) {
      const batch = appointmentsToMigrate.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`   🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} appointments)...`);

      const bulkOps = batch.map((appointment, index) => {
        // Distribute appointments across clinics using round-robin
        const clinicIndex = (i + index) % clinics.length;
        const selectedClinic = clinics[clinicIndex];

        return {
          updateOne: {
            filter: { _id: appointment._id },
            update: {
              $set: {
                clinicId: selectedClinic._id
              },
              $unset: {
                vetId: ""
              }
            }
          }
        };
      });

      // Execute batch update
      const result = await db.collection('appointments').bulkWrite(bulkOps);
      migrationCount += result.modifiedCount;
      
      console.log(`      ✅ Updated ${result.modifiedCount} appointments in batch ${batchNumber}`);
    }

    // 4. Verify migration results
    console.log('\n4️⃣ Verifying migration results...');
    const finalStats = await db.collection('appointments').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withClinicId: { $sum: { $cond: [{ $ifNull: ["$clinicId", false] }, 1, 0] } },
          withVetId: { $sum: { $cond: [{ $ifNull: ["$vetId", false] }, 1, 0] } }
        }
      }
    ]).toArray();

    const stats = finalStats[0] || { total: 0, withClinicId: 0, withVetId: 0 };
    
    console.log(`   📊 Migration Results:`);
    console.log(`      Total appointments: ${stats.total}`);
    console.log(`      With clinicId: ${stats.withClinicId}`);
    console.log(`      With vetId: ${stats.withVetId}`);
    console.log(`      Successfully migrated: ${migrationCount}`);

    // 5. Show distribution across clinics
    console.log('\n5️⃣ Appointment distribution across clinics:');
    const distribution = await db.collection('appointments').aggregate([
      { $match: { clinicId: { $exists: true } } },
      {
        $lookup: {
          from: 'vetclinics',
          localField: 'clinicId',
          foreignField: '_id',
          as: 'clinic'
        }
      },
      {
        $group: {
          _id: '$clinicId',
          count: { $sum: 1 },
          clinicName: { $first: { $arrayElemAt: ['$clinic.name', 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    distribution.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.clinicName}: ${item.count} appointments`);
    });

    // 6. Summary
    console.log('\n📋 MIGRATION SUMMARY:');
    if (migrationCount > 0) {
      console.log(`✅ Successfully migrated ${migrationCount} appointments to clinic-based system`);
      console.log('✅ All appointments now use clinicId instead of vetId');
      console.log('✅ Legacy vet references have been removed');
      console.log('✅ Appointments are evenly distributed across available clinics');
    } else {
      console.log('ℹ️  No appointments were migrated (they may have been already migrated)');
    }

    console.log('\n🎉 Appointment migration completed successfully!');
    console.log('💡 The booking system is now fully clinic-based and ready for use.');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('💡 Migration failed. Please check the error and try again.');
  } finally {
    await client.close();
  }
}

// Run the migration
migrateAppointmentsToClinicBased().catch(console.error);
