const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

console.log('Loading environment variables...');
const uri = process.env.MONGODB_URI;
console.log('MongoDB URI:', uri ? 'Found' : 'Not found');

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const sampleVeterinarians = [
  {
    userId: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@vetcare.com',
      image: null
    },
    licenseNumber: 'VET-2023-001',
    specializations: ['General Practice', 'Surgery'],
    experience: 8,
    qualifications: ['DVM from Cornell University', 'Board Certified Surgeon'],
    consultationFee: 150,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { day: 'Friday', startTime: '09:00', endTime: '15:00', isWorking: true },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00', isWorking: true },
      { day: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }
    ],
    rating: 4.8,
    reviewCount: 124,
    bio: 'Dr. Sarah Johnson is a highly experienced veterinarian specializing in general practice and surgical procedures.',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@vetcare.com',
      image: null
    },
    licenseNumber: 'VET-2023-002',
    specializations: ['Internal Medicine', 'Cardiology'],
    experience: 12,
    qualifications: ['DVM from UC Davis', 'Cardiology Specialist'],
    consultationFee: 180,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { day: 'Friday', startTime: '08:00', endTime: '12:00', isWorking: true },
      { day: 'Saturday', startTime: '00:00', endTime: '00:00', isWorking: false },
      { day: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }
    ],
    rating: 4.9,
    reviewCount: 89,
    bio: 'Dr. Michael Chen specializes in internal medicine and cardiology with over 12 years of experience.',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@vetcare.com',
      image: null
    },
    licenseNumber: 'VET-2023-003',
    specializations: ['Dermatology', 'Exotic Animals'],
    experience: 6,
    qualifications: ['DVM from Texas A&M', 'Dermatology Certification'],
    consultationFee: 160,
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { day: 'Friday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00', isWorking: true },
      { day: 'Sunday', startTime: '11:00', endTime: '15:00', isWorking: true }
    ],
    rating: 4.7,
    reviewCount: 156,
    bio: 'Dr. Emily Rodriguez is a dermatology specialist with expertise in treating exotic animals.',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: {
      name: 'Dr. James Wilson',
      email: 'james.wilson@vetcare.com',
      image: null
    },
    licenseNumber: 'VET-2023-004',
    specializations: ['Emergency Medicine', 'Critical Care'],
    experience: 15,
    qualifications: ['DVM from University of Pennsylvania', 'Emergency Medicine Certification'],
    consultationFee: 200,
    availability: [
      { day: 'Monday', startTime: '07:00', endTime: '19:00', isWorking: true },
      { day: 'Tuesday', startTime: '07:00', endTime: '19:00', isWorking: true },
      { day: 'Wednesday', startTime: '07:00', endTime: '19:00', isWorking: true },
      { day: 'Thursday', startTime: '07:00', endTime: '19:00', isWorking: true },
      { day: 'Friday', startTime: '07:00', endTime: '17:00', isWorking: true },
      { day: 'Saturday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { day: 'Sunday', startTime: '08:00', endTime: '16:00', isWorking: true }
    ],
    rating: 4.9,
    reviewCount: 203,
    bio: 'Dr. James Wilson is an emergency medicine specialist with extensive experience in critical care and emergency procedures.',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function populateVeterinarians() {
  console.log('Creating MongoDB client...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('vetcare-pro');
    const collection = db.collection('veterinarians');
    console.log('Using database: vetcare-pro, collection: veterinarians');
    
    // Check if veterinarians already exist
    console.log('Checking for existing veterinarians...');
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing veterinarians. Clearing collection...`);
      await collection.deleteMany({});
      console.log('Collection cleared.');
    }
    
    // Insert sample veterinarians
    console.log('Inserting sample veterinarians...');
    const result = await collection.insertMany(sampleVeterinarians);
    console.log(`✅ Successfully inserted ${result.insertedCount} veterinarians`);
    
    // Create indexes for better performance
    console.log('Creating database indexes...');
    await collection.createIndex({ 'userId.email': 1 }, { unique: true });
    await collection.createIndex({ specializations: 1 });
    await collection.createIndex({ isAvailable: 1 });
    await collection.createIndex({ rating: -1 });
    
    console.log('✅ Indexes created successfully');
    
    // Verify the data
    console.log('Verifying inserted data...');
    const veterinarians = await collection.find({}).toArray();
    console.log('\n📋 Created veterinarians:');
    veterinarians.forEach((vet, index) => {
      console.log(`${index + 1}. Dr. ${vet.userId.name} - ${vet.specializations.join(', ')} (${vet.experience} years)`);
    });
    
    console.log(`\n🎉 Database setup complete! ${veterinarians.length} veterinarians ready for appointments.`);
    
  } catch (error) {
    console.error('❌ Error populating veterinarians:', error);
    process.exit(1);
  } finally {
    console.log('Closing database connection...');
    await client.close();
    console.log('Connection closed.');
  }
}

console.log('Starting veterinarian population script...');
populateVeterinarians()
  .then(() => {
    console.log('Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
