const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetcare-pro';

console.log('MongoDB URI:', MONGODB_URI);

async function createSampleVeterinarians() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const veterinariansCollection = db.collection('veterinarians');
    
    console.log('Clearing existing sample data...');
    
    // Clear existing sample data
    await usersCollection.deleteMany({ 
      email: { $in: ['sarah.johnson@vetcare.com', 'michael.chen@vetcare.com', 'emily.rodriguez@vetcare.com'] }
    });
    await veterinariansCollection.deleteMany({});
    
    // Sample veterinarian users
    const vetUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567891',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567892',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedUsers = await usersCollection.insertMany(vetUsers);
    console.log('Created veterinarian user accounts');
    
    // Sample veterinarian profiles
    const veterinarians = [
      {
        userId: insertedUsers.insertedIds[0],
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
        userId: insertedUsers.insertedIds[1],
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
        userId: insertedUsers.insertedIds[2],
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
      }
    ];
    
    await veterinariansCollection.insertMany(veterinarians);
    console.log('Created sample veterinarian profiles');
    
    console.log('Sample data created successfully!');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await client.close();
  }
}

createSampleVeterinarians();
