import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { VeterinarianModel } from '@/lib/models/Veterinarian';
import bcrypt from 'bcryptjs';

export async function POST() {
  return createSampleData();
}

export async function GET() {
  return createSampleData();
}

async function createSampleData() {
  try {
    await connectDB();
    
    // Clear existing sample data
    await UserModel.deleteMany({ 
      email: { $in: ['sarah.johnson@vetcare.com', 'michael.chen@vetcare.com', 'emily.rodriguez@vetcare.com'] }
    });
    await VeterinarianModel.deleteMany({});
    
    // Create veterinarian users
    const vetUsers = await Promise.all([
      UserModel.create({
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567890',
      }),
      UserModel.create({
        name: 'Dr. Michael Chen',
        email: 'michael.chen@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567891',
      }),
      UserModel.create({
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@vetcare.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Vet',
        phone: '+1234567892',
      })
    ]);
    
    // Create veterinarian profiles
    const veterinarians = await Promise.all([
      VeterinarianModel.create({
        userId: vetUsers[0]._id,
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
      }),
      VeterinarianModel.create({
        userId: vetUsers[1]._id,
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
      }),
      VeterinarianModel.create({
        userId: vetUsers[2]._id,
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
      })
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        users: vetUsers.length,
        veterinarians: veterinarians.length
      }
    });
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(      { success: false, error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}
