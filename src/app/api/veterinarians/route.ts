import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { VeterinarianModel } from '@/lib/models/Veterinarian';
import { AppointmentModel } from '@/lib/models/Appointment';
import { DaySchedule } from '@/types';

// GET /api/veterinarians - Get available veterinarians
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Temporary hardcoded data for testing
    const hardcodedVeterinarians = [
      {
        _id: '60d5f484f8d2e12345678901',
        userId: {
          _id: '60d5f484f8d2e12345678902',
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
        availableSlots: []
      },
      {
        _id: '60d5f484f8d2e12345678903',
        userId: {
          _id: '60d5f484f8d2e12345678904',
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
        availableSlots: []
      },
      {
        _id: '60d5f484f8d2e12345678905',
        userId: {
          _id: '60d5f484f8d2e12345678906',
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
        availableSlots: []
      }
    ];

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // If date is provided, generate time slots
    if (date) {
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      hardcodedVeterinarians.forEach(vet => {
        const daySchedule = vet.availability.find(
          (schedule: DaySchedule) => schedule.day === dayName && schedule.isWorking
        );

        if (daySchedule) {
          vet.availableSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: hardcodedVeterinarians
    });

    // Original database code (commented out for testing)
    /*
    await connectDB();

    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const date = searchParams.get('date');    // Build query filter
    const filter: Record<string, boolean | object> = { isAvailable: true };
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    const veterinarians = await VeterinarianModel.find(filter)
      .populate('userId', 'name email image')
      .sort({ rating: -1 });

    // If date is provided, get available time slots for each vet
    if (date && veterinarians.length > 0) {
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      const vetsWithSlots = await Promise.all(
        veterinarians.map(async (vet) => {          // Get vet's schedule for the day
          const daySchedule = vet.availability.find(
            (schedule: DaySchedule) => schedule.day === dayName && schedule.isWorking
          );

          if (!daySchedule) {
            return { ...vet.toObject(), availableSlots: [] };
          }

          // Generate time slots (30-minute intervals)
          const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);

          // Get existing appointments for this vet on this date
          const existingAppointments = await AppointmentModel.find({
            veterinarianId: vet._id,
            appointmentDate: {
              $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['Scheduled', 'Confirmed'] }
          });

          // Filter out booked slots
          const bookedTimes = existingAppointments.map(apt => 
            apt.appointmentDate.toTimeString().substring(0, 5)
          );

          const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

          return { 
            ...vet.toObject(), 
            availableSlots,
            workingHours: {
              start: daySchedule.startTime,
              end: daySchedule.endTime
            }
          };
        })
      );

      return NextResponse.json({ 
        success: true, 
        data: vetsWithSlots 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: veterinarians 
    });

  } catch (error) {
    console.error('Get veterinarians error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch veterinarians' },
      { status: 500 }
    );
  }
}

// Helper function to generate time slots
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  while (current < end) {
    slots.push(formatTime(current));
    current += 30; // 30-minute intervals
  }
  
  return slots;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
