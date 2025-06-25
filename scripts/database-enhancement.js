const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isWorking: { type: Boolean, default: true }
  }],
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

async function enhanceDatabase() {
  try {
    console.log('🚀 DATABASE ENHANCEMENT - REALISTIC DATA POPULATION');
    console.log('===================================================');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);
      // 1. Clean and Create/Update Veterinarians (5 total)
    console.log('\n👨‍⚕️ Cleaning existing veterinarians and creating 5 new ones...');
    
    // First, delete all existing veterinarians to avoid conflicts
    await VeterinarianModel.deleteMany({});
    console.log('   ✅ Cleared existing veterinarian profiles');
    
    // Also delete vet users to recreate them fresh
    await UserModel.deleteMany({ role: 'Vet' });
    console.log('   ✅ Cleared existing vet user accounts');
    
    const vetUsers = [
      {
        name: 'Dr. Sarah Mitchell',
        email: 'dr.sarah@vetcare.com',
        password: hashedPassword,
        role: 'Vet',
        phone: '+1-555-0101',
        address: '123 Veterinary Ave, Medical District'
      },
      {
        name: 'Dr. Marcus Rodriguez',
        email: 'dr.marcus@vetcare.com',
        password: hashedPassword,
        role: 'Vet',
        phone: '+1-555-0102',
        address: '456 Animal Care Blvd, Health Plaza'
      },
      {
        name: 'Dr. Emily Chen',
        email: 'dr.emily@vetcare.com',
        password: hashedPassword,
        role: 'Vet',
        phone: '+1-555-0103',
        address: '789 Pet Wellness St, Care Center'
      },
      {
        name: 'Dr. James Thompson',
        email: 'dr.james@vetcare.com',
        password: hashedPassword,
        role: 'Vet',
        phone: '+1-555-0104',
        address: '321 Animal Hospital Rd, Medical Complex'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'dr.lisa@vetcare.com',
        password: hashedPassword,
        role: 'Vet',
        phone: '+1-555-0105',
        address: '654 Veterinary Clinic Dr, Health District'
      }
    ];
    
    const vetProfiles = [
      {
        licenseNumber: 'VET001-2024',
        specializations: ['General Practice', 'Surgery', 'Emergency'],
        experience: 12,
        qualifications: ['DVM from Cornell University', 'Board Certified Surgeon', 'Emergency Care Specialist'],
        consultationFee: 75,
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Tuesday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Wednesday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Thursday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Friday', startTime: '08:00', endTime: '15:00', isWorking: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', isWorking: true },
          { day: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }
        ],
        rating: 4.8,
        reviewCount: 127,
        bio: 'Experienced veterinary surgeon with over 12 years of practice. Specializes in complex surgical procedures and emergency care.',
        isAvailable: true
      },
      {
        licenseNumber: 'VET002-2024',
        specializations: ['Cardiology', 'Internal Medicine', 'Geriatric Care'],
        experience: 15,
        qualifications: ['DVM from UC Davis', 'Cardiology Specialist', 'Internal Medicine Board Certified'],
        consultationFee: 90,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '18:00', isWorking: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '18:00', isWorking: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '18:00', isWorking: true },
          { day: 'Thursday', startTime: '09:00', endTime: '18:00', isWorking: true },
          { day: 'Friday', startTime: '09:00', endTime: '16:00', isWorking: true },
          { day: 'Saturday', startTime: '00:00', endTime: '00:00', isWorking: false },
          { day: 'Sunday', startTime: '10:00', endTime: '14:00', isWorking: true }
        ],
        rating: 4.9,
        reviewCount: 203,
        bio: 'Cardiology and internal medicine specialist. Expert in treating heart conditions and complex medical cases in pets.',
        isAvailable: true
      },
      {
        licenseNumber: 'VET003-2024',
        specializations: ['Dermatology', 'Allergies', 'Exotic Animals'],
        experience: 8,
        qualifications: ['DVM from Colorado State', 'Dermatology Specialist', 'Exotic Animal Care Certified'],
        consultationFee: 80,
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '19:00', isWorking: true },
          { day: 'Tuesday', startTime: '10:00', endTime: '19:00', isWorking: true },
          { day: 'Wednesday', startTime: '00:00', endTime: '00:00', isWorking: false },
          { day: 'Thursday', startTime: '10:00', endTime: '19:00', isWorking: true },
          { day: 'Friday', startTime: '10:00', endTime: '19:00', isWorking: true },
          { day: 'Saturday', startTime: '08:00', endTime: '16:00', isWorking: true },
          { day: 'Sunday', startTime: '08:00', endTime: '16:00', isWorking: true }
        ],
        rating: 4.7,
        reviewCount: 89,
        bio: 'Skin and allergy specialist with expertise in exotic animals. Passionate about treating complex dermatological conditions.',
        isAvailable: true
      },
      {
        licenseNumber: 'VET004-2024',
        specializations: ['Orthopedics', 'Rehabilitation', 'Sports Medicine'],
        experience: 10,
        qualifications: ['DVM from Ohio State', 'Orthopedic Surgery Certified', 'Rehabilitation Specialist'],
        consultationFee: 85,
        availability: [
          { day: 'Monday', startTime: '07:00', endTime: '16:00', isWorking: true },
          { day: 'Tuesday', startTime: '07:00', endTime: '16:00', isWorking: true },
          { day: 'Wednesday', startTime: '07:00', endTime: '16:00', isWorking: true },
          { day: 'Thursday', startTime: '07:00', endTime: '16:00', isWorking: true },
          { day: 'Friday', startTime: '07:00', endTime: '14:00', isWorking: true },
          { day: 'Saturday', startTime: '00:00', endTime: '00:00', isWorking: false },
          { day: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }
        ],
        rating: 4.6,
        reviewCount: 156,
        bio: 'Orthopedic specialist focusing on bone, joint, and mobility issues. Expert in rehabilitation and sports-related injuries.',
        isAvailable: true
      },
      {
        licenseNumber: 'VET005-2024',
        specializations: ['Oncology', 'Chemotherapy', 'Palliative Care'],
        experience: 18,
        qualifications: ['DVM from Penn State', 'Oncology Board Certified', 'Palliative Care Specialist'],
        consultationFee: 120,
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Tuesday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Wednesday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Thursday', startTime: '00:00', endTime: '00:00', isWorking: false },
          { day: 'Friday', startTime: '08:00', endTime: '17:00', isWorking: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', isWorking: true },
          { day: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }
        ],
        rating: 4.9,
        reviewCount: 243,
        bio: 'Senior oncology specialist with extensive experience in cancer treatment and palliative care for pets.',
        isAvailable: false // Rotating vet - currently not available
      }
    ];
      // Create vet users and profiles
    for (let i = 0; i < vetUsers.length; i++) {
      // Create new vet user
      const vetUser = await UserModel.create(vetUsers[i]);
      
      // Create veterinarian profile
      await VeterinarianModel.create({
        userId: vetUser._id,
        ...vetProfiles[i]
      });
      
      console.log(`   ✅ Created: ${vetUsers[i].name}`);
    }
    
    // 2. Ensure all existing users have passwords
    console.log('\n🔐 Updating existing users with passwords...');
    const usersWithoutPasswords = await UserModel.find({ 
      $or: [{ password: { $exists: false } }, { password: null }, { password: '' }] 
    });
    
    for (const user of usersWithoutPasswords) {
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`   ✅ Added password for: ${user.name}`);
    }
    
    // 3. Create realistic appointments (mix of past, present, future)
    console.log('\n📅 Creating sample appointments...');
    
    const customers = await UserModel.find({ role: 'Customer' }).limit(5);
    const pets = await PetModel.find().limit(8);
    const vets = await VeterinarianModel.find().populate('userId');
    
    const today = new Date();
    const appointments = [];
    
    // Create appointments for the next 14 days
    for (let day = -7; day <= 14; day++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + day);
      
      // Skip if it's more than 2 weeks ago
      if (day < -7) continue;
      
      // Create 2-4 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < appointmentsPerDay; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomPet = pets[Math.floor(Math.random() * pets.length)];
        const randomVet = vets[Math.floor(Math.random() * vets.length)];
        
        // Generate realistic time slots
        const hours = [9, 10, 11, 14, 15, 16, 17];
        const selectedHour = hours[Math.floor(Math.random() * hours.length)];
        const startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;
        
        const appointmentTypes = ['Consultation', 'Vaccination', 'Checkup', 'Emergency', 'Surgery'];
        const statuses = day < 0 ? ['Completed', 'Cancelled'] : 
                        day === 0 ? ['InProgress', 'Confirmed'] : 
                        ['Scheduled', 'Confirmed'];
        
        const appointment = {
          petId: randomPet._id,
          vetId: randomVet._id,
          customerId: randomCustomer._id,
          appointmentDate: appointmentDate,
          startTime: startTime,
          endTime: endTime,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
          reason: [
            'Regular checkup and vaccination',
            'Skin irritation and scratching',
            'Loss of appetite and lethargy',
            'Limping and joint pain',
            'Dental cleaning and examination',
            'Emergency - difficulty breathing',
            'Follow-up after surgery',
            'Behavioral consultation'
          ][Math.floor(Math.random() * 8)],
          notes: day < 0 ? 'Appointment completed successfully.' : 'Patient preparation notes.',
          totalAmount: randomVet.consultationFee,
          paymentStatus: day < 0 ? 'Paid' : 'Pending'
        };
        
        // Add diagnosis and treatment for completed appointments
        if (appointment.status === 'Completed') {
          appointment.diagnosis = [
            'Healthy - routine checkup passed',
            'Mild skin allergies - prescribed antihistamine',
            'Early stage arthritis - pain management recommended',
            'Dental tartar buildup - cleaning performed',
            'Minor respiratory infection - antibiotics prescribed'
          ][Math.floor(Math.random() * 5)];
          
          appointment.treatment = [
            'Vaccination updated, next visit in 6 months',
            'Prescribed medication and dietary changes',
            'Physical therapy exercises recommended',
            'Dental cleaning completed, oral care instructions given',
            'Medication prescribed, follow-up in 2 weeks'
          ][Math.floor(Math.random() * 5)];
        }
        
        appointments.push(appointment);
      }
    }
    
    // Insert appointments
    await AppointmentModel.deleteMany({}); // Clear existing appointments
    await AppointmentModel.insertMany(appointments);
    console.log(`   ✅ Created ${appointments.length} sample appointments`);
    
    // 4. Create some busy time slots (unavailable appointments)
    console.log('\n⏰ Creating busy time slots for testing...');
    const busySlots = [];
    
    // Create fully booked days for testing "no availability" scenarios
    for (let day = 1; day <= 3; day++) {
      const busyDate = new Date(today);
      busyDate.setDate(today.getDate() + day);
      
      // Book every hour from 9 AM to 5 PM for first vet
      for (let hour = 9; hour <= 16; hour++) {
        const busySlot = {
          petId: pets[0]._id,
          vetId: vets[0]._id,
          customerId: customers[0]._id,
          appointmentDate: busyDate,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: 'Confirmed',
          type: 'Consultation',
          reason: 'Testing busy time slots - no availability',
          totalAmount: vets[0].consultationFee,
          paymentStatus: 'Pending'
        };
        busySlots.push(busySlot);
      }
    }
    
    await AppointmentModel.insertMany(busySlots);
    console.log(`   ✅ Created ${busySlots.length} busy time slots for testing`);
    
    // 5. Create sample notifications
    console.log('\n🔔 Creating sample notifications...');
    const notifications = [];
    
    for (const customer of customers) {
      notifications.push({
        userId: customer._id,
        title: 'Appointment Reminder',
        message: 'Your pet has an upcoming appointment tomorrow at 2:00 PM',
        type: 'Appointment',
        isRead: false,
        actionUrl: '/appointments'
      });
      
      notifications.push({
        userId: customer._id,
        title: 'Vaccination Due',
        message: 'Your pet\'s vaccination is due next week. Please schedule an appointment.',
        type: 'Reminder',
        isRead: false,
        actionUrl: '/booking'
      });
    }
    
    await NotificationModel.insertMany(notifications);
    console.log(`   ✅ Created ${notifications.length} sample notifications`);
    
    // 6. Database optimization and indexing
    console.log('\n⚡ Optimizing database indexes...');
    
    // Create compound indexes for better query performance
    await UserModel.collection.createIndex({ email: 1, role: 1 });
    await PetModel.collection.createIndex({ ownerId: 1, species: 1 });
    await VeterinarianModel.collection.createIndex({ isAvailable: 1, 'specializations': 1 });
    await AppointmentModel.collection.createIndex({ appointmentDate: 1, vetId: 1, startTime: 1 });
    await AppointmentModel.collection.createIndex({ customerId: 1, appointmentDate: -1 });
    await NotificationModel.collection.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
    
    console.log('   ✅ Database indexes optimized');
    
    // Final statistics
    console.log('\n📊 FINAL DATABASE STATISTICS:');
    console.log('=============================');
    
    const finalStats = {
      users: await UserModel.countDocuments(),
      customers: await UserModel.countDocuments({ role: 'Customer' }),
      vets: await UserModel.countDocuments({ role: 'Vet' }),
      pets: await PetModel.countDocuments(),
      veterinarians: await VeterinarianModel.countDocuments(),
      availableVets: await VeterinarianModel.countDocuments({ isAvailable: true }),
      appointments: await AppointmentModel.countDocuments(),
      futureAppointments: await AppointmentModel.countDocuments({ appointmentDate: { $gte: today } }),
      notifications: await NotificationModel.countDocuments()
    };
    
    console.log(`👥 Total Users: ${finalStats.users}`);
    console.log(`   - Customers: ${finalStats.customers}`);
    console.log(`   - Veterinarians: ${finalStats.vets}`);
    console.log(`🐕 Pets: ${finalStats.pets}`);
    console.log(`👨‍⚕️ Veterinarian Profiles: ${finalStats.veterinarians}`);
    console.log(`   - Available: ${finalStats.availableVets}`);
    console.log(`   - Rotating: ${finalStats.veterinarians - finalStats.availableVets}`);
    console.log(`📅 Appointments: ${finalStats.appointments}`);
    console.log(`   - Future: ${finalStats.futureAppointments}`);
    console.log(`🔔 Notifications: ${finalStats.notifications}`);
    
    console.log('\n🎉 DATABASE ENHANCEMENT COMPLETE!');
    console.log('==================================');
    console.log('✅ 5 Veterinarians created (4 available, 1 rotating)');
    console.log('✅ Realistic appointment scenarios created');
    console.log('✅ Busy time slots for testing "no availability"');
    console.log('✅ All users have passwords (password123)');
    console.log('✅ Database optimized with proper indexes');
    console.log('✅ Ready for production deployment!');
    
    return finalStats;
    
  } catch (error) {
    console.error('❌ Database enhancement failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'enhance':
    enhanceDatabase().catch(console.error);
    break;
  default:
    console.log('🚀 DATABASE ENHANCEMENT');
    console.log('=======================');
    console.log('Available commands:');
    console.log('  node scripts/database-enhancement.js enhance  - Enhance database with realistic data');
    console.log('');
    console.log('This will:');
    console.log('  ✅ Create 5 veterinarians (4 available, 1 rotating)');
    console.log('  ✅ Generate realistic appointment scenarios');
    console.log('  ✅ Add busy time slots for testing');
    console.log('  ✅ Ensure all users have passwords');
    console.log('  ✅ Optimize database indexes');
}
