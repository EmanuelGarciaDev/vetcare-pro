const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Define models directly since we can't import TS models in CommonJS
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['Customer', 'Vet', 'Admin'], default: 'Customer' },
  phone: String,
  address: String,
  emailVerified: Date,
  image: String
}, { timestamps: true });

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: String,
  age: { type: Number, required: true },
  weight: Number,
  color: String,
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allergies: [String],
  notes: String,
  profileImage: String
}, { timestamps: true });

const VeterinarianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  specializations: [String],
  experience: { type: Number, required: true },
  qualifications: [String],
  consultationFee: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bio: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow'], default: 'Scheduled' },
  type: { type: String, enum: ['Consultation', 'Vaccination', 'Surgery', 'Emergency', 'Checkup', 'Grooming'], required: true },
  reason: { type: String, required: true },
  notes: String,
  diagnosis: String,
  treatment: String,
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Appointment', 'Reminder', 'System', 'Payment', 'Medical'], required: true },
  isRead: { type: Boolean, default: false },
  actionUrl: String
}, { timestamps: { createdAt: true, updatedAt: false } });

// Create models
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const PetModel = mongoose.models.Pet || mongoose.model('Pet', PetSchema);
const VeterinarianModel = mongoose.models.Veterinarian || mongoose.model('Veterinarian', VeterinarianSchema);
const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

