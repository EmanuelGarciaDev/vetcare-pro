// Quick test script to verify dashboard functionality
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const { UserModel, PetModel, VeterinarianModel, AppointmentModel } = require('./src/lib/models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function testDashboardData() {
  await connectDB();
  
  try {
    // Test user creation
    console.log('\n📊 Testing Dashboard Data...');
    
    // Check if we have test data
    const userCount = await UserModel.countDocuments();
    const petCount = await PetModel.countDocuments();
    const vetCount = await VeterinarianModel.countDocuments();
    const appointmentCount = await AppointmentModel.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🐕 Pets: ${petCount}`);
    console.log(`👨‍⚕️ Veterinarians: ${vetCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    
    // Get a sample user to test with
    const sampleUser = await UserModel.findOne();
    if (sampleUser) {
      console.log(`\n🧪 Testing with user: ${sampleUser.name} (${sampleUser.email})`);
      
      // Check user's pets
      const userPets = await PetModel.find({ ownerId: sampleUser._id });
      console.log(`🐾 User's pets: ${userPets.length}`);
      
      // Check user's appointments
      const userAppointments = await AppointmentModel.find({ customerId: sampleUser._id });
      console.log(`📋 User's appointments: ${userAppointments.length}`);
      
      // Test appointment with population
      const populatedAppointments = await AppointmentModel.find({ customerId: sampleUser._id })
        .populate('vetId', 'userId specializations consultationFee')
        .populate('petId', 'name species breed');
        
      console.log(`📋 Populated appointments: ${populatedAppointments.length}`);
      
      if (populatedAppointments.length > 0) {
        const apt = populatedAppointments[0];
        console.log(`   Sample appointment: ${apt.type} for ${apt.petId?.name} with Dr. ${apt.vetId?.userId?.name}`);
      }
    }
    
    console.log('\n✅ Dashboard data test completed successfully!');
  } catch (error) {
    console.error('❌ Dashboard test error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testDashboardData();