async function analyzeDatabase() {
  try {
    console.log('🔍 DATABASE ARCHITECTURE CLEANUP - ANALYSIS PHASE');
    console.log('================================================');
    
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Get collection statistics
    console.log('\n📊 COLLECTION STATISTICS:');
    console.log('=========================');
    
    const userCount = await UserModel.countDocuments();
    const petCount = await PetModel.countDocuments();
    const vetCount = await VeterinarianModel.countDocuments();
    const appointmentCount = await AppointmentModel.countDocuments();
    const notificationCount = await NotificationModel.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🐕 Pets: ${petCount}`);
    console.log(`👨‍⚕️ Veterinarians: ${vetCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);
    
    // Analyze data integrity issues
    console.log('\n🔍 DATA INTEGRITY ANALYSIS:');
    console.log('============================');
    
    // Check for orphaned pets (pets without valid owners)
    const orphanedPets = await PetModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $match: {
          owner: { $size: 0 }
        }
      }
    ]);
    console.log(`🔗 Orphaned pets (no valid owner): ${orphanedPets.length}`);
    
    // Check for veterinarians without user accounts
    const orphanedVets = await VeterinarianModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          user: { $size: 0 }
        }
      }
    ]);
    console.log(`🔗 Orphaned veterinarians (no valid user): ${orphanedVets.length}`);
    
    // Check for appointments with invalid references
    const invalidAppointments = await AppointmentModel.aggregate([
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet'
        }
      },
      {
        $lookup: {
          from: 'veterinarians',
          localField: 'vetId',
          foreignField: '_id',
          as: 'vet'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $match: {
          $or: [
            { pet: { $size: 0 } },
            { vet: { $size: 0 } },
            { customer: { $size: 0 } }
          ]
        }
      }
    ]);
    console.log(`🔗 Invalid appointments (broken references): ${invalidAppointments.length}`);
    
    // Check for duplicate users by email
    const duplicateEmails = await UserModel.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);
    console.log(`📧 Duplicate email addresses: ${duplicateEmails.length}`);
    
    // Check for users with role 'Vet' but no veterinarian profile
    const vetsWithoutProfiles = await UserModel.aggregate([
      {
        $match: { role: 'Vet' }
      },
      {
        $lookup: {
          from: 'veterinarians',
          localField: '_id',
          foreignField: 'userId',
          as: 'vetProfile'
        }
      },
      {
        $match: {
          vetProfile: { $size: 0 }
        }
      }
    ]);
    console.log(`👨‍⚕️ Vet users without profiles: ${vetsWithoutProfiles.length}`);
    
    // Check for old/stale notifications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldNotifications = await NotificationModel.countDocuments({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });
    console.log(`🗑️ Old read notifications (>30 days): ${oldNotifications}`);
    
    // Index analysis
    console.log('\n📋 INDEX ANALYSIS:');
    console.log('==================');
    
    const collections = ['users', 'pets', 'veterinarians', 'appointments', 'notifications'];
    for (const collectionName of collections) {
      const indexes = await mongoose.connection.db.collection(collectionName).indexes();
      console.log(`📚 ${collectionName}: ${indexes.length} indexes`);
    }
    
    // Sample data analysis
    console.log('\n🔬 SAMPLE DATA ANALYSIS:');
    console.log('========================');
    
    // Check recent appointments
    const recentAppointments = await AppointmentModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vetId', 'licenseNumber')
      .populate('customerId', 'name email')
      .populate('petId', 'name species');
    
    console.log(`📅 Recent appointments: ${recentAppointments.length}`);
    recentAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt.type} - ${apt.status} (${apt.appointmentDate.toDateString()})`);
    });
    
    console.log('\n✅ DATABASE ANALYSIS COMPLETE');
    console.log('============================');
    console.log('Ready for cleanup operations...');
    
    return {
      stats: {
        users: userCount,
        pets: petCount,
        veterinarians: vetCount,
        appointments: appointmentCount,
        notifications: notificationCount
      },
      issues: {
        orphanedPets: orphanedPets.length,
        orphanedVets: orphanedVets.length,
        invalidAppointments: invalidAppointments.length,
        duplicateEmails: duplicateEmails.length,
        vetsWithoutProfiles: vetsWithoutProfiles.length,
        oldNotifications
      }
    };
    
  } catch (error) {
    console.error('❌ Database analysis failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

async function cleanDatabase() {
  try {
    console.log('🧹 DATABASE CLEANUP - EXECUTION PHASE');
    console.log('=====================================');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    let cleanupReport = {
      orphanedPetsRemoved: 0,
      orphanedVetsRemoved: 0,
      invalidAppointmentsRemoved: 0,
      oldNotificationsRemoved: 0,
      duplicateUsersResolved: 0
    };
    
    // 1. Remove orphaned pets
    console.log('\n🐕 Cleaning orphaned pets...');
    const orphanedPets = await PetModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $match: { owner: { $size: 0 } }
      }
    ]);
    
    if (orphanedPets.length > 0) {
      const orphanedPetIds = orphanedPets.map(pet => pet._id);
      await PetModel.deleteMany({ _id: { $in: orphanedPetIds } });
      cleanupReport.orphanedPetsRemoved = orphanedPets.length;
      console.log(`   ✅ Removed ${orphanedPets.length} orphaned pets`);
    } else {
      console.log('   ✅ No orphaned pets found');
    }
    
    // 2. Remove orphaned veterinarians
    console.log('\n👨‍⚕️ Cleaning orphaned veterinarians...');
    const orphanedVets = await VeterinarianModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: { user: { $size: 0 } }
      }
    ]);
    
    if (orphanedVets.length > 0) {
      const orphanedVetIds = orphanedVets.map(vet => vet._id);
      await VeterinarianModel.deleteMany({ _id: { $in: orphanedVetIds } });
      cleanupReport.orphanedVetsRemoved = orphanedVets.length;
      console.log(`   ✅ Removed ${orphanedVets.length} orphaned veterinarians`);
    } else {
      console.log('   ✅ No orphaned veterinarians found');
    }
    
    // 3. Remove invalid appointments
    console.log('\n📅 Cleaning invalid appointments...');
    const invalidAppointments = await AppointmentModel.aggregate([
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet'
        }
      },
      {
        $lookup: {
          from: 'veterinarians',
          localField: 'vetId',
          foreignField: '_id',
          as: 'vet'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $match: {
          $or: [
            { pet: { $size: 0 } },
            { vet: { $size: 0 } },
            { customer: { $size: 0 } }
          ]
        }
      }
    ]);
    
    if (invalidAppointments.length > 0) {
      const invalidAppointmentIds = invalidAppointments.map(apt => apt._id);
      await AppointmentModel.deleteMany({ _id: { $in: invalidAppointmentIds } });
      cleanupReport.invalidAppointmentsRemoved = invalidAppointments.length;
      console.log(`   ✅ Removed ${invalidAppointments.length} invalid appointments`);
    } else {
      console.log('   ✅ No invalid appointments found');
    }
    
    // 4. Clean old notifications
    console.log('\n🔔 Cleaning old notifications...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleteResult = await NotificationModel.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });
    
    cleanupReport.oldNotificationsRemoved = deleteResult.deletedCount;
    console.log(`   ✅ Removed ${deleteResult.deletedCount} old notifications`);
    
    console.log('\n🎉 DATABASE CLEANUP COMPLETE');
    console.log('============================');
    console.log(`📊 Cleanup Summary:`);
    console.log(`   🐕 Orphaned pets removed: ${cleanupReport.orphanedPetsRemoved}`);
    console.log(`   👨‍⚕️ Orphaned veterinarians removed: ${cleanupReport.orphanedVetsRemoved}`);
    console.log(`   📅 Invalid appointments removed: ${cleanupReport.invalidAppointmentsRemoved}`);
    console.log(`   🔔 Old notifications removed: ${cleanupReport.oldNotificationsRemoved}`);
    
    return cleanupReport;
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'analyze':
    analyzeDatabase().catch(console.error);
    break;
  case 'clean':
    cleanDatabase().catch(console.error);
    break;
  default:
    console.log('🗃️ DATABASE ARCHITECTURE CLEANUP');
    console.log('================================');
    console.log('Available commands:');
    console.log('  node scripts/database-cleanup.js analyze  - Analyze database integrity');
    console.log('  node scripts/database-cleanup.js clean    - Clean database issues');
    console.log('');
    console.log('⚠️  WARNING: Always run "analyze" before "clean"');
    console.log('   The clean operation will permanently delete problematic data');
}
